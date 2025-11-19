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
    AnnouncementCreate,
    AnnouncementUpdate,
    AnnouncementResponse,
    GallerySettingsCreate,
    GallerySettingsUpdate,
    GallerySettingsResponse,
)
from app.services.club_service import club_service, membership_service, announcement_service, gallery_service
from app.api.deps import get_current_user
from app.models.user import User
from app.middleware.admin import require_admin

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
    current_user: User = Depends(require_admin)
):
    """
    Create a new club (Admin only)

    Requires admin authentication.

    - **name**: Club name (unique)
    - **slug**: Club slug (unique, lowercase with hyphens)
    - **category**: Club category
    - **tagline**: Short description
    - **description**: Full description
    - **overview**: Detailed overview
    - Other optional fields

    Returns created club
    """
    club = club_service.create_club(db, club_data)
    return ClubResponse.model_validate(club)


@router.patch("/{club_id}", response_model=ClubResponse)
async def update_club(
    club_id: str,
    club_data: ClubUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Update a club (Admin only)

    Requires admin authentication.

    - **club_id**: UUID of the club to update

    Returns updated club
    """
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
    current_user: User = Depends(require_admin)
):
    """
    Delete a club (Admin only)

    Requires admin authentication.

    - **club_id**: UUID of the club to delete

    Returns 204 No Content on success
    """
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


# Announcement endpoints

@router.get("/{club_id}/announcements", response_model=List[AnnouncementResponse])
async def get_club_announcements(
    club_id: str,
    is_published: Optional[bool] = Query(True, description="Filter by publication status"),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """
    Get announcements for a club

    - **club_id**: UUID of the club
    - **is_published**: Filter by publication status (default: true)
    - **limit**: Maximum number of announcements to return (default: 10, max: 50)

    Returns list of announcements
    """
    announcements = announcement_service.get_club_announcements(
        db,
        club_id,
        is_published=is_published,
        limit=limit
    )
    return [AnnouncementResponse.model_validate(a) for a in announcements]


@router.post("/{club_id}/announcements", response_model=AnnouncementResponse, status_code=status.HTTP_201_CREATED)
async def create_announcement(
    club_id: str,
    title: str,
    content: str,
    is_published: bool = True,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Create a new announcement for a club (Admin only)

    Requires admin authentication.

    - **club_id**: UUID of the club
    - **title**: Announcement title
    - **content**: Announcement content
    - **is_published**: Publication status (default: true)

    Returns created announcement
    """
    from uuid import UUID
    announcement_data = AnnouncementCreate(
        club_id=UUID(club_id),
        title=title,
        content=content,
        is_published=is_published
    )
    announcement = announcement_service.create_announcement(
        db,
        announcement_data,
        str(current_user.id)
    )
    return AnnouncementResponse.model_validate(announcement)


@router.patch("/announcements/{announcement_id}", response_model=AnnouncementResponse)
async def update_announcement(
    announcement_id: str,
    announcement_data: AnnouncementUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Update an announcement (Admin only)

    Requires admin authentication.

    - **announcement_id**: UUID of the announcement to update

    Returns updated announcement
    """
    announcement = announcement_service.update_announcement(
        db,
        announcement_id,
        announcement_data
    )

    if not announcement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Announcement not found"
        )

    return AnnouncementResponse.model_validate(announcement)


@router.delete("/announcements/{announcement_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_announcement(
    announcement_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Delete an announcement (Admin only)

    Requires admin authentication.

    - **announcement_id**: UUID of the announcement to delete

    Returns 204 No Content on success
    """
    success = announcement_service.delete_announcement(db, announcement_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Announcement not found"
        )


# Gallery/Instagram endpoints

@router.get("/{club_id}/gallery", response_model=GallerySettingsResponse)
async def get_club_gallery(
    club_id: str,
    db: Session = Depends(get_db)
):
    """
    Get gallery settings and cached posts for a club

    - **club_id**: UUID of the club

    Returns gallery settings with cached Instagram posts
    """
    settings = gallery_service.get_gallery_settings_by_club_id(db, club_id)

    if not settings:
        # Return empty settings if not configured
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gallery settings not found for this club"
        )

    return GallerySettingsResponse.model_validate(settings)


@router.post("/{club_id}/gallery", response_model=GallerySettingsResponse)
async def create_or_update_gallery_settings(
    club_id: str,
    instagram_username: Optional[str] = None,
    display_gallery: bool = True,
    max_posts: int = 4,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Create or update gallery settings for a club (Admin only)

    Requires admin authentication.

    - **club_id**: UUID of the club
    - **instagram_username**: Instagram username (without @)
    - **display_gallery**: Whether to display the gallery (default: true)
    - **max_posts**: Maximum number of posts to display (default: 4, max: 12)

    Returns gallery settings
    """
    from uuid import UUID
    settings_data = GallerySettingsUpdate(
        instagram_username=instagram_username,
        display_gallery=display_gallery,
        max_posts=max_posts
    )
    settings = gallery_service.create_or_update_gallery_settings(
        db,
        club_id,
        settings_data
    )
    return GallerySettingsResponse.model_validate(settings)


@router.post("/{club_id}/gallery/refresh", response_model=GallerySettingsResponse)
async def refresh_instagram_gallery(
    club_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Refresh Instagram gallery cache for a club (Admin only)

    This endpoint would integrate with Instagram Basic Display API
    to fetch the latest posts. For now, it returns the current cached data.

    Requires admin authentication.

    - **club_id**: UUID of the club

    Returns updated gallery settings with refreshed posts
    """
    settings = gallery_service.get_gallery_settings_by_club_id(db, club_id)

    if not settings:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gallery settings not found. Please configure gallery settings first."
        )

    if not settings.instagram_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Instagram username not configured for this club"
        )

    # TODO: Implement Instagram API integration
    # For now, return existing settings with a message
    # In production, this would:
    # 1. Call Instagram Basic Display API
    # 2. Fetch recent posts
    # 3. Update cached_posts field
    # 4. Update cache_updated_at timestamp

    return GallerySettingsResponse.model_validate(settings)
