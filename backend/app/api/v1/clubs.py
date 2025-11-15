"""
Club endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import math

from app.database import get_db
from app.schemas.club import (
    ClubCreate,
    ClubUpdate,
    ClubResponse,
    ClubListResponse,
    MembershipCreate,
    MembershipResponse,
)
from app.services.club_service import club_service, membership_service
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()


@router.get("/", response_model=ClubListResponse)
async def get_clubs(
    category: Optional[str] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Get all clubs with optional filtering

    - **category**: Filter by category (cocurricular, extracurricular, department)
    - **search**: Search clubs by name, tagline, or description
    - **page**: Page number (default: 1)
    - **per_page**: Items per page (default: 50, max: 100)

    Returns paginated list of clubs
    """
    skip = (page - 1) * per_page

    clubs, total = club_service.get_clubs(
        db,
        category=category,
        search=search,
        skip=skip,
        limit=per_page
    )

    pages = math.ceil(total / per_page) if total > 0 else 1

    return ClubListResponse(
        clubs=[ClubResponse.model_validate(club) for club in clubs],
        total=total,
        page=page,
        per_page=per_page,
        pages=pages
    )


@router.get("/featured", response_model=List[ClubResponse])
async def get_featured_clubs(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """
    Get featured clubs

    - **limit**: Maximum number of clubs to return (default: 10, max: 50)

    Returns list of featured clubs
    """
    clubs = club_service.get_featured_clubs(db, limit=limit)
    return [ClubResponse.model_validate(club) for club in clubs]


@router.get("/popular", response_model=List[ClubResponse])
async def get_popular_clubs(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """
    Get popular clubs by member count

    - **limit**: Maximum number of clubs to return (default: 10, max: 50)

    Returns list of popular clubs
    """
    clubs = club_service.get_popular_clubs(db, limit=limit)
    return [ClubResponse.model_validate(club) for club in clubs]


@router.get("/{slug}", response_model=ClubResponse)
async def get_club(slug: str, db: Session = Depends(get_db)):
    """
    Get club by slug

    - **slug**: Club slug (e.g., "acm", "ieee", "dance")

    Returns club details
    """
    club = club_service.get_club_by_slug(db, slug)

    if not club:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Club not found"
        )

    # Increment view count
    club_service.increment_view_count(db, str(club.id))

    return ClubResponse.model_validate(club)


@router.post("/", response_model=ClubResponse, status_code=status.HTTP_201_CREATED)
async def create_club(
    club_data: ClubCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new club

    Requires authentication.

    - **name**: Club name (unique)
    - **slug**: Club slug (unique, lowercase with hyphens)
    - **category**: Club category
    - **tagline**: Short description
    - **description**: Full description
    - **overview**: Detailed overview
    - Other optional fields

    Returns created club
    """
    # TODO: Add admin check in production
    club = club_service.create_club(db, club_data)
    return ClubResponse.model_validate(club)


@router.patch("/{club_id}", response_model=ClubResponse)
async def update_club(
    club_id: str,
    club_data: ClubUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update a club

    Requires authentication.

    - **club_id**: UUID of the club to update

    Returns updated club
    """
    # TODO: Add admin check in production
    club = club_service.update_club(db, club_id, club_data)

    if not club:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Club not found"
        )

    return ClubResponse.model_validate(club)


@router.delete("/{club_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_club(
    club_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a club

    Requires authentication.

    - **club_id**: UUID of the club to delete

    Returns 204 No Content on success
    """
    # TODO: Add admin check in production
    success = club_service.delete_club(db, club_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Club not found"
        )


# Membership endpoints

@router.post("/{club_id}/join", response_model=MembershipResponse)
async def join_club(
    club_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Join a club

    Requires authentication.

    - **club_id**: UUID of the club to join

    Returns membership details
    """
    membership = membership_service.join_club(db, str(current_user.id), club_id)
    return MembershipResponse.model_validate(membership)


@router.delete("/{club_id}/leave", status_code=status.HTTP_204_NO_CONTENT)
async def leave_club(
    club_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Leave a club

    Requires authentication.

    - **club_id**: UUID of the club to leave

    Returns 204 No Content on success
    """
    success = membership_service.leave_club(db, str(current_user.id), club_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Membership not found"
        )
