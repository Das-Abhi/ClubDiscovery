"""
User endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.schemas.user import UserResponse, UserUpdate
from app.schemas.club import MembershipResponse
from app.services.club_service import membership_service
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """
    Get current user profile

    Requires authentication.

    Returns current user data
    """
    return UserResponse.model_validate(current_user)


@router.patch("/me", response_model=UserResponse)
async def update_current_user_profile(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update current user profile

    Requires authentication.

    - **full_name**: Updated full name
    - **email**: Updated email (must be BMSCE email)

    Returns updated user data
    """
    # Update only provided fields
    update_data = user_data.model_dump(exclude_unset=True)

    # Check if email is being changed and if it already exists
    if "email" in update_data and update_data["email"] != current_user.email:
        existing_user = db.query(User).filter(User.email == update_data["email"]).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already in use"
            )

    for field, value in update_data.items():
        setattr(current_user, field, value)

    db.commit()
    db.refresh(current_user)

    return UserResponse.model_validate(current_user)


@router.get("/me/memberships", response_model=List[MembershipResponse])
async def get_current_user_memberships(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current user's club memberships

    Requires authentication.

    Returns list of club memberships
    """
    memberships = membership_service.get_user_memberships(db, str(current_user.id))
    return [MembershipResponse.model_validate(m) for m in memberships]
