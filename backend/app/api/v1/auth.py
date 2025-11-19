"""
Authentication endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.user import (
    UserCreate,
    UserLogin,
    UserResponse,
    TokenResponse,
    TokenRefresh,
    PasswordResetRequest,
    PasswordResetConfirm,
    EmailVerificationRequest,
)
from app.services.auth_service import auth_service
from app.api.deps import get_current_user
from app.models.user import User
from app.middleware.rate_limit import limiter

router = APIRouter()


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("3/hour")  # Strict rate limit: 3 registrations per hour per IP
async def register(request: Request, user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user with BMSCE email validation

    - **email**: BMSCE email address (@bmsce.ac.in)
    - **password**: Strong password (min 8 chars, with uppercase, lowercase, digit)
    - **full_name**: User's full name

    Returns access token, refresh token, and user data

    **Rate Limit:** 3 requests per hour per IP
    """
    try:
        # Create new user
        user = auth_service.create_user(db, user_data)

        # Send verification email (async, don't fail if email fails)
        try:
            auth_service.send_verification_email(db, user)
        except Exception as email_error:
            print(f"Failed to send verification email: {email_error}")

        # Create tokens
        tokens = auth_service.create_tokens(user)

        # Return token response with user data
        return TokenResponse(
            access_token=tokens["access_token"],
            refresh_token=tokens["refresh_token"],
            token_type=tokens["token_type"],
            user=UserResponse.model_validate(user),
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}",
        ) from e


@router.post("/login", response_model=TokenResponse)
@limiter.limit("10/minute")  # Rate limit: 10 login attempts per minute per IP
async def login(request: Request, credentials: UserLogin, db: Session = Depends(get_db)):
    """
    Login with email and password

    - **email**: BMSCE email address
    - **password**: User's password

    Returns access token, refresh token, and user data

    **Rate Limit:** 10 requests per minute per IP
    """
    # Authenticate user
    user = auth_service.authenticate_user(db, credentials)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create tokens
    tokens = auth_service.create_tokens(user)

    # Return token response with user data
    return TokenResponse(
        access_token=tokens["access_token"],
        refresh_token=tokens["refresh_token"],
        token_type=tokens["token_type"],
        user=UserResponse.model_validate(user),
    )


@router.post("/refresh", response_model=dict)
@limiter.limit("20/minute")  # Rate limit: 20 refresh requests per minute per IP
async def refresh_token(request: Request, token_data: TokenRefresh, db: Session = Depends(get_db)):
    """
    Refresh access token using refresh token

    - **refresh_token**: Valid refresh token

    Returns new access token and refresh token

    **Rate Limit:** 20 requests per minute per IP
    """
    try:
        tokens = auth_service.refresh_access_token(db, token_data.refresh_token)
        return tokens
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token refresh failed",
        ) from e


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """
    Get current user profile

    Requires valid access token in Authorization header

    Returns current user data
    """
    return UserResponse.model_validate(current_user)


@router.post("/password-reset/request", status_code=status.HTTP_200_OK)
@limiter.limit("3/hour")  # Strict rate limit: 3 password reset requests per hour per IP
async def request_password_reset(
    request: Request,
    reset_request: PasswordResetRequest,
    db: Session = Depends(get_db)
):
    """
    Request password reset email

    - **email**: BMSCE email address

    Sends password reset email if user exists

    **Rate Limit:** 3 requests per hour per IP
    """
    auth_service.request_password_reset(db, reset_request.email)

    # Always return success to not reveal whether email exists
    return {
        "message": "If an account with that email exists, a password reset link has been sent."
    }


@router.post("/password-reset/confirm", status_code=status.HTTP_200_OK)
@limiter.limit("5/hour")  # Rate limit: 5 password reset confirmations per hour per IP
async def confirm_password_reset(
    request: Request,
    reset_confirm: PasswordResetConfirm,
    db: Session = Depends(get_db)
):
    """
    Reset password using reset token

    - **token**: Password reset token from email
    - **new_password**: New password (min 8 chars, with uppercase, lowercase, digit)

    Returns success message

    **Rate Limit:** 5 requests per hour per IP
    """
    try:
        auth_service.reset_password(db, reset_confirm.token, reset_confirm.new_password)
        return {"message": "Password has been reset successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to reset password",
        ) from e


@router.post("/email/send-verification", status_code=status.HTTP_200_OK)
@limiter.limit("3/hour")  # Rate limit: 3 verification emails per hour
async def send_verification_email(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Send email verification email to current user

    Requires valid access token in Authorization header

    **Rate Limit:** 3 requests per hour per IP
    """
    if current_user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already verified",
        )

    auth_service.send_verification_email(db, current_user)

    return {"message": "Verification email has been sent"}


@router.post("/email/verify", status_code=status.HTTP_200_OK)
@limiter.limit("5/hour")  # Rate limit: 5 verifications per hour per IP
async def verify_email(
    request: Request,
    verification: EmailVerificationRequest,
    db: Session = Depends(get_db)
):
    """
    Verify email using verification token

    - **token**: Email verification token from email

    Returns success message

    **Rate Limit:** 5 requests per hour per IP
    """
    try:
        auth_service.verify_email(db, verification.token)
        return {"message": "Email has been verified successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to verify email",
        ) from e
