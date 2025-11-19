"""
Integration tests for club management flow
Tests complete club workflows with real database
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.models.club import Club


client = TestClient(app)


class TestClubBrowsingFlow:
    """Integration tests for club browsing functionality"""

    def test_get_all_clubs(self):
        """Test getting all clubs"""
        response = client.get("/api/v1/clubs/")

        assert response.status_code == 200
        data = response.json()
        assert "data" in data
        assert "meta" in data
        assert isinstance(data["data"], list)

    def test_filter_clubs_by_category(self, test_club):
        """Test filtering clubs by category"""
        response = client.get("/api/v1/clubs/?category=cocurricular")

        assert response.status_code == 200
        data = response.json()
        assert "data" in data

        # All returned clubs should be cocurricular
        for club in data["data"]:
            assert club["category"] == "cocurricular"

    def test_search_clubs(self, test_club):
        """Test searching clubs by name"""
        response = client.get(f"/api/v1/clubs/?search={test_club['name'][:5]}")

        assert response.status_code == 200
        data = response.json()
        assert "data" in data

        # Should find the test club
        club_names = [club["name"] for club in data["data"]]
        assert any(test_club["name"] in name for name in club_names)

    def test_pagination_works(self):
        """Test club list pagination"""
        # Get first page
        response1 = client.get("/api/v1/clubs/?page=1&per_page=5")
        assert response1.status_code == 200
        data1 = response1.json()

        # Get second page
        response2 = client.get("/api/v1/clubs/?page=2&per_page=5")
        assert response2.status_code == 200
        data2 = response2.json()

        # Pages should have different clubs (if enough clubs exist)
        if data1["meta"]["total"] > 5:
            assert data1["data"] != data2["data"]

    def test_get_club_by_slug(self, test_club):
        """Test getting a specific club by slug"""
        response = client.get(f"/api/v1/clubs/{test_club['slug']}")

        assert response.status_code == 200
        club_data = response.json()
        assert club_data["slug"] == test_club["slug"]
        assert club_data["name"] == test_club["name"]

    def test_get_nonexistent_club(self):
        """Test getting a club that doesn't exist"""
        response = client.get("/api/v1/clubs/nonexistent-club-slug")

        # Should return 404 or null
        assert response.status_code in [200, 404]

        if response.status_code == 200:
            assert response.json() is None or response.json() == {}


class TestClubManagementFlow:
    """Integration tests for club management (admin operations)"""

    def test_create_club_as_admin(self, admin_headers, db_session: Session):
        """Test creating a new club as admin"""
        club_data = {
            "name": "Integration Test Club",
            "slug": "integration-test-club",
            "category": "cocurricular",
            "tagline": "A club for integration testing",
            "description": "This club is created during integration tests",
        }

        response = client.post(
            "/api/v1/clubs/",
            json=club_data,
            headers=admin_headers,
        )

        assert response.status_code == 201
        created_club = response.json()
        assert created_club["name"] == club_data["name"]
        assert created_club["slug"] == club_data["slug"]

        # Verify club exists in database
        club_in_db = db_session.query(Club).filter(
            Club.slug == club_data["slug"]
        ).first()
        assert club_in_db is not None
        assert club_in_db.name == club_data["name"]

    def test_create_club_without_auth_blocked(self):
        """Test that creating club without auth is blocked"""
        club_data = {
            "name": "Unauthorized Club",
            "slug": "unauthorized-club",
            "category": "cocurricular",
        }

        response = client.post("/api/v1/clubs/", json=club_data)
        assert response.status_code in [401, 403, 422]

    def test_create_club_as_regular_user_blocked(self, auth_headers):
        """Test that creating club as regular user is blocked"""
        club_data = {
            "name": "Regular User Club",
            "slug": "regular-user-club",
            "category": "cocurricular",
        }

        response = client.post(
            "/api/v1/clubs/",
            json=club_data,
            headers=auth_headers,
        )

        assert response.status_code == 403

    def test_update_club_as_admin(self, test_club, admin_headers, db_session: Session):
        """Test updating a club as admin"""
        update_data = {
            "tagline": "Updated tagline for integration test",
            "description": "Updated description",
        }

        response = client.patch(
            f"/api/v1/clubs/{test_club['id']}",
            json=update_data,
            headers=admin_headers,
        )

        assert response.status_code == 200
        updated_club = response.json()
        assert updated_club["tagline"] == update_data["tagline"]
        assert updated_club["description"] == update_data["description"]

        # Verify update in database
        club_in_db = db_session.query(Club).filter(
            Club.id == test_club["id"]
        ).first()
        assert club_in_db is not None
        assert club_in_db.tagline == update_data["tagline"]

    def test_delete_club_as_admin(self, admin_headers, db_session: Session):
        """Test deleting a club as admin"""
        # First create a club to delete
        club_data = {
            "name": "Club To Delete",
            "slug": "club-to-delete",
            "category": "cocurricular",
        }

        create_response = client.post(
            "/api/v1/clubs/",
            json=club_data,
            headers=admin_headers,
        )
        assert create_response.status_code == 201
        club_id = create_response.json()["id"]

        # Delete the club
        delete_response = client.delete(
            f"/api/v1/clubs/{club_id}",
            headers=admin_headers,
        )
        assert delete_response.status_code == 204

        # Verify club is deleted from database
        club_in_db = db_session.query(Club).filter(
            Club.id == club_id
        ).first()
        assert club_in_db is None


