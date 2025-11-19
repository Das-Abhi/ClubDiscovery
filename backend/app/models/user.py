"""
User database model
"""
import uuid
from datetime import datetime
from sqlalchemy import Boolean, Column, String, DateTime, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    """User model for authentication and user management"""

    __tablename__ = "users"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # User credentials
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)

    # User profile
    full_name = Column(String(255), nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Status flags
    email_verified = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_admin = Column(Boolean, default=False, nullable=False)

    # Password reset tokens
    reset_password_token = Column(String(255), nullable=True)
    reset_password_token_expires = Column(DateTime, nullable=True)

    # Email verification tokens
    email_verification_token = Column(String(255), nullable=True)
    email_verification_token_expires = Column(DateTime, nullable=True)

    # User preferences (stored as JSON)
    # Example: {"theme": "dark", "notifications_enabled": true, "preferred_categories": ["cocurricular"]}
    preferences = Column(JSONB, nullable=True, default=dict)

    # Constraints
    __table_args__ = (
        CheckConstraint(
            "email ~* '^[A-Za-z0-9._%+-]+@bmsce\\.ac\\.in$'",
            name="email_format_check"
        ),
    )

    # Relationships
    memberships = relationship("Membership", back_populates="user", cascade="all, delete-orphan")
    assessments = relationship("Assessment", back_populates="user")

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, full_name={self.full_name})>"
