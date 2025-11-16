"""
Club Pydantic schemas for request/response validation
"""
from datetime import datetime
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, Field, field_validator, field_serializer


class ClubBase(BaseModel):
    """Base club schema"""

    name: str = Field(..., min_length=1, max_length=255)
    slug: str = Field(..., min_length=1, max_length=255)
    category: str = Field(..., pattern="^(cocurricular|extracurricular|department)$")
    tagline: Optional[str] = Field(None, max_length=500)
    description: Optional[str] = None
    overview: Optional[str] = None
    logo_url: Optional[str] = None
    cover_image_url: Optional[str] = None
    instagram: Optional[str] = None
    linkedin: Optional[str] = None
    twitter: Optional[str] = None
    website: Optional[str] = None
    faculty_name: Optional[str] = None
    faculty_email: Optional[str] = None
    faculty_phone: Optional[str] = None
    is_featured: bool = False


class ClubCreate(ClubBase):
    """Schema for creating a club"""

    @field_validator("slug")
    @classmethod
    def validate_slug(cls, v: str) -> str:
        """Validate slug format"""
        import re
        if not re.match(r'^[a-z0-9-]+$', v):
            raise ValueError("Slug must contain only lowercase letters, numbers, and hyphens")
        return v


class ClubUpdate(BaseModel):
    """Schema for updating a club"""

    name: Optional[str] = Field(None, min_length=1, max_length=255)
    tagline: Optional[str] = Field(None, max_length=500)
    description: Optional[str] = None
    overview: Optional[str] = None
    logo_url: Optional[str] = None
    cover_image_url: Optional[str] = None
    instagram: Optional[str] = None
    linkedin: Optional[str] = None
    twitter: Optional[str] = None
    website: Optional[str] = None
    faculty_name: Optional[str] = None
    faculty_email: Optional[str] = None
    faculty_phone: Optional[str] = None
    is_featured: Optional[bool] = None
    is_active: Optional[bool] = None


class ClubResponse(ClubBase):
    """Schema for club response"""

    id: UUID  # Pydantic accepts UUID and auto-serializes to string in JSON
    member_count: int
    view_count: int
    created_at: datetime
    updated_at: datetime
    is_active: bool

    class Config:
        from_attributes = True


class ClubListResponse(BaseModel):
    """Schema for paginated club list"""

    clubs: List[ClubResponse]
    total: int
    page: int
    per_page: int
    pages: int


class MembershipBase(BaseModel):
    """Base membership schema"""

    role: str = "member"
    status: str = "active"


class MembershipCreate(MembershipBase):
    """Schema for creating a membership"""

    club_id: str


class MembershipResponse(MembershipBase):
    """Schema for membership response"""

    id: UUID  # Pydantic auto-serializes UUIDs to strings in JSON
    user_id: UUID
    club_id: UUID
    joined_at: datetime
    updated_at: datetime
    club: Optional[ClubResponse] = None

    class Config:
        from_attributes = True