class TestClubMembershipFlow:
    """Integration tests for club membership operations"""

    def test_join_club(self, test_club, auth_headers):
        """Test joining a club"""
        response = client.post(
            f"/api/v1/clubs/{test_club['id']}/join",
            headers=auth_headers,
        )

        assert response.status_code in [200, 201]
        membership_data = response.json()
        assert membership_data["club_id"] == test_club["id"]
        assert membership_data["role"] == "member"

    def test_join_club_without_auth_blocked(self, test_club):
        """Test that joining club without auth is blocked"""
        response = client.post(f"/api/v1/clubs/{test_club['id']}/join")
        assert response.status_code == 401

    def test_leave_club(self, test_club, auth_headers):
        """Test leaving a club"""
        # First join the club
        join_response = client.post(
            f"/api/v1/clubs/{test_club['id']}/join",
            headers=auth_headers,
        )
        assert join_response.status_code in [200, 201, 409]  # 409 if already member

        # Then leave the club
        leave_response = client.delete(
            f"/api/v1/clubs/{test_club['id']}/leave",
            headers=auth_headers,
        )
        assert leave_response.status_code == 204

    def test_join_same_club_twice(self, test_club, auth_headers):
        """Test that joining the same club twice is handled properly"""
        # Join first time
        response1 = client.post(
            f"/api/v1/clubs/{test_club['id']}/join",
            headers=auth_headers,
        )
        assert response1.status_code in [200, 201]

        # Join second time
        response2 = client.post(
            f"/api/v1/clubs/{test_club['id']}/join",
            headers=auth_headers,
        )
        # Should either succeed (idempotent) or return conflict
        assert response2.status_code in [200, 201, 409]


class TestClubSearchAndFilter:
    """Integration tests for club search and filtering"""

    def test_empty_search_returns_all_clubs(self):
        """Test that empty search returns all clubs"""
        response = client.get("/api/v1/clubs/?search=")
        assert response.status_code == 200
        data = response.json()
        assert "data" in data

    def test_search_case_insensitive(self, test_club):
        """Test that search is case insensitive"""
        # Search with lowercase
        response1 = client.get(f"/api/v1/clubs/?search={test_club['name'].lower()[:5]}")
        assert response1.status_code == 200

        # Search with uppercase
        response2 = client.get(f"/api/v1/clubs/?search={test_club['name'].upper()[:5]}")
        assert response2.status_code == 200

    def test_filter_by_invalid_category(self):
        """Test filtering by invalid category"""
        response = client.get("/api/v1/clubs/?category=invalid_category")
        # Should return empty list or validation error
        assert response.status_code in [200, 422]

    def test_combined_search_and_filter(self, test_club):
        """Test combining search and category filter"""
        response = client.get(
            f"/api/v1/clubs/?category={test_club['category']}&search={test_club['name'][:3]}"
        )

        assert response.status_code == 200
        data = response.json()
        assert "data" in data
