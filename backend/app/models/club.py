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


class ClubSubcategory(str, enum.Enum):
    """Club subcategory enum"""
    # Co-curricular subcategories
    TECHNICAL = "technical"
    ROBOTICS = "robotics"
    AI_ML = "ai_ml"
    RESEARCH = "research"
    INNOVATION = "innovation"
    AEROSPACE = "aerospace"
    CODING = "coding"

    # Extra-curricular subcategories
    CULTURAL = "cultural"
    SOCIAL = "social"
    SPORTS = "sports"
    ARTS = "arts"
    MUSIC = "music"
    DANCE = "dance"
    DRAMA = "drama"
    LITERATURE = "literature"

    # Department subcategories (by department)
    CSE = "cse"
    ISE = "ise"
    ECE = "ece"
    MECHANICAL = "mechanical"
    CIVIL = "civil"
    EEE = "eee"
    AEROSPACE_DEPT = "aerospace_dept"
    OTHER = "other"


class ApprovalStatus(str, enum.Enum):
    """Club approval status for moderation workflow"""
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    NEEDS_REVISION = "needs_revision"


class Club(Base):
    """Club model for managing clubs"""

    __tablename__ = "clubs"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Basic information
    name = Column(String(255), unique=True, nullable=False, index=True)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    category = Column(SQLEnum(ClubCategory), nullable=False, index=True)
    subcategory = Column(String(100), nullable=True, index=True)  # Using String instead of enum for flexibility
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
    approval_status = Column(SQLEnum(ApprovalStatus), default=ApprovalStatus.APPROVED, nullable=False, index=True)
    rejection_reason = Column(Text, nullable=True)  # Reason for rejection or needed revisions

    # Relationships
    memberships = relationship("Membership", back_populates="club", cascade="all, delete-orphan")
    announcements = relationship("Announcement", back_populates="club", cascade="all, delete-orphan")
    gallery_settings = relationship("GallerySettings", back_populates="club", uselist=False, cascade="all, delete-orphan")

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


class Announcement(Base):
    """Announcement model for club announcements"""

    __tablename__ = "announcements"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Foreign keys
    club_id = Column(UUID(as_uuid=True), ForeignKey("clubs.id", ondelete="CASCADE"), nullable=False, index=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)

    # Announcement details
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    is_published = Column(Boolean, default=True, nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    club = relationship("Club", back_populates="announcements")
    author = relationship("User")

    def __repr__(self):
        return f"<Announcement(id={self.id}, club_id={self.club_id}, title={self.title})>"


class GallerySettings(Base):
    """Gallery settings model for club Instagram integration"""

    __tablename__ = "gallery_settings"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Foreign keys (one-to-one with Club)
    club_id = Column(UUID(as_uuid=True), ForeignKey("clubs.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)

    # Instagram settings
    instagram_username = Column(String(255), nullable=True)
    display_gallery = Column(Boolean, default=True, nullable=False)
    max_posts = Column(Integer, default=4, nullable=False)  # Number of posts to display

    # Cache for Instagram posts (JSON)
    cached_posts = Column(Text, nullable=True)  # Store JSON string of posts
    cache_updated_at = Column(DateTime, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    club = relationship("Club", back_populates="gallery_settings")

    def __repr__(self):
        return f"<GallerySettings(id={self.id}, club_id={self.club_id}, instagram_username={self.instagram_username})>"


class Favorite(Base):
    """Favorite model for user's favorited/bookmarked clubs"""

    __tablename__ = "favorites"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Foreign keys
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    club_id = Column(UUID(as_uuid=True), ForeignKey("clubs.id", ondelete="CASCADE"), nullable=False, index=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Relationships
    user = relationship("User", backref="favorites")
    club = relationship("Club", backref="favorited_by")

    def __repr__(self):
        return f"<Favorite(id={self.id}, user_id={self.user_id}, club_id={self.club_id})>"
