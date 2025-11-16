"""
Admin API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List
from datetime import datetime, timedelta

from app.api.deps import get_db
from app.middleware.admin import require_admin
from app.models.user import User
from app.models.club import Club, Membership
from app.models.assessment import Assessment
from app.schemas.user import UserResponse
from app.schemas.club import ClubResponse

router = APIRouter(prefix="/admin", tags=["admin"])


# Dashboard Statistics
@router.get("/dashboard/stats")
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    """Get dashboard statistics for admin"""

    # Total counts
    total_users = db.query(User).count()
    total_clubs = db.query(Club).count()
    total_memberships = db.query(Membership).count()
    total_assessments = db.query(Assessment).count()

    # New users in last 30 days
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    new_users = db.query(User).filter(User.created_at >= thirty_days_ago).count()

    # Active clubs
    active_clubs = db.query(Club).filter(Club.is_active == True).count()

    # Featured clubs
    featured_clubs = db.query(Club).filter(Club.is_featured == True).count()

    # Most popular clubs (by member count)
    popular_clubs = (
        db.query(Club)
        .filter(Club.is_active == True)
        .order_by(desc(Club.member_count))
        .limit(5)
        .all()
    )

    # Recent assessments
    recent_assessments = (
        db.query(Assessment)
        .order_by(desc(Assessment.created_at))
        .limit(10)
        .all()
    )

    # Club categories distribution
    category_stats = (
        db.query(Club.category, func.count(Club.id))
        .group_by(Club.category)
        .all()
    )

    return {
        "total_users": total_users,
        "total_clubs": total_clubs,
        "total_memberships": total_memberships,
        "total_assessments": total_assessments,
        "new_users_30d": new_users,
        "active_clubs": active_clubs,
        "featured_clubs": featured_clubs,
        "popular_clubs": [
            {
                "id": str(club.id),
                "name": club.name,
                "slug": club.slug,
                "category": club.category,
                "member_count": club.member_count,
                "view_count": club.view_count
            }
            for club in popular_clubs
        ],
        "recent_assessments_count": len(recent_assessments),
        "category_distribution": {
            category: count for category, count in category_stats
        }
    }


# User Management
@router.get("/users", response_model=List[UserResponse])
async def list_users(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    """Get list of all users (admin only)"""
    users = db.query(User).offset(skip).limit(limit).all()
    return users


@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    """Get user details by ID (admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user


@router.patch("/users/{user_id}/role")
async def update_user_role(
    user_id: str,
    is_admin: bool,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    """Update user admin role (admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    user.is_admin = is_admin
    db.commit()
    db.refresh(user)

    return {
        "id": str(user.id),
        "email": user.email,
        "full_name": user.full_name,
        "is_admin": user.is_admin
    }


@router.patch("/users/{user_id}/status")
async def update_user_status(
    user_id: str,
    is_active: bool,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    """Activate or deactivate a user (admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    user.is_active = is_active
    db.commit()
    db.refresh(user)

    return {
        "id": str(user.id),
        "email": user.email,
        "is_active": user.is_active
    }


# Club Management
@router.get("/clubs", response_model=List[ClubResponse])
async def list_all_clubs(
    skip: int = 0,
    limit: int = 100,
    include_inactive: bool = True,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    """Get list of all clubs including inactive (admin only)"""
    query = db.query(Club)

    if not include_inactive:
        query = query.filter(Club.is_active == True)

    clubs = query.offset(skip).limit(limit).all()
    return clubs


@router.patch("/clubs/{club_id}/featured")
async def toggle_club_featured(
    club_id: str,
    is_featured: bool,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    """Set club as featured or not (admin only)"""
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Club not found"
        )

    club.is_featured = is_featured
    db.commit()
    db.refresh(club)

    return {
        "id": str(club.id),
        "name": club.name,
        "is_featured": club.is_featured
    }


@router.patch("/clubs/{club_id}/active")
async def toggle_club_active(
    club_id: str,
    is_active: bool,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    """Activate or deactivate a club (admin only)"""
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Club not found"
        )

    club.is_active = is_active
    db.commit()
    db.refresh(club)

    return {
        "id": str(club.id),
        "name": club.name,
        "is_active": club.is_active
    }


@router.delete("/clubs/{club_id}")
async def delete_club(
    club_id: str,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    """Delete a club (admin only)"""
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Club not found"
        )

    db.delete(club)
    db.commit()

    return {"message": f"Club {club.name} deleted successfully"}


# Activity Log
@router.get("/activity")
async def get_recent_activity(
    limit: int = 50,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    """Get recent activity across the platform (admin only)"""

    # Recent users
    recent_users = (
        db.query(User)
        .order_by(desc(User.created_at))
        .limit(10)
        .all()
    )

    # Recent clubs
    recent_clubs = (
        db.query(Club)
        .order_by(desc(Club.created_at))
        .limit(10)
        .all()
    )

    # Recent memberships
    recent_memberships = (
        db.query(Membership)
        .order_by(desc(Membership.joined_at))
        .limit(10)
        .all()
    )

    # Recent assessments
    recent_assessments = (
        db.query(Assessment)
        .order_by(desc(Assessment.created_at))
        .limit(10)
        .all()
    )

    activity = []

    for user in recent_users:
        activity.append({
            "type": "user_registered",
            "timestamp": user.created_at.isoformat(),
            "description": f"New user registered: {user.full_name}",
            "user_email": user.email
        })

    for club in recent_clubs:
        activity.append({
            "type": "club_created",
            "timestamp": club.created_at.isoformat(),
            "description": f"New club created: {club.name}",
            "club_name": club.name
        })

    for membership in recent_memberships:
        activity.append({
            "type": "club_joined",
            "timestamp": membership.joined_at.isoformat(),
            "description": f"User joined club",
            "membership_id": str(membership.id)
        })

    for assessment in recent_assessments:
        activity.append({
            "type": "assessment_completed",
            "timestamp": assessment.created_at.isoformat(),
            "description": "Assessment completed"
        })

    # Sort all activity by timestamp
    activity.sort(key=lambda x: x["timestamp"], reverse=True)

    return activity[:limit]
