"""
Favorites endpoints for managing user's favorited clubs
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List
from uuid import UUID

from app.database import get_db
from app.schemas.club import FavoriteCreate, FavoriteResponse, ClubResponse
from app.api.deps import get_current_user
from app.models.user import User
from app.models.club import Favorite, Club

router = APIRouter()


@router.get("/", response_model=List[FavoriteResponse])
async def get_user_favorites(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current user's favorited clubs

    Requires authentication.

    Returns list of favorited clubs with club details
    """
    favorites = db.query(Favorite).filter(
        Favorite.user_id == current_user.id
    ).order_by(Favorite.created_at.desc()).all()

    # Manually load club relationships for each favorite
    result = []
    for fav in favorites:
        club = db.query(Club).filter(Club.id == fav.club_id).first()
        fav_dict = {
            "id": fav.id,
            "user_id": fav.user_id,
            "club_id": fav.club_id,
            "created_at": fav.created_at,
            "club": ClubResponse.model_validate(club) if club else None
        }
        result.append(FavoriteResponse(**fav_dict))

    return result


@router.post("/", response_model=FavoriteResponse, status_code=status.HTTP_201_CREATED)
async def add_favorite(
    favorite_data: FavoriteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add a club to favorites

    Requires authentication.

    - **club_id**: UUID of the club to favorite

    Returns the created favorite
    """
    # Check if club exists
    club = db.query(Club).filter(Club.id == favorite_data.club_id).first()
    if not club:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Club not found"
        )

    # Check if already favorited
    existing_favorite = db.query(Favorite).filter(
        and_(
            Favorite.user_id == current_user.id,
            Favorite.club_id == favorite_data.club_id
        )
    ).first()

    if existing_favorite:
        # Return existing favorite instead of error for idempotency
        return FavoriteResponse.model_validate(existing_favorite)

    # Create new favorite
    new_favorite = Favorite(
        user_id=current_user.id,
        club_id=favorite_data.club_id
    )

    db.add(new_favorite)
    db.commit()
    db.refresh(new_favorite)

    # Load club relationship
    club = db.query(Club).filter(Club.id == new_favorite.club_id).first()
    fav_dict = {
        "id": new_favorite.id,
        "user_id": new_favorite.user_id,
        "club_id": new_favorite.club_id,
        "created_at": new_favorite.created_at,
        "club": ClubResponse.model_validate(club) if club else None
    }

    return FavoriteResponse(**fav_dict)


@router.delete("/{club_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_favorite(
    club_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Remove a club from favorites

    Requires authentication.

    - **club_id**: UUID of the club to unfavorite

    Returns 204 No Content on success
    """
    favorite = db.query(Favorite).filter(
        and_(
            Favorite.user_id == current_user.id,
            Favorite.club_id == club_id
        )
    ).first()

    if not favorite:
        # Return 204 for idempotency (already doesn't exist)
        return

    db.delete(favorite)
    db.commit()

    return


@router.get("/check/{club_id}", response_model=dict)
async def check_favorite(
    club_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Check if a club is favorited by current user

    Requires authentication.

    - **club_id**: UUID of the club to check

    Returns {"is_favorited": true/false}
    """
    favorite = db.query(Favorite).filter(
        and_(
            Favorite.user_id == current_user.id,
            Favorite.club_id == club_id
        )
    ).first()

    return {"is_favorited": favorite is not None}
