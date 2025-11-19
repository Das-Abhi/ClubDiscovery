"""
Integration tests for authentication flow
Tests complete auth workflows with real database
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.models.user import User


client = TestClient(app)


class TestAuthenticationFlow:
    """Integration tests for complete authentication flows"""

    def test_complete_registration_login_flow(self, db_session: Session):
        """Test complete user registration and login flow"""
        # Step 1: Register a new user
        register_data = {
            "full_name": "Integration Test User",
            "email": "integration@bmsce.ac.in",
            "password": "TestPassword123",
        }

        register_response = client.post("/api/v1/auth/register", json=register_data)

        assert register_response.status_code == 201
        register_json = register_response.json()
        assert "access_token" in register_json
        assert "user" in register_json
        assert register_json["user"]["email"] == register_data["email"]
        assert register_json["user"]["full_name"] == register_data["full_name"]

        # Verify user exists in database
        user_in_db = db_session.query(User).filter(
            User.email == register_data["email"]
        ).first()
        assert user_in_db is not None
        assert user_in_db.full_name == register_data["full_name"]

        # Step 2: Logout (clear token)
        access_token = register_json["access_token"]

        # Step 3: Login with same credentials
        login_data = {
            "email": register_data["email"],
            "password": register_data["password"],
        }

        login_response = client.post("/api/v1/auth/login", json=login_data)

        assert login_response.status_code == 200
        login_json = login_response.json()
        assert "access_token" in login_json
        assert login_json["user"]["email"] == register_data["email"]

        # Step 4: Access protected endpoint with token
        headers = {"Authorization": f"Bearer {login_json['access_token']}"}
        me_response = client.get("/api/v1/auth/me", headers=headers)

        assert me_response.status_code == 200
        me_json = me_response.json()
        assert me_json["email"] == register_data["email"]
        assert me_json["full_name"] == register_data["full_name"]

    def test_duplicate_registration_prevented(self, db_session: Session):
        """Test that duplicate email registration is prevented"""
        # Register first user
        register_data = {
            "full_name": "First User",
            "email": "duplicate@bmsce.ac.in",
            "password": "TestPassword123",
        }

        first_response = client.post("/api/v1/auth/register", json=register_data)
        assert first_response.status_code == 201

        # Try to register with same email
        duplicate_data = {
            "full_name": "Second User",
            "email": "duplicate@bmsce.ac.in",
            "password": "DifferentPassword456",
        }

        duplicate_response = client.post("/api/v1/auth/register", json=duplicate_data)
        assert duplicate_response.status_code == 409

    def test_invalid_credentials_login(self, test_user):
        """Test that invalid credentials are rejected"""
        # Try to login with wrong password
        login_data = {
            "email": test_user["email"],
            "password": "WrongPassword123",
        }

        response = client.post("/api/v1/auth/login", json=login_data)
        assert response.status_code == 401

    def test_non_bmsce_email_rejected(self):
        """Test that non-BMSCE emails are rejected"""
        register_data = {
            "full_name": "External User",
            "email": "user@gmail.com",
            "password": "TestPassword123",
        }

        response = client.post("/api/v1/auth/register", json=register_data)
        assert response.status_code == 422  # Validation error

    def test_weak_password_rejected(self):
        """Test that weak passwords are rejected"""
        register_data = {
            "full_name": "Weak Password User",
            "email": "weakpass@bmsce.ac.in",
            "password": "weak",
        }

        response = client.post("/api/v1/auth/register", json=register_data)
        assert response.status_code == 422  # Validation error

    def test_token_refresh_flow(self, auth_headers):
        """Test token refresh flow"""
        # First, get a valid token by logging in
        # (auth_headers fixture provides this)

        # Access protected endpoint with token
        me_response = client.get("/api/v1/auth/me", headers=auth_headers)
        assert me_response.status_code == 200

        # Token refresh would be tested here if implemented
        # For now, just verify the token works


class TestUserProfileFlow:
    """Integration tests for user profile operations"""

    def test_get_current_user_profile(self, auth_headers):
        """Test getting current user profile"""
        response = client.get("/api/v1/auth/me", headers=auth_headers)

        assert response.status_code == 200
        user_data = response.json()
        assert "id" in user_data
        assert "email" in user_data
        assert "full_name" in user_data
        assert "is_admin" in user_data

    def test_unauthorized_access_blocked(self):
        """Test that unauthorized access is blocked"""
        response = client.get("/api/v1/auth/me")
        assert response.status_code == 401

    def test_invalid_token_rejected(self):
        """Test that invalid tokens are rejected"""
        headers = {"Authorization": "Bearer invalid_token"}
        response = client.get("/api/v1/auth/me", headers=headers)
        assert response.status_code == 401


class TestPasswordSecurity:
    """Integration tests for password security"""

    def test_password_hashed_in_database(self, db_session: Session):
        """Test that passwords are hashed in database"""
        register_data = {
            "full_name": "Hashed Password User",
            "email": "hashed@bmsce.ac.in",
            "password": "MySecretPassword123",
        }

        response = client.post("/api/v1/auth/register", json=register_data)
        assert response.status_code == 201

        # Verify password is hashed in database
        user_in_db = db_session.query(User).filter(
            User.email == register_data["email"]
        ).first()

        assert user_in_db is not None
        assert user_in_db.password_hash != register_data["password"]
        assert user_in_db.password_hash.startswith("$2b$")  # bcrypt hash prefix

    def test_password_not_returned_in_response(self):
        """Test that password is not returned in API responses"""
        register_data = {
            "full_name": "No Password Response User",
            "email": "nopassword@bmsce.ac.in",
            "password": "MySecretPassword123",
        }

        response = client.post("/api/v1/auth/register", json=register_data)
        assert response.status_code == 201

        user_data = response.json()["user"]
        assert "password" not in user_data
        assert "password_hash" not in user_data
