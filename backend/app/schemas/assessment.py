"""
Assessment Pydantic schemas for request/response validation
"""
from datetime import datetime
from typing import Optional, Dict, Any, List
from uuid import UUID
from pydantic import BaseModel, Field, field_serializer


class AssessmentResponses(BaseModel):
    """Schema for assessment responses"""

    enjoy: str = Field(..., description="What do you enjoy most?")
    time: str = Field(..., description="How much time can you commit?")
    domain: str = Field(..., description="Which domain are you most drawn to?")
    impact: str = Field(..., description="What kind of impact do you want to create?")
    past: str = Field(..., description="Past experience")


class AssessmentCreate(BaseModel):
    """Schema for creating an assessment"""

    responses: AssessmentResponses
    user_id: Optional[str] = None  # Optional for anonymous assessments


class ReasoningItem(BaseModel):
    """Schema for recommendation reasoning"""

    question: str
    answer: str
    contribution: int


class ClubRecommendation(BaseModel):
    """Schema for a single club recommendation"""

    club: Dict[str, Any]  # Club details (id, name, slug, tagline, logo_url)
    score: int
    rank: int
    reasoning: List[ReasoningItem]


class AssessmentResult(BaseModel):
    """Schema for assessment results"""

    assessment_id: str
    recommendations: List[ClubRecommendation]
    created_at: datetime

    class Config:
        from_attributes = True


class AssessmentResponse(BaseModel):
    """Schema for assessment response"""

    id: UUID  # Pydantic auto-serializes UUIDs to strings in JSON
    user_id: Optional[UUID]  # Can be None for anonymous assessments
    responses: AssessmentResponses
    created_at: datetime

    class Config:
        from_attributes = True
