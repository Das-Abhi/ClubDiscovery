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
    subcategory: Optional[str] = Field(None, max_length=100)
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
    subcategory: Optional[str] = Field(None, max_length=100)
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


class AnnouncementBase(BaseModel):
    """Base announcement schema"""

    title: str = Field(..., min_length=1, max_length=255)
    content: str = Field(..., min_length=1)
    is_published: bool = True


class AnnouncementCreate(AnnouncementBase):
    """Schema for creating an announcement"""

    club_id: UUID


class AnnouncementUpdate(BaseModel):
    """Schema for updating an announcement"""

    title: Optional[str] = Field(None, min_length=1, max_length=255)
    content: Optional[str] = Field(None, min_length=1)
    is_published: Optional[bool] = None


class AnnouncementResponse(AnnouncementBase):
    """Schema for announcement response"""

    id: UUID
    club_id: UUID
    created_by: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class GallerySettingsBase(BaseModel):
    """Base gallery settings schema"""

    instagram_username: Optional[str] = Field(None, max_length=255)
    display_gallery: bool = True
    max_posts: int = Field(4, ge=1, le=12)


class GallerySettingsCreate(GallerySettingsBase):
    """Schema for creating gallery settings"""

    club_id: UUID


class GallerySettingsUpdate(BaseModel):
    """Schema for updating gallery settings"""

    instagram_username: Optional[str] = Field(None, max_length=255)
    display_gallery: Optional[bool] = None
    max_posts: Optional[int] = Field(None, ge=1, le=12)


class InstagramPost(BaseModel):
    """Schema for Instagram post data"""

    id: str
    caption: Optional[str] = None
    media_url: str
    permalink: str
    timestamp: str
    media_type: str  # IMAGE, VIDEO, CAROUSEL_ALBUM


class GallerySettingsResponse(GallerySettingsBase):
    """Schema for gallery settings response"""

    id: UUID
    club_id: UUID
    cached_posts: Optional[List[InstagramPost]] = None
    cache_updated_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    @field_serializer('cached_posts')
    def serialize_cached_posts(self, cached_posts: Optional[str], _info):
        """Deserialize JSON string to list of dicts"""
        if cached_posts is None:
            return None
        if isinstance(cached_posts, str):
            import json
            try:
                return json.loads(cached_posts)
            except:
                return None
        return cached_posts

    class Config:
        from_attributes = True


class FavoriteBase(BaseModel):
    """Base favorite schema"""

    club_id: UUID


class FavoriteCreate(FavoriteBase):
    """Schema for creating a favorite"""

    pass


class FavoriteResponse(BaseModel):
    """Schema for favorite response"""

    id: UUID
    user_id: UUID
    club_id: UUID
    created_at: datetime
    club: Optional[ClubResponse] = None

    class Config:
        from_attributes = True
