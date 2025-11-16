"""
Club database model
"""
import uuid
from datetime import datetime
from sqlalchemy import Boolean, Column, String, Integer, DateTime, Text, Enum as SQLEnum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum

from app.database import Base


class ClubCategory(str, enum.Enum):
    """Club category enum"""
    COCURRICULAR = "cocurricular"
    EXTRACURRICULAR = "extracurricular"
    DEPARTMENT = "department"


class Club(Base):
    """Club model for managing clubs"""

    __tablename__ = "clubs"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Basic information
    name = Column(String(255), unique=True, nullable=False, index=True)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    category = Column(SQLEnum(ClubCategory), nullable=False, index=True)
    tagline = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)
    overview = Column(Text, nullable=True)

    # Media
    logo_url = Column(String(500), nullable=True)
    cover_image_url = Column(String(500), nullable=True)

    # Social media
    instagram = Column(String(255), nullable=True)
    linkedin = Column(String(255), nullable=True)
    twitter = Column(String(255), nullable=True)
    website = Column(String(255), nullable=True)

    # Contact information (JSON or separate table in production)
    faculty_name = Column(String(255), nullable=True)
    faculty_email = Column(String(255), nullable=True)
    faculty_phone = Column(String(20), nullable=True)

    # Statistics
    member_count = Column(Integer, default=0, nullable=False)
    view_count = Column(Integer, default=0, nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    is_featured = Column(Boolean, default=False, nullable=False)

    # Relationships
    memberships = relationship("Membership", back_populates="club", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Club(id={self.id}, name={self.name}, category={self.category})>"


class Membership(Base):
    """Membership model for user-club relationships"""

    __tablename__ = "memberships"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Foreign keys
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    club_id = Column(UUID(as_uuid=True), ForeignKey("clubs.id", ondelete="CASCADE"), nullable=False, index=True)

    # Membership details
    role = Column(String(50), default="member", nullable=False)  # member, coordinator, admin
    status = Column(String(50), default="active", nullable=False)  # active, inactive, pending

    # Timestamps
    joined_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="memberships")
    club = relationship("Club", back_populates="memberships")

    def __repr__(self):
        return f"<Membership(id={self.id}, user_id={self.user_id}, club_id={self.club_id}, role={self.role})>"
