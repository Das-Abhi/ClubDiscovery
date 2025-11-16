"""
Admin authorization middleware
"""
from fastapi import Depends, HTTPException, status
from app.api.deps import get_current_user
from app.models.user import User


async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """
    Dependency that requires the user to be an admin.
    Raises 403 if user is not an admin.
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required. You do not have sufficient permissions."
        )
    return current_user
