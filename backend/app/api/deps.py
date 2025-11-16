"""
API dependencies for authentication and authorization
"""
from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.services.auth_service import auth_service

# HTTP Bearer token security scheme
security = HTTPBearer()
optional_security = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    """
    Dependency to get the current authenticated user from the JWT token
    """
    token = credentials.credentials

    # Verify and decode the token
    payload = auth_service.verify_token(token)

    # Verify it's an access token
    if payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Get user ID from token
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Get user from database
    user = auth_service.get_user_by_id(db, user_id)
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

    return user


def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Dependency to get the current active user
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user",
        )
    return current_user


def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(optional_security),
    db: Session = Depends(get_db),
) -> Optional[User]:
    """
    Dependency to get the current user if authenticated, None otherwise.
    Used for endpoints that support both authenticated and anonymous access.
    """
    if credentials is None:
        return None

    try:
        token = credentials.credentials

        # Verify and decode the token
        payload = auth_service.verify_token(token)

        # Verify it's an access token
        if payload.get("type") != "access":
            return None

        # Get user ID from token
        user_id = payload.get("sub")
        if not user_id:
            return None

        # Get user from database
        user = auth_service.get_user_by_id(db, user_id)
        if not user or not user.is_active:
            return None

        return user
    except Exception:
        # If any error occurs during authentication, treat as anonymous
        return None
