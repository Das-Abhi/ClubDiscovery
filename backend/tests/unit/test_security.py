"""
Unit tests for Security module
"""
import pytest
from datetime import timedelta

from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token
)


class TestPasswordHashing:
    """Tests for password hashing functions"""

    def test_password_hash_generation(self):
        """Test that password hashing generates a hash"""
        password = "TestPassword123!"
        hashed = get_password_hash(password)

        assert hashed is not None
        assert hashed != password
        assert len(hashed) > 0

    def test_password_hash_uniqueness(self):
        """Test that same password generates different hashes (due to salt)"""
        password = "TestPassword123!"
        hash1 = get_password_hash(password)
        hash2 = get_password_hash(password)

        assert hash1 != hash2  # Different salts should produce different hashes

    def test_verify_correct_password(self):
        """Test verifying correct password"""
        password = "TestPassword123!"
        hashed = get_password_hash(password)

        assert verify_password(password, hashed) is True

    def test_verify_incorrect_password(self):
        """Test verifying incorrect password"""
        password = "TestPassword123!"
        wrong_password = "WrongPassword123!"
        hashed = get_password_hash(password)

        assert verify_password(wrong_password, hashed) is False

    def test_verify_empty_password(self):
        """Test verifying empty password"""
        password = "TestPassword123!"
        hashed = get_password_hash(password)

        assert verify_password("", hashed) is False


class TestTokenGeneration:
    """Tests for JWT token generation"""

    def test_create_access_token(self):
        """Test creating an access token"""
        data = {"sub": "test@bmsce.ac.in"}
        token = create_access_token(data)

        assert token is not None
        assert isinstance(token, str)
        assert len(token) > 0

    def test_create_access_token_with_expiry(self):
        """Test creating access token with custom expiry"""
        data = {"sub": "test@bmsce.ac.in"}
        expires_delta = timedelta(minutes=30)
        token = create_access_token(data, expires_delta=expires_delta)

        assert token is not None
        assert isinstance(token, str)

    def test_create_refresh_token(self):
        """Test creating a refresh token"""
        data = {"sub": "test@bmsce.ac.in"}
        token = create_refresh_token(data)

        assert token is not None
        assert isinstance(token, str)
        assert len(token) > 0

    def test_decode_valid_token(self):
        """Test decoding a valid token"""
        email = "test@bmsce.ac.in"
        data = {"sub": email}
        token = create_access_token(data)

        decoded = decode_token(token)

        assert decoded is not None
        assert decoded["sub"] == email
        assert "exp" in decoded  # Expiry should be present

    def test_decode_invalid_token(self):
        """Test decoding an invalid token"""
        invalid_token = "invalid.token.here"

        decoded = decode_token(invalid_token)

        assert decoded is None

    def test_decode_expired_token(self):
        """Test decoding an expired token"""
        data = {"sub": "test@bmsce.ac.in"}
        # Create token that expires immediately
        token = create_access_token(data, expires_delta=timedelta(seconds=-1))

        decoded = decode_token(token)

        assert decoded is None

    def test_token_contains_required_fields(self):
        """Test that token contains all required fields"""
        email = "test@bmsce.ac.in"
        data = {"sub": email, "extra": "data"}
        token = create_access_token(data)

        decoded = decode_token(token)

        assert decoded is not None
        assert "sub" in decoded
        assert "exp" in decoded
        assert decoded["sub"] == email
        assert decoded.get("extra") == "data"  # Extra data should be preserved
