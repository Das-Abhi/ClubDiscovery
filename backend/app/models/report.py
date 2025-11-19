"""
User Report database model for handling user-submitted reports
"""
import uuid
from datetime import datetime
from sqlalchemy import Boolean, Column, String, DateTime, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum

from app.database import Base


class ReportType(str, enum.Enum):
    """Report type enum"""
    USER = "user"
    CLUB = "club"
    CONTENT = "content"
    OTHER = "other"


class ReportStatus(str, enum.Enum):
    """Report status enum"""
    PENDING = "pending"
    REVIEWING = "reviewing"
    RESOLVED = "resolved"
    REJECTED = "rejected"


class UserReport(Base):
    """User Report model for handling user-submitted reports"""

    __tablename__ = "user_reports"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Foreign keys
    reporter_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    reported_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    reported_club_id = Column(UUID(as_uuid=True), ForeignKey("clubs.id", ondelete="SET NULL"), nullable=True, index=True)

    # Report details
    report_type = Column(SQLEnum(ReportType), nullable=False, index=True)
    reason = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(SQLEnum(ReportStatus), default=ReportStatus.PENDING, nullable=False, index=True)

    # Admin response
    reviewed_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    admin_notes = Column(Text, nullable=True)
    reviewed_at = Column(DateTime, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    reporter = relationship("User", foreign_keys=[reporter_id], backref="reports_made")
    reported_user = relationship("User", foreign_keys=[reported_user_id], backref="reports_received")
    reported_club = relationship("Club", foreign_keys=[reported_club_id], backref="reports")
    reviewer = relationship("User", foreign_keys=[reviewed_by], backref="reports_reviewed")

    def __repr__(self):
        return f"<UserReport(id={self.id}, type={self.report_type}, status={self.status})>"
