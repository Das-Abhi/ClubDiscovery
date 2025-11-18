"""
Unit tests for Authentication API endpoints
"""
import pytest
from fastapi import status

pytestmark = pytest.mark.auth


class TestUserRegistration:
    """Tests for user registration endpoint"""

    def test_register_user_success(self, client):
        """Test successful user registration"""
        user_data = {
            "email": "newuser@bmsce.ac.in",
            "password": "SecurePass123!",
            "full_name": "New User"
        }

        response = client.post("/api/v1/auth/register", json=user_data)

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()

        # Verify response structure
        assert "access_token" in data
        assert "refresh_token" in data
        assert "token_type" in data
        assert data["token_type"] == "bearer"
        assert "user" in data

        # Verify user data
        user = data["user"]
        assert user["email"] == user_data["email"]
        assert user["full_name"] == user_data["full_name"]
        assert user["is_active"] is True
        assert user["is_admin"] is False
        assert "password" not in user

    def test_register_invalid_email_domain(self, client):
        """Test registration with invalid email domain"""
        user_data = {
            "email": "user@gmail.com",  # Wrong domain
            "password": "SecurePass123!",
            "full_name": "Test User"
        }

        response = client.post("/api/v1/auth/register", json=user_data)

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_register_weak_password(self, client):
        """Test registration with weak password"""
        user_data = {
            "email": "test@bmsce.ac.in",
            "password": "weak",  # Too short, no uppercase, no numbers
            "full_name": "Test User"
        }

        response = client.post("/api/v1/auth/register", json=user_data)

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_register_duplicate_email(self, client, test_user):
        """Test registration with already registered email"""
        user_data = {
            "email": test_user.email,
            "password": "SecurePass123!",
            "full_name": "Duplicate User"
        }

        response = client.post("/api/v1/auth/register", json=user_data)

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_register_missing_fields(self, client):
        """Test registration with missing required fields"""
        user_data = {
            "email": "test@bmsce.ac.in"
            # Missing password and full_name
        }

        response = client.post("/api/v1/auth/register", json=user_data)

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


class TestUserLogin:
    """Tests for user login endpoint"""

    def test_login_success(self, client, test_user):
        """Test successful login"""
        login_data = {
            "email": "test@bmsce.ac.in",
            "password": "TestPass123!"
        }

        response = client.post("/api/v1/auth/login", json=login_data)

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        # Verify response structure
        assert "access_token" in data
        assert "refresh_token" in data
        assert "token_type" in data
        assert data["token_type"] == "bearer"
        assert "user" in data

        # Verify user data
        user = data["user"]
        assert user["email"] == test_user.email
        assert user["full_name"] == test_user.full_name

    def test_login_wrong_password(self, client, test_user):
        """Test login with wrong password"""
        login_data = {
            "email": "test@bmsce.ac.in",
            "password": "WrongPassword123!"
        }

        response = client.post("/api/v1/auth/login", json=login_data)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_login_nonexistent_user(self, client):
        """Test login with non-existent email"""
        login_data = {
            "email": "nonexistent@bmsce.ac.in",
            "password": "SomePass123!"
        }

        response = client.post("/api/v1/auth/login", json=login_data)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_login_inactive_user(self, client, test_user, db_session):
        """Test login with inactive user account"""
        # Deactivate user
        test_user.is_active = False
        db_session.commit()

        login_data = {
            "email": "test@bmsce.ac.in",
            "password": "TestPass123!"
        }

        response = client.post("/api/v1/auth/login", json=login_data)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_login_missing_credentials(self, client):
        """Test login with missing credentials"""
        login_data = {
            "email": "test@bmsce.ac.in"
            # Missing password
        }

        response = client.post("/api/v1/auth/login", json=login_data)

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


class TestGetCurrentUser:
    """Tests for get current user endpoint"""

    def test_get_current_user(self, client, auth_headers, test_user):
        """Test getting current authenticated user"""
        response = client.get("/api/v1/users/me", headers=auth_headers)

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        assert data["id"] == str(test_user.id)
        assert data["email"] == test_user.email
        assert data["full_name"] == test_user.full_name

    def test_get_current_user_without_auth(self, client):
        """Test getting current user without authentication"""
        response = client.get("/api/v1/users/me")

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_get_current_user_invalid_token(self, client):
        """Test getting current user with invalid token"""
        headers = {"Authorization": "Bearer invalid_token"}
        response = client.get("/api/v1/users/me", headers=headers)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
