"""
User Reports API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from datetime import datetime

from app.api.deps import get_db, get_current_user
from app.middleware.admin import require_admin
from app.models.user import User
from app.models.club import Club
from app.models.report import UserReport, ReportStatus, ReportType
from app.schemas.report import ReportCreate, ReportUpdate, ReportResponse, ReportDetailResponse

router = APIRouter(prefix="/reports", tags=["reports"])


# Create a new report (any authenticated user)
@router.post("/", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
async def create_report(
    report_data: ReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new report
    - Users can report other users, clubs, or content
    - Requires authentication
    """
    # Validate that at least one target is provided
    if not report_data.reported_user_id and not report_data.reported_club_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Must specify either reported_user_id or reported_club_id"
        )

    # Validate reported user exists
    if report_data.reported_user_id:
        reported_user = db.query(User).filter(User.id == report_data.reported_user_id).first()
        if not reported_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Reported user not found"
            )

    # Validate reported club exists
    if report_data.reported_club_id:
        reported_club = db.query(Club).filter(Club.id == report_data.reported_club_id).first()
        if not reported_club:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Reported club not found"
            )

    # Create the report
    new_report = UserReport(
        reporter_id=current_user.id,
        reported_user_id=report_data.reported_user_id,
        reported_club_id=report_data.reported_club_id,
        report_type=report_data.report_type,
        reason=report_data.reason,
        description=report_data.description,
        status=ReportStatus.PENDING
    )

    db.add(new_report)
    db.commit()
    db.refresh(new_report)

    return ReportResponse(
        id=str(new_report.id),
        report_type=new_report.report_type,
        reporter_id=str(new_report.reporter_id) if new_report.reporter_id else None,
        reported_user_id=str(new_report.reported_user_id) if new_report.reported_user_id else None,
        reported_club_id=str(new_report.reported_club_id) if new_report.reported_club_id else None,
        reason=new_report.reason,
        description=new_report.description,
        status=new_report.status,
        reviewed_by=str(new_report.reviewed_by) if new_report.reviewed_by else None,
        admin_notes=new_report.admin_notes,
        reviewed_at=new_report.reviewed_at,
        created_at=new_report.created_at,
        updated_at=new_report.updated_at
    )


