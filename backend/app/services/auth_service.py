"""
Authentication service for user registration and login
"""
from datetime import timedelta, datetime
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, TokenResponse
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.core.config import settings
from app.services.email_service import email_service


class AuthService:
    """Service for handling authentication operations"""

    @staticmethod
    def get_user_by_email(db: Session, email: str) -> Optional[User]:
        """Get user by email"""
        return db.query(User).filter(User.email == email.lower()).first()

    @staticmethod
    def get_user_by_id(db: Session, user_id: str) -> Optional[User]:
        """Get user by ID"""
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def create_user(db: Session, user_data: UserCreate) -> User:
        """Create a new user"""
        # Check if user already exists
        existing_user = AuthService.get_user_by_email(db, user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User with this email already exists",
            )

        # Create new user
        db_user = User(
            email=user_data.email.lower(),
            password_hash=get_password_hash(user_data.password),
            full_name=user_data.full_name,
        )

        db.add(db_user)
        db.commit()
        db.refresh(db_user)

        return db_user

    @staticmethod
    def authenticate_user(db: Session, credentials: UserLogin) -> Optional[User]:
        """Authenticate user with email and password"""
        user = AuthService.get_user_by_email(db, credentials.email)

        if not user:
            return None

        if not verify_password(credentials.password, user.password_hash):
            return None

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive",
            )

        return user

    @staticmethod
    def create_tokens(user: User) -> dict:
        """Create access and refresh tokens for user"""
        access_token = create_access_token(
            data={"sub": str(user.id), "email": user.email}
        )
        refresh_token = create_refresh_token(data={"sub": str(user.id)})

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
        }

    @staticmethod
    def verify_token(token: str) -> dict:
        """Verify and decode JWT token"""
        try:
            payload = decode_token(token)
            return payload
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
                headers={"WWW-Authenticate": "Bearer"},
            ) from e

    @staticmethod
    def refresh_access_token(db: Session, refresh_token: str) -> dict:
        """Create new access token from refresh token"""
        try:
            payload = decode_token(refresh_token)

            # Verify it's a refresh token
            if payload.get("type") != "refresh":
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token type",
                )

            # Get user from database
            user_id = payload.get("sub")
            user = AuthService.get_user_by_id(db, user_id)

            if not user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User not found",
                )

            if not user.is_active:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="User account is inactive",
                )

            # Create new tokens
            return AuthService.create_tokens(user)

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token",
            ) from e

    @staticmethod
    def request_password_reset(db: Session, email: str) -> bool:
        """
        Generate password reset token and send reset email

        Args:
            db: Database session
            email: User email address

        Returns:
            True if email sent successfully
        """
        user = AuthService.get_user_by_email(db, email)

        if not user:
            # Don't reveal whether email exists for security
            return True

        # Generate reset token
        reset_token = email_service.generate_token()
        token_expiry = email_service.get_token_expiry(hours=1)  # 1 hour expiry

        # Store token in database
        user.reset_password_token = reset_token
        user.reset_password_token_expires = token_expiry
        db.commit()

        # Send password reset email
        email_service.send_password_reset_email(
            to_email=user.email,
            full_name=user.full_name,
            reset_token=reset_token
        )

        return True

    @staticmethod
    def reset_password(db: Session, token: str, new_password: str) -> bool:
        """
        Reset user password using reset token

        Args:
            db: Database session
            token: Password reset token
            new_password: New password

        Returns:
            True if password reset successfully
        """
        # Find user with this reset token
        user = db.query(User).filter(
            User.reset_password_token == token
        ).first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset token",
            )

        # Check if token has expired
        if user.reset_password_token_expires < datetime.utcnow():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Reset token has expired",
            )

        # Update password
        user.password_hash = get_password_hash(new_password)

        # Clear reset token
        user.reset_password_token = None
        user.reset_password_token_expires = None

        db.commit()

        return True

    @staticmethod
    def generate_verification_token(db: Session, user: User) -> str:
        """
        Generate email verification token

        Args:
            db: Database session
            user: User object

        Returns:
            Verification token
        """
        # Generate verification token
        verification_token = email_service.generate_token()
        token_expiry = email_service.get_token_expiry(hours=24)  # 24 hour expiry

        # Store token in database
        user.email_verification_token = verification_token
        user.email_verification_token_expires = token_expiry
        db.commit()

        return verification_token

    @staticmethod
    def send_verification_email(db: Session, user: User) -> bool:
        """
        Send email verification email to user

        Args:
            db: Database session
            user: User object

        Returns:
            True if email sent successfully
        """
        # Generate verification token
        verification_token = AuthService.generate_verification_token(db, user)

        # Send verification email
        return email_service.send_verification_email(
            to_email=user.email,
            full_name=user.full_name,
            verification_token=verification_token
        )

    @staticmethod
    def verify_email(db: Session, token: str) -> bool:
        """
        Verify user email using verification token

        Args:
            db: Database session
            token: Email verification token

        Returns:
            True if email verified successfully
        """
        # Find user with this verification token
        user = db.query(User).filter(
            User.email_verification_token == token
        ).first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired verification token",
            )

        # Check if token has expired
        if user.email_verification_token_expires < datetime.utcnow():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Verification token has expired",
            )

        # Mark email as verified
        user.email_verified = True

        # Clear verification token
        user.email_verification_token = None
        user.email_verification_token_expires = None

        db.commit()

        # Send welcome email
        email_service.send_welcome_email(
            to_email=user.email,
            full_name=user.full_name
        )

        return True


# Create singleton instance
auth_service = AuthService()
