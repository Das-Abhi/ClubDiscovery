"""
Admin API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List
from datetime import datetime, timedelta
import pandas as pd
import io
from slugify import slugify

from app.api.deps import get_db
from app.middleware.admin import require_admin
from app.models.user import User
from app.models.club import Club, Membership, ApprovalStatus
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


# Content Moderation Endpoints
@router.get("/moderation/pending-clubs", response_model=List[ClubResponse])
async def get_pending_clubs(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    """Get list of clubs pending approval (admin only)"""
    clubs = (
        db.query(Club)
        .filter(Club.approval_status == ApprovalStatus.PENDING)
        .offset(skip)
        .limit(limit)
        .all()
    )
    return clubs


@router.patch("/moderation/clubs/{club_id}/approve")
async def approve_club(
    club_id: str,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    """Approve a pending club (admin only)"""
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Club not found"
        )

    club.approval_status = ApprovalStatus.APPROVED
    club.is_active = True
    club.rejection_reason = None
    db.commit()
    db.refresh(club)

    return {
        "id": str(club.id),
        "name": club.name,
        "approval_status": club.approval_status.value,
        "message": f"Club '{club.name}' has been approved"
    }


@router.patch("/moderation/clubs/{club_id}/reject")
async def reject_club(
    club_id: str,
    reason: str,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    """Reject a pending club with reason (admin only)"""
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Club not found"
        )

    club.approval_status = ApprovalStatus.REJECTED
    club.is_active = False
    club.rejection_reason = reason
    db.commit()
    db.refresh(club)

    return {
        "id": str(club.id),
        "name": club.name,
        "approval_status": club.approval_status.value,
        "rejection_reason": club.rejection_reason,
        "message": f"Club '{club.name}' has been rejected"
    }


@router.patch("/moderation/clubs/{club_id}/request-revision")
async def request_revision(
    club_id: str,
    feedback: str,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    """Request revisions for a club (admin only)"""
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Club not found"
        )

    club.approval_status = ApprovalStatus.NEEDS_REVISION
    club.rejection_reason = feedback
    db.commit()
    db.refresh(club)

    return {
        "id": str(club.id),
        "name": club.name,
        "approval_status": club.approval_status.value,
        "feedback": club.rejection_reason,
        "message": f"Revision requested for club '{club.name}'"
    }


@router.get("/moderation/stats")
async def get_moderation_stats(
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    """Get moderation statistics (admin only)"""
    pending_count = db.query(Club).filter(Club.approval_status == ApprovalStatus.PENDING).count()
    approved_count = db.query(Club).filter(Club.approval_status == ApprovalStatus.APPROVED).count()
    rejected_count = db.query(Club).filter(Club.approval_status == ApprovalStatus.REJECTED).count()
    needs_revision_count = db.query(Club).filter(Club.approval_status == ApprovalStatus.NEEDS_REVISION).count()

    return {
        "pending": pending_count,
        "approved": approved_count,
        "rejected": rejected_count,
        "needs_revision": needs_revision_count,
        "total": pending_count + approved_count + rejected_count + needs_revision_count
    }


# CSV Bulk Import
@router.post("/clubs/bulk-import")
async def bulk_import_clubs(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    """
    Bulk import clubs from CSV file (admin only)

    Required CSV columns:
    - name: Club name (required)
    - category: cocurricular, extracurricular, or department (required)
    - tagline: Short description
    - description: Full description
    - overview: Overview text
    - logo_url: URL to club logo
    - instagram: Instagram handle
    - faculty_name: Faculty coordinator name
    - faculty_email: Faculty email
    - faculty_phone: Faculty phone

    Optional columns: linkedin, twitter, website, cover_image_url, subcategory
    """
    # Validate file type
    if not file.filename.endswith('.csv'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be a CSV file"
        )

    try:
        # Read CSV file
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))

        # Validate required columns
        required_columns = ['name', 'category']
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Missing required columns: {', '.join(missing_columns)}"
            )

        created_clubs = []
        skipped_clubs = []
        errors = []

        # Process each row
        for index, row in df.iterrows():
            try:
                # Generate slug from name
                club_slug = slugify(row['name'])

                # Check if club already exists
                existing_club = db.query(Club).filter(
                    (Club.name == row['name']) | (Club.slug == club_slug)
                ).first()

                if existing_club:
                    skipped_clubs.append({
                        "row": index + 1,
                        "name": row['name'],
                        "reason": "Club already exists"
                    })
                    continue

                # Validate category
                category_value = str(row['category']).lower()
                if category_value not in ['cocurricular', 'extracurricular', 'department']:
                    errors.append({
                        "row": index + 1,
                        "name": row['name'],
                        "error": f"Invalid category: {row['category']}"
                    })
                    continue

                # Create new club
                new_club = Club(
                    name=row['name'],
                    slug=club_slug,
                    category=category_value,
                    tagline=str(row.get('tagline', '')).strip() if pd.notna(row.get('tagline')) else None,
                    description=str(row.get('description', '')).strip() if pd.notna(row.get('description')) else None,
                    overview=str(row.get('overview', '')).strip() if pd.notna(row.get('overview')) else None,
                    logo_url=str(row.get('logo_url', '')).strip() if pd.notna(row.get('logo_url')) else None,
                    cover_image_url=str(row.get('cover_image_url', '')).strip() if pd.notna(row.get('cover_image_url')) else None,
                    instagram=str(row.get('instagram', '')).strip() if pd.notna(row.get('instagram')) else None,
                    linkedin=str(row.get('linkedin', '')).strip() if pd.notna(row.get('linkedin')) else None,
                    twitter=str(row.get('twitter', '')).strip() if pd.notna(row.get('twitter')) else None,
                    website=str(row.get('website', '')).strip() if pd.notna(row.get('website')) else None,
                    faculty_name=str(row.get('faculty_name', '')).strip() if pd.notna(row.get('faculty_name')) else None,
                    faculty_email=str(row.get('faculty_email', '')).strip() if pd.notna(row.get('faculty_email')) else None,
                    faculty_phone=str(row.get('faculty_phone', '')).strip() if pd.notna(row.get('faculty_phone')) else None,
                    subcategory=str(row.get('subcategory', '')).strip() if pd.notna(row.get('subcategory')) else None,
                    is_active=True,
                    approval_status=ApprovalStatus.APPROVED,  # Auto-approve CSV imports
                    member_count=0,
                    view_count=0
                )

                db.add(new_club)
                created_clubs.append({
                    "row": index + 1,
                    "name": row['name'],
                    "slug": club_slug
                })

            except Exception as e:
                errors.append({
                    "row": index + 1,
                    "name": row.get('name', 'Unknown'),
                    "error": str(e)
                })

        # Commit all changes
        if created_clubs:
            db.commit()

        return {
            "success": True,
            "summary": {
                "total_rows": len(df),
                "created": len(created_clubs),
                "skipped": len(skipped_clubs),
                "errors": len(errors)
            },
            "created_clubs": created_clubs,
            "skipped_clubs": skipped_clubs,
            "errors": errors
        }

    except pd.errors.EmptyDataError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="CSV file is empty"
        )
    except pd.errors.ParserError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid CSV format"
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing CSV: {str(e)}"
        )
