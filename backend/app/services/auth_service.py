"""
Authentication service for user registration and login
"""
from datetime import timedelta
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


# Create singleton instance
auth_service = AuthService()
