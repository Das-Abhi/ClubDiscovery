"""
User service for handling user profile and membership operations

This service separates user profile management from authentication (AuthService)
following the Single Responsibility Principle and Clean Code practices.
"""
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import desc
from fastapi import HTTPException, status
import uuid

from app.models.user import User
from app.models.club import Membership
from app.models.assessment import Assessment
from app.schemas.user import UserUpdate, UserPreferences


class UserService:
    """
    Service for handling user profile operations

    Responsibilities:
    - Get user profile information
    - Update user profile
    - Manage user preferences
    - Get user's club memberships
    - Get user's assessment history
    - User account management (for admin)

    Note: Authentication operations (login, register, tokens) are in AuthService
    """

    @staticmethod
    def get_user_by_id(db: Session, user_id: str) -> Optional[User]:
        """
        Get user by ID with relationships loaded

        Args:
            db: Database session
            user_id: User UUID as string

        Returns:
            User object or None if not found
        """
        try:
            user_uuid = uuid.UUID(user_id)
            return (
                db.query(User)
                .options(selectinload(User.memberships))
                .filter(User.id == user_uuid)
                .first()
            )
        except ValueError:
            return None

    @staticmethod
    def get_user_by_email(db: Session, email: str) -> Optional[User]:
        """
        Get user by email

        Args:
            db: Database session
            email: User email

        Returns:
            User object or None if not found
        """
        return db.query(User).filter(User.email == email.lower()).first()

    @staticmethod
    def get_all_users(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        is_active: Optional[bool] = None,
        is_admin: Optional[bool] = None,
    ) -> tuple[List[User], int]:
        """
        Get all users with optional filtering (Admin only)

        Args:
            db: Database session
            skip: Number of records to skip (pagination)
            limit: Maximum number of records to return
            is_active: Filter by active status
            is_admin: Filter by admin status

        Returns:
            Tuple of (users list, total count)
        """
        query = db.query(User)

        # Apply filters
        if is_active is not None:
            query = query.filter(User.is_active == is_active)

        if is_admin is not None:
            query = query.filter(User.is_admin == is_admin)

        # Get total count
        total = query.count()

        # Apply pagination and sorting
        users = (
            query.order_by(desc(User.created_at))
            .offset(skip)
            .limit(limit)
            .all()
        )

        return users, total

    @staticmethod
    def update_user_profile(
        db: Session, user_id: str, user_data: UserUpdate
    ) -> Optional[User]:
        """
        Update user profile information

        Args:
            db: Database session
            user_id: User UUID as string
            user_data: UserUpdate schema with fields to update

        Returns:
            Updated User object or None if not found

        Note: Does not update password or email (use AuthService for those)
        """
        user = UserService.get_user_by_id(db, user_id)
        if not user:
            return None

        # Update only provided fields (excluding unset fields)
        update_data = user_data.model_dump(exclude_unset=True)

        # Security: Don't allow updating sensitive fields through this method
        # Password and email updates should go through AuthService
        sensitive_fields = {"password_hash", "email", "is_admin", "is_active"}
        for field in sensitive_fields:
            update_data.pop(field, None)

        # Apply updates
        for field, value in update_data.items():
            if hasattr(user, field):
                setattr(user, field, value)

        db.commit()
        db.refresh(user)

        return user

    @staticmethod
    def update_user_preferences(
        db: Session, user_id: str, preferences: Dict[str, Any]
    ) -> Optional[User]:
        """
        Update user preferences (stored as JSON)

        Args:
            db: Database session
            user_id: User UUID as string
            preferences: Dictionary of user preferences

        Returns:
            Updated User object or None if not found

        Example preferences:
        {
            "theme": "dark",
            "notifications_enabled": true,
            "preferred_categories": ["cocurricular", "extracurricular"],
            "language": "en"
        }
        """
        user = UserService.get_user_by_id(db, user_id)
        if not user:
            return None

        # Update preferences (merge with existing)
        if user.preferences is None:
            user.preferences = {}

        user.preferences.update(preferences)

        # Mark as modified for SQLAlchemy to detect JSON changes
        from sqlalchemy.orm.attributes import flag_modified
        flag_modified(user, "preferences")

        db.commit()
        db.refresh(user)

        return user

    @staticmethod
    def get_user_memberships(db: Session, user_id: str) -> List[Membership]:
        """
        Get all club memberships for a user

        Args:
            db: Database session
            user_id: User UUID as string

        Returns:
            List of Membership objects with club information loaded
        """
        try:
            user_uuid = uuid.UUID(user_id)
            return (
                db.query(Membership)
                .options(selectinload(Membership.club))
                .filter(Membership.user_id == user_uuid)
                .order_by(desc(Membership.joined_at))
                .all()
            )
        except ValueError:
            return []

    @staticmethod
    def get_user_assessments(
        db: Session, user_id: str, limit: int = 10
    ) -> List[Assessment]:
        """
        Get assessment history for a user

        Args:
            db: Database session
            user_id: User UUID as string
            limit: Maximum number of assessments to return

        Returns:
            List of Assessment objects ordered by creation date (most recent first)
        """
        try:
            user_uuid = uuid.UUID(user_id)
            return (
                db.query(Assessment)
                .options(selectinload(Assessment.recommendations))
                .filter(Assessment.user_id == user_uuid)
                .order_by(desc(Assessment.created_at))
                .limit(limit)
                .all()
            )
        except ValueError:
            return []

    @staticmethod
    def update_user_status(
        db: Session, user_id: str, is_active: bool
    ) -> Optional[User]:
        """
        Activate or deactivate user account (Admin only)

        Args:
            db: Database session
            user_id: User UUID as string
            is_active: New active status

        Returns:
            Updated User object or None if not found
        """
        user = UserService.get_user_by_id(db, user_id)
        if not user:
            return None

        user.is_active = is_active

        db.commit()
        db.refresh(user)

        return user

    @staticmethod
    def update_user_role(
        db: Session, user_id: str, is_admin: bool
    ) -> Optional[User]:
        """
        Grant or revoke admin role (Admin only)

        Args:
            db: Database session
            user_id: User UUID as string
            is_admin: New admin status

        Returns:
            Updated User object or None if not found
        """
        user = UserService.get_user_by_id(db, user_id)
        if not user:
            return None

        user.is_admin = is_admin

        db.commit()
        db.refresh(user)

        return user

    @staticmethod
    def delete_user(db: Session, user_id: str) -> bool:
        """
        Delete user account (Soft delete recommended in production)

        Args:
            db: Database session
            user_id: User UUID as string

        Returns:
            True if deleted, False if not found

        Note: This performs a hard delete. In production, consider soft delete
        by setting is_active=False instead to preserve data for audit trails.
        """
        user = UserService.get_user_by_id(db, user_id)
        if not user:
            return False

        # In production, consider soft delete instead:
        # user.is_active = False
        # db.commit()

        db.delete(user)
        db.commit()

        return True

    @staticmethod
    def get_user_statistics(db: Session, user_id: str) -> Dict[str, Any]:
        """
        Get user statistics (for profile dashboard)

        Args:
            db: Database session
            user_id: User UUID as string

        Returns:
            Dictionary with user statistics
        """
        try:
            user_uuid = uuid.UUID(user_id)

            # Count memberships
            memberships_count = (
                db.query(Membership)
                .filter(Membership.user_id == user_uuid, Membership.status == "active")
                .count()
            )

            # Count assessments
            assessments_count = (
                db.query(Assessment)
                .filter(Assessment.user_id == user_uuid)
                .count()
            )

            # Get most recent assessment
            latest_assessment = (
                db.query(Assessment)
                .filter(Assessment.user_id == user_uuid)
                .order_by(desc(Assessment.created_at))
                .first()
            )

            return {
                "total_clubs_joined": memberships_count,
                "total_assessments_taken": assessments_count,
                "latest_assessment_date": (
                    latest_assessment.created_at.isoformat()
                    if latest_assessment
                    else None
                ),
            }
        except ValueError:
            return {
                "total_clubs_joined": 0,
                "total_assessments_taken": 0,
                "latest_assessment_date": None,
            }


# Create singleton instance
user_service = UserService()
