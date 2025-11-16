"""
Assessment database models
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Integer, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class Assessment(Base):
    """Assessment model for storing user quiz responses"""

    __tablename__ = "assessments"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Optional user ID (assessments can be anonymous)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    # JSON field for storing all responses
    responses = Column(JSON, nullable=False)

    # Timestamp
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="assessments")
    recommendations = relationship("Recommendation", back_populates="assessment", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Assessment(id={self.id}, user_id={self.user_id}, created_at={self.created_at})>"


class Recommendation(Base):
    """Recommendation model for storing club recommendations"""

    __tablename__ = "recommendations"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Foreign keys
    assessment_id = Column(UUID(as_uuid=True), ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False)
    club_id = Column(String(255), nullable=False)  # Reference to club slug

    # Recommendation data
    score = Column(Integer, nullable=False)
    rank = Column(Integer, nullable=False)

    # Optional reasoning (JSON)
    reasoning = Column(JSON, nullable=True)

    # Relationship
    assessment = relationship("Assessment", back_populates="recommendations")

    def __repr__(self):
        return f"<Recommendation(id={self.id}, club_id={self.club_id}, score={self.score}, rank={self.rank})>"
