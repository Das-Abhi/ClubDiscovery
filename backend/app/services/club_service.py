"""
Club service for handling club operations
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from fastapi import HTTPException, status
import uuid

from app.models.club import Club, Membership, ClubCategory, Announcement, GallerySettings
from app.schemas.club import ClubCreate, ClubUpdate, AnnouncementCreate, AnnouncementUpdate, GallerySettingsCreate, GallerySettingsUpdate


class ClubService:
    """Service for handling club operations"""

    @staticmethod
    def get_club_by_id(db: Session, club_id: str) -> Optional[Club]:
        """Get club by ID"""
        try:
            club_uuid = uuid.UUID(club_id)
            return db.query(Club).filter(Club.id == club_uuid).first()
        except ValueError:
            return None

    @staticmethod
    def get_club_by_slug(db: Session, slug: str) -> Optional[Club]:
        """Get club by slug"""
        return db.query(Club).filter(Club.slug == slug).first()

    @staticmethod
    def get_clubs(
        db: Session,
        category: Optional[str] = None,
        search: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
        is_active: bool = True
    ) -> tuple[List[Club], int]:
        """
        Get clubs with optional filtering

        Returns: (clubs, total_count)
        """
        query = db.query(Club)

        # Filter by active status
        if is_active is not None:
            query = query.filter(Club.is_active == is_active)

        # Filter by category
        if category:
            try:
                cat_enum = ClubCategory(category)
                query = query.filter(Club.category == cat_enum)
            except ValueError:
                pass  # Invalid category, skip filter

        # Search using PostgreSQL Full-Text Search (FTS)
        # This provides O(log n) performance compared to O(n) with ILIKE
        if search:
            # Use PostgreSQL's Full-Text Search with ranking
            # ts_rank orders results by relevance
            from sqlalchemy import text

            # Sanitize search query for tsquery (remove special characters)
            # Convert to tsquery format (words separated by &)
            search_terms = search.strip().replace("'", "''")  # Escape single quotes

            # Use websearch_to_tsquery for natural language queries
            # This handles phrases, AND/OR logic, and quoted strings
            query = query.filter(
                text("search_vector @@ websearch_to_tsquery('english', :search)")
            ).params(search=search_terms)

            # Order by relevance (ts_rank) when searching
            # Higher rank = better match
            query = query.order_by(
                text("ts_rank(search_vector, websearch_to_tsquery('english', :search)) DESC")
            ).params(search=search_terms)

        # Get total count
        total = query.count()

        # Apply pagination and sorting
        # Note: If search is active, results are already ordered by relevance (ts_rank)
        # Otherwise, order by featured status and creation date
        if not search:
            query = query.order_by(Club.is_featured.desc(), Club.created_at.desc())

        clubs = query.offset(skip).limit(limit).all()

        return clubs, total

    @staticmethod
    def create_club(db: Session, club_data: ClubCreate) -> Club:
        """Create a new club"""
        # Check if slug already exists
        existing_club = ClubService.get_club_by_slug(db, club_data.slug)
        if existing_club:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Club with this slug already exists"
            )

        # Check if name already exists
        existing_name = db.query(Club).filter(Club.name == club_data.name).first()
        if existing_name:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Club with this name already exists"
            )

        # Create club
        club = Club(**club_data.model_dump())
        db.add(club)
        db.commit()
        db.refresh(club)

        return club

    @staticmethod
    def update_club(db: Session, club_id: str, club_data: ClubUpdate) -> Optional[Club]:
        """Update a club"""
        club = ClubService.get_club_by_id(db, club_id)
        if not club:
            return None

        # Update only provided fields
        update_data = club_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(club, field, value)

        db.commit()
        db.refresh(club)

        return club

    @staticmethod
    def delete_club(db: Session, club_id: str) -> bool:
        """Delete a club"""
        club = ClubService.get_club_by_id(db, club_id)
        if not club:
            return False

        db.delete(club)
        db.commit()

        return True

    @staticmethod
    def increment_view_count(db: Session, club_id: str) -> None:
        """Increment club view count"""
        club = ClubService.get_club_by_id(db, club_id)
        if club:
            club.view_count += 1
            db.commit()

    @staticmethod
    def get_featured_clubs(db: Session, limit: int = 10) -> List[Club]:
        """Get featured clubs"""
        return db.query(Club)\
            .filter(Club.is_featured == True, Club.is_active == True)\
            .order_by(Club.created_at.desc())\
            .limit(limit)\
            .all()

    @staticmethod
    def get_popular_clubs(db: Session, limit: int = 10) -> List[Club]:
        """Get popular clubs by member count"""
        return db.query(Club)\
            .filter(Club.is_active == True)\
            .order_by(Club.member_count.desc())\
            .limit(limit)\
            .all()


class MembershipService:
    """Service for handling club membership operations"""

    @staticmethod
    def get_membership(db: Session, user_id: str, club_id: str) -> Optional[Membership]:
        """Get membership by user and club"""
        try:
            user_uuid = uuid.UUID(user_id)
            club_uuid = uuid.UUID(club_id)
            return db.query(Membership).filter(
                Membership.user_id == user_uuid,
                Membership.club_id == club_uuid
            ).first()
        except ValueError:
            return None

    @staticmethod
    def get_user_memberships(db: Session, user_id: str) -> List[Membership]:
        """Get all memberships for a user"""
        try:
            user_uuid = uuid.UUID(user_id)
            return db.query(Membership)\
                .filter(Membership.user_id == user_uuid)\
                .order_by(Membership.joined_at.desc())\
                .all()
        except ValueError:
            return []

    @staticmethod
    def join_club(db: Session, user_id: str, club_id: str, role: str = "member") -> Membership:
        """User joins a club"""
        # Check if club exists
        club = ClubService.get_club_by_id(db, club_id)
        if not club:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Club not found"
            )

        # Check if already a member
        existing = MembershipService.get_membership(db, user_id, club_id)
        if existing:
            if existing.status == "active":
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Already a member of this club"
                )
            else:
                # Reactivate membership
                existing.status = "active"
                db.commit()
                db.refresh(existing)
                return existing

        # Create membership
        try:
            user_uuid = uuid.UUID(user_id)
            club_uuid = uuid.UUID(club_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid user or club ID"
            )

        membership = Membership(
            user_id=user_uuid,
            club_id=club_uuid,
            role=role,
            status="active"
        )

        db.add(membership)

        # Increment club member count
        club.member_count += 1

        db.commit()
        db.refresh(membership)

        return membership

    @staticmethod
    def leave_club(db: Session, user_id: str, club_id: str) -> bool:
        """User leaves a club"""
        membership = MembershipService.get_membership(db, user_id, club_id)
        if not membership:
            return False

        # Get club to update member count
        club = ClubService.get_club_by_id(db, club_id)

        # Delete membership
        db.delete(membership)

        # Decrement club member count
        if club and club.member_count > 0:
            club.member_count -= 1

        db.commit()

        return True


class AnnouncementService:
    """Service for handling announcement operations"""

    @staticmethod
    def get_announcement_by_id(db: Session, announcement_id: str) -> Optional[Announcement]:
        """Get announcement by ID"""
        try:
            announcement_uuid = uuid.UUID(announcement_id)
            return db.query(Announcement).filter(Announcement.id == announcement_uuid).first()
        except ValueError:
            return None

    @staticmethod
    def get_club_announcements(
        db: Session,
        club_id: str,
        is_published: Optional[bool] = True,
        limit: int = 10
    ) -> List[Announcement]:
        """Get announcements for a club"""
        try:
            club_uuid = uuid.UUID(club_id)
            query = db.query(Announcement).filter(Announcement.club_id == club_uuid)

            if is_published is not None:
                query = query.filter(Announcement.is_published == is_published)

            return query.order_by(Announcement.created_at.desc()).limit(limit).all()
        except ValueError:
            return []

    @staticmethod
    def create_announcement(
        db: Session,
        announcement_data: AnnouncementCreate,
        user_id: str
    ) -> Announcement:
        """Create a new announcement"""
        # Verify club exists
        club = ClubService.get_club_by_id(db, str(announcement_data.club_id))
        if not club:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Club not found"
            )

        try:
            user_uuid = uuid.UUID(user_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid user ID"
            )

        announcement = Announcement(
            **announcement_data.model_dump(),
            created_by=user_uuid
        )
        db.add(announcement)
        db.commit()
        db.refresh(announcement)

        return announcement

    @staticmethod
    def update_announcement(
        db: Session,
        announcement_id: str,
        announcement_data: AnnouncementUpdate
    ) -> Optional[Announcement]:
        """Update an announcement"""
        announcement = AnnouncementService.get_announcement_by_id(db, announcement_id)
        if not announcement:
            return None

        update_data = announcement_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(announcement, field, value)

        db.commit()
        db.refresh(announcement)

        return announcement

    @staticmethod
    def delete_announcement(db: Session, announcement_id: str) -> bool:
        """Delete an announcement"""
        announcement = AnnouncementService.get_announcement_by_id(db, announcement_id)
        if not announcement:
            return False

        db.delete(announcement)
        db.commit()

        return True


class GalleryService:
    """Service for handling gallery/Instagram integration"""

    @staticmethod
    def get_gallery_settings_by_id(db: Session, settings_id: str) -> Optional[GallerySettings]:
        """Get gallery settings by ID"""
        try:
            settings_uuid = uuid.UUID(settings_id)
            return db.query(GallerySettings).filter(GallerySettings.id == settings_uuid).first()
        except ValueError:
            return None

    @staticmethod
    def get_gallery_settings_by_club_id(db: Session, club_id: str) -> Optional[GallerySettings]:
        """Get gallery settings for a club"""
        try:
            club_uuid = uuid.UUID(club_id)
            return db.query(GallerySettings).filter(GallerySettings.club_id == club_uuid).first()
        except ValueError:
            return None

    @staticmethod
    def create_or_update_gallery_settings(
        db: Session,
        club_id: str,
        settings_data: GallerySettingsCreate | GallerySettingsUpdate
    ) -> GallerySettings:
        """Create or update gallery settings for a club"""
        # Verify club exists
        club = ClubService.get_club_by_id(db, club_id)
        if not club:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Club not found"
            )

        # Check if settings already exist
        existing_settings = GalleryService.get_gallery_settings_by_club_id(db, club_id)

        if existing_settings:
            # Update existing settings
            update_data = settings_data.model_dump(exclude_unset=True)
            for field, value in update_data.items():
                if field != 'club_id':  # Don't update club_id
                    setattr(existing_settings, field, value)

            db.commit()
            db.refresh(existing_settings)
            return existing_settings
        else:
            # Create new settings
            try:
                club_uuid = uuid.UUID(club_id)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid club ID"
                )

            settings = GallerySettings(
                club_id=club_uuid,
                **settings_data.model_dump(exclude={'club_id'})
            )
            db.add(settings)
            db.commit()
            db.refresh(settings)
            return settings

    @staticmethod
    def update_cached_posts(
        db: Session,
        club_id: str,
        posts_json: str
    ) -> Optional[GallerySettings]:
        """Update cached Instagram posts for a club"""
        from datetime import datetime

        settings = GalleryService.get_gallery_settings_by_club_id(db, club_id)
        if not settings:
            return None

        settings.cached_posts = posts_json
        settings.cache_updated_at = datetime.utcnow()

        db.commit()
        db.refresh(settings)

        return settings


# Create singleton instances
club_service = ClubService()
membership_service = MembershipService()
announcement_service = AnnouncementService()
gallery_service = GalleryService()
