"""
User Pydantic schemas for request/response validation
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator


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

    id: str
    created_at: datetime
    updated_at: datetime
    email_verified: bool
    is_active: bool

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
