"""
User Pydantic schemas for request/response validation
"""
from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field, field_validator, field_serializer


class UserBase(BaseModel):
    """Base user schema"""

    email: EmailStr
    full_name: str = Field(..., min_length=1, max_length=255)


class UserCreate(UserBase):
    """Schema for user registration"""

    password: str = Field(..., min_length=8, max_length=100)

    @field_validator("email")
    @classmethod
    def validate_bmsce_email(cls, v: str) -> str:
        """Validate that email is from BMSCE domain"""
        if not v.lower().endswith("@bmsce.ac.in"):
            raise ValueError("Email must be a valid BMSCE email address (@bmsce.ac.in)")
        return v.lower()

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        """Validate password strength"""
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.islower() for c in v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit")
        return v


class UserLogin(BaseModel):
    """Schema for user login"""

    email: EmailStr
    password: str


class UserResponse(UserBase):
    """Schema for user response (public user data)"""

    id: UUID  # Pydantic accepts UUID and auto-serializes to string in JSON
    created_at: datetime
    updated_at: datetime
    email_verified: bool
    is_active: bool
    is_admin: bool

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    """Schema for updating user profile"""

    full_name: Optional[str] = Field(None, min_length=1, max_length=255)
    email: Optional[EmailStr] = None

    @field_validator("email")
    @classmethod
    def validate_bmsce_email(cls, v: Optional[str]) -> Optional[str]:
        """Validate that email is from BMSCE domain"""
        if v and not v.lower().endswith("@bmsce.ac.in"):
            raise ValueError("Email must be a valid BMSCE email address (@bmsce.ac.in)")
        return v.lower() if v else None


class TokenResponse(BaseModel):
    """Schema for token response"""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenRefresh(BaseModel):
    """Schema for token refresh request"""

    refresh_token: str


class PasswordResetRequest(BaseModel):
    """Schema for password reset request"""

    email: EmailStr

    @field_validator("email")
    @classmethod
    def validate_bmsce_email(cls, v: str) -> str:
        """Validate that email is from BMSCE domain"""
        if not v.lower().endswith("@bmsce.ac.in"):
            raise ValueError("Email must be a valid BMSCE email address (@bmsce.ac.in)")
        return v.lower()


class PasswordResetConfirm(BaseModel):
    """Schema for confirming password reset"""

    token: str
    new_password: str = Field(..., min_length=8, max_length=100)

    @field_validator("new_password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        """Validate password strength"""
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.islower() for c in v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit")
        return v


class EmailVerificationRequest(BaseModel):
    """Schema for email verification token"""

    token: str


class UserPreferences(BaseModel):
    """Schema for user preferences (stored as JSON)"""

    theme: Optional[str] = Field(None, description="UI theme preference (light/dark)")
    notifications_enabled: Optional[bool] = Field(True, description="Enable notifications")
    preferred_categories: Optional[list[str]] = Field(None, description="Preferred club categories")
    language: Optional[str] = Field("en", description="Preferred language")
    email_notifications: Optional[bool] = Field(True, description="Enable email notifications")
    newsletter_subscribed: Optional[bool] = Field(False, description="Subscribe to newsletter")

    class Config:
        from_attributes = True


class UserStatistics(BaseModel):
    """Schema for user statistics"""

    total_clubs_joined: int = 0
    total_assessments_taken: int = 0
    latest_assessment_date: Optional[str] = None

    class Config:
        from_attributes = True
