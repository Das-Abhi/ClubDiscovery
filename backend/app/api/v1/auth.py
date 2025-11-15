"""
Authentication endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.user import (
    UserCreate,
    UserLogin,
    UserResponse,
    TokenResponse,
    TokenRefresh,
)
from app.services.auth_service import auth_service
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user with BMSCE email validation

    - **email**: BMSCE email address (@bmsce.ac.in)
    - **password**: Strong password (min 8 chars, with uppercase, lowercase, digit)
    - **full_name**: User's full name

    Returns access token, refresh token, and user data
    """
    try:
        # Create new user
        user = auth_service.create_user(db, user_data)

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
async def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """
    Login with email and password

    - **email**: BMSCE email address
    - **password**: User's password

    Returns access token, refresh token, and user data
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
async def refresh_token(token_data: TokenRefresh, db: Session = Depends(get_db)):
    """
    Refresh access token using refresh token

    - **refresh_token**: Valid refresh token

    Returns new access token and refresh token
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
