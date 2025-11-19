"""
Pydantic schemas for User Reports
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from app.models.report import ReportType, ReportStatus


# Report Create Schema
class ReportCreate(BaseModel):
    """Schema for creating a new report"""
    report_type: ReportType
    reported_user_id: Optional[str] = None
    reported_club_id: Optional[str] = None
    reason: str = Field(..., min_length=5, max_length=255)
    description: Optional[str] = Field(None, max_length=2000)

    class Config:
        from_attributes = True


# Report Update Schema
class ReportUpdate(BaseModel):
    """Schema for updating a report (admin only)"""
    status: Optional[ReportStatus] = None
    admin_notes: Optional[str] = Field(None, max_length=2000)

    class Config:
        from_attributes = True


# Report Response Schema
class ReportResponse(BaseModel):
    """Schema for report response"""
    id: str
    report_type: ReportType
    reporter_id: Optional[str]
    reported_user_id: Optional[str]
    reported_club_id: Optional[str]
    reason: str
    description: Optional[str]
    status: ReportStatus
    reviewed_by: Optional[str]
    admin_notes: Optional[str]
    reviewed_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Detailed Report Response with relationships
class ReportDetailResponse(BaseModel):
    """Schema for detailed report response with user/club info"""
    id: str
    report_type: ReportType
    reporter_email: Optional[str] = None
    reporter_name: Optional[str] = None
    reported_user_email: Optional[str] = None
    reported_user_name: Optional[str] = None
    reported_club_name: Optional[str] = None
    reported_club_slug: Optional[str] = None
    reason: str
    description: Optional[str]
    status: ReportStatus
    reviewer_email: Optional[str] = None
    reviewer_name: Optional[str] = None
    admin_notes: Optional[str]
    reviewed_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