# Get all reports (admin only)
@router.get("/", response_model=List[ReportDetailResponse])
async def list_reports(
    status_filter: Optional[ReportStatus] = Query(None, description="Filter by status"),
    report_type: Optional[ReportType] = Query(None, description="Filter by type"),
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    """
    Get list of all reports (admin only)
    - Can filter by status and type
    - Sorted by creation date (newest first)
    """
    query = db.query(UserReport)

    if status_filter:
        query = query.filter(UserReport.status == status_filter)

    if report_type:
        query = query.filter(UserReport.report_type == report_type)

    reports = query.order_by(desc(UserReport.created_at)).offset(skip).limit(limit).all()

    # Build detailed responses
    result = []
    for report in reports:
        reporter = db.query(User).filter(User.id == report.reporter_id).first() if report.reporter_id else None
        reported_user = db.query(User).filter(User.id == report.reported_user_id).first() if report.reported_user_id else None
        reported_club = db.query(Club).filter(Club.id == report.reported_club_id).first() if report.reported_club_id else None
        reviewer = db.query(User).filter(User.id == report.reviewed_by).first() if report.reviewed_by else None

        result.append(ReportDetailResponse(
            id=str(report.id),
            report_type=report.report_type,
            reporter_email=reporter.email if reporter else None,
            reporter_name=reporter.full_name if reporter else None,
            reported_user_email=reported_user.email if reported_user else None,
            reported_user_name=reported_user.full_name if reported_user else None,
            reported_club_name=reported_club.name if reported_club else None,
            reported_club_slug=reported_club.slug if reported_club else None,
            reason=report.reason,
            description=report.description,
            status=report.status,
            reviewer_email=reviewer.email if reviewer else None,
            reviewer_name=reviewer.full_name if reviewer else None,
            admin_notes=report.admin_notes,
            reviewed_at=report.reviewed_at,
            created_at=report.created_at,
            updated_at=report.updated_at
        ))

    return result


# Get a specific report (admin only)
@router.get("/{report_id}", response_model=ReportDetailResponse)
async def get_report(
    report_id: str,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    """Get report details by ID (admin only)"""
    report = db.query(UserReport).filter(UserReport.id == report_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )

    # Get related entities
    reporter = db.query(User).filter(User.id == report.reporter_id).first() if report.reporter_id else None
    reported_user = db.query(User).filter(User.id == report.reported_user_id).first() if report.reported_user_id else None
    reported_club = db.query(Club).filter(Club.id == report.reported_club_id).first() if report.reported_club_id else None
    reviewer = db.query(User).filter(User.id == report.reviewed_by).first() if report.reviewed_by else None

    return ReportDetailResponse(
        id=str(report.id),
        report_type=report.report_type,
        reporter_email=reporter.email if reporter else None,
        reporter_name=reporter.full_name if reporter else None,
        reported_user_email=reported_user.email if reported_user else None,
        reported_user_name=reported_user.full_name if reported_user else None,
        reported_club_name=reported_club.name if reported_club else None,
        reported_club_slug=reported_club.slug if reported_club else None,
        reason=report.reason,
        description=report.description,
        status=report.status,
        reviewer_email=reviewer.email if reviewer else None,
        reviewer_name=reviewer.full_name if reviewer else None,
        admin_notes=report.admin_notes,
        reviewed_at=report.reviewed_at,
        created_at=report.created_at,
        updated_at=report.updated_at
    )


# Update report status (admin only)
@router.patch("/{report_id}", response_model=ReportResponse)
async def update_report(
    report_id: str,
    report_update: ReportUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    """
    Update report status and add admin notes (admin only)
    - Can change status to reviewing, resolved, or rejected
    - Can add admin notes
    """
    report = db.query(UserReport).filter(UserReport.id == report_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )

    # Update fields
    if report_update.status:
        report.status = report_update.status
        report.reviewed_by = current_admin.id
        report.reviewed_at = datetime.utcnow()

    if report_update.admin_notes is not None:
        report.admin_notes = report_update.admin_notes

    db.commit()
    db.refresh(report)

    return ReportResponse(
        id=str(report.id),
        report_type=report.report_type,
        reporter_id=str(report.reporter_id) if report.reporter_id else None,
        reported_user_id=str(report.reported_user_id) if report.reported_user_id else None,
        reported_club_id=str(report.reported_club_id) if report.reported_club_id else None,
        reason=report.reason,
        description=report.description,
        status=report.status,
        reviewed_by=str(report.reviewed_by) if report.reviewed_by else None,
        admin_notes=report.admin_notes,
        reviewed_at=report.reviewed_at,
        created_at=report.created_at,
        updated_at=report.updated_at
    )


# Delete a report (admin only)
@router.delete("/{report_id}")
async def delete_report(
    report_id: str,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    """Delete a report (admin only)"""
    report = db.query(UserReport).filter(UserReport.id == report_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )

    db.delete(report)
    db.commit()

    return {"message": "Report deleted successfully"}


# Get report statistics (admin only)
@router.get("/stats/summary")
async def get_report_stats(
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    """Get report statistics (admin only)"""
    total_reports = db.query(UserReport).count()
    pending_reports = db.query(UserReport).filter(UserReport.status == ReportStatus.PENDING).count()
    reviewing_reports = db.query(UserReport).filter(UserReport.status == ReportStatus.REVIEWING).count()
    resolved_reports = db.query(UserReport).filter(UserReport.status == ReportStatus.RESOLVED).count()
    rejected_reports = db.query(UserReport).filter(UserReport.status == ReportStatus.REJECTED).count()

    # Count by type
    user_reports = db.query(UserReport).filter(UserReport.report_type == ReportType.USER).count()
    club_reports = db.query(UserReport).filter(UserReport.report_type == ReportType.CLUB).count()
    content_reports = db.query(UserReport).filter(UserReport.report_type == ReportType.CONTENT).count()
    other_reports = db.query(UserReport).filter(UserReport.report_type == ReportType.OTHER).count()

    return {
        "total_reports": total_reports,
        "by_status": {
            "pending": pending_reports,
            "reviewing": reviewing_reports,
            "resolved": resolved_reports,
            "rejected": rejected_reports
        },
        "by_type": {
            "user": user_reports,
            "club": club_reports,
            "content": content_reports,
            "other": other_reports
        }
    }
