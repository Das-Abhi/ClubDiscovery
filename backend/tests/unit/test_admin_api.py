"""
Unit tests for Admin API endpoints
"""
import pytest
from fastapi import status
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.club import Club
from app.models.assessment import Assessment


pytestmark = pytest.mark.admin


class TestAdminDashboardStats:
    """Tests for admin dashboard statistics endpoint"""

    def test_get_dashboard_stats_as_admin(self, client, admin_headers, sample_clubs, test_user, db_session):
        """Test getting dashboard stats as admin - should succeed"""
        # Create an assessment
        assessment = Assessment(
            user_id=test_user.id,
            responses={"enjoy": "coding", "time": "medium"}
        )
        db_session.add(assessment)
        db_session.commit()

        response = client.get(
            "/api/v1/admin/dashboard/stats",
            headers=admin_headers
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        # Verify structure
        assert "total_users" in data
        assert "total_clubs" in data
        assert "total_memberships" in data
        assert "total_assessments" in data
        assert "new_users_30d" in data
        assert "active_clubs" in data
        assert "featured_clubs" in data
        assert "popular_clubs" in data
        assert "category_distribution" in data

        # Verify counts
        assert data["total_users"] >= 2  # admin + test_user
        assert data["total_clubs"] == 3  # from sample_clubs
        assert data["total_assessments"] == 1
        assert data["active_clubs"] == 2  # 2 active clubs in sample_clubs
        assert data["featured_clubs"] == 1  # 1 featured club in sample_clubs

        # Verify popular clubs structure
        assert isinstance(data["popular_clubs"], list)
        if len(data["popular_clubs"]) > 0:
            club = data["popular_clubs"][0]
            assert "id" in club
            assert "name" in club
            assert "slug" in club
            assert "member_count" in club

    def test_get_dashboard_stats_as_user(self, client, auth_headers):
        """Test getting dashboard stats as regular user - should fail"""
        response = client.get(
            "/api/v1/admin/dashboard/stats",
            headers=auth_headers
        )

        assert response.status_code == status.HTTP_403_FORBIDDEN
        assert "Admin access required" in response.json()["detail"]

    def test_get_dashboard_stats_without_auth(self, client):
        """Test getting dashboard stats without authentication - should fail"""
        response = client.get("/api/v1/admin/dashboard/stats")

        assert response.status_code == status.HTTP_401_UNAUTHORIZED


class TestAdminUserManagement:
    """Tests for admin user management endpoints"""

    def test_list_users_as_admin(self, client, admin_headers, test_user):
        """Test listing users as admin - should succeed"""
        response = client.get(
            "/api/v1/admin/users",
            headers=admin_headers
        )

        assert response.status_code == status.HTTP_200_OK
        users = response.json()

        assert isinstance(users, list)
        assert len(users) >= 2  # admin + test_user

        # Verify user structure
        user = users[0]
        assert "id" in user
        assert "email" in user
        assert "full_name" in user
        assert "is_admin" in user
        assert "is_active" in user

    def test_list_users_with_pagination(self, client, admin_headers):
        """Test user listing with pagination"""
        response = client.get(
            "/api/v1/admin/users?skip=0&limit=1",
            headers=admin_headers
        )

        assert response.status_code == status.HTTP_200_OK
        users = response.json()

        assert len(users) <= 1

    def test_get_user_by_id_as_admin(self, client, admin_headers, test_user):
        """Test getting specific user as admin - should succeed"""
        response = client.get(
            f"/api/v1/admin/users/{test_user.id}",
            headers=admin_headers
        )

        assert response.status_code == status.HTTP_200_OK
        user_data = response.json()

        assert user_data["id"] == str(test_user.id)
        assert user_data["email"] == test_user.email
        assert user_data["full_name"] == test_user.full_name

    def test_get_nonexistent_user(self, client, admin_headers):
        """Test getting non-existent user - should return 404"""
        fake_uuid = "00000000-0000-0000-0000-000000000000"
        response = client.get(
            f"/api/v1/admin/users/{fake_uuid}",
            headers=admin_headers
        )

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_update_user_role(self, client, admin_headers, test_user, db_session):
        """Test updating user admin role"""
        # Make user an admin
        response = client.patch(
            f"/api/v1/admin/users/{test_user.id}/role?is_admin=true",
            headers=admin_headers
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        assert data["is_admin"] is True

        # Verify in database
        db_session.refresh(test_user)
        assert test_user.is_admin is True

        # Remove admin role
        response = client.patch(
            f"/api/v1/admin/users/{test_user.id}/role?is_admin=false",
            headers=admin_headers
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        assert data["is_admin"] is False

    def test_update_user_status(self, client, admin_headers, test_user, db_session):
        """Test activating/deactivating user"""
        # Deactivate user
        response = client.patch(
            f"/api/v1/admin/users/{test_user.id}/status?is_active=false",
            headers=admin_headers
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        assert data["is_active"] is False

        # Verify in database
        db_session.refresh(test_user)
        assert test_user.is_active is False

        # Reactivate user
        response = client.patch(
            f"/api/v1/admin/users/{test_user.id}/status?is_active=true",
            headers=admin_headers
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        assert data["is_active"] is True

    def test_list_users_as_regular_user(self, client, auth_headers):
        """Test listing users as regular user - should fail"""
        response = client.get(
            "/api/v1/admin/users",
            headers=auth_headers
        )

        assert response.status_code == status.HTTP_403_FORBIDDEN


class TestAdminClubManagement:
    """Tests for admin club management endpoints"""

    def test_list_all_clubs_as_admin(self, client, admin_headers, sample_clubs):
        """Test listing all clubs including inactive as admin"""
        response = client.get(
            "/api/v1/admin/clubs",
            headers=admin_headers
        )

        assert response.status_code == status.HTTP_200_OK
        clubs = response.json()

        assert isinstance(clubs, list)
        assert len(clubs) == 3  # All clubs including inactive

        # Verify club structure
        club = clubs[0]
        assert "id" in club
        assert "name" in club
        assert "slug" in club
        assert "category" in club
        assert "is_active" in club
        assert "is_featured" in club

    def test_list_clubs_filter_inactive(self, client, admin_headers, sample_clubs):
        """Test filtering out inactive clubs"""
        response = client.get(
            "/api/v1/admin/clubs?include_inactive=false",
            headers=admin_headers
        )

        assert response.status_code == status.HTTP_200_OK
        clubs = response.json()

        assert len(clubs) == 2  # Only active clubs
        for club in clubs:
            assert club["is_active"] is True

    def test_toggle_club_featured_status(self, client, admin_headers, test_club, db_session):
        """Test toggling club featured status"""
        # Make club featured
        response = client.patch(
            f"/api/v1/admin/clubs/{test_club.id}/featured?is_featured=true",
            headers=admin_headers
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        assert data["is_featured"] is True

        # Verify in database
        db_session.refresh(test_club)
        assert test_club.is_featured is True

        # Remove featured status
        response = client.patch(
            f"/api/v1/admin/clubs/{test_club.id}/featured?is_featured=false",
            headers=admin_headers
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        assert data["is_featured"] is False

    def test_toggle_club_active_status(self, client, admin_headers, test_club, db_session):
        """Test toggling club active status"""
        # Deactivate club
        response = client.patch(
            f"/api/v1/admin/clubs/{test_club.id}/active?is_active=false",
            headers=admin_headers
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        assert data["is_active"] is False

        # Verify in database
        db_session.refresh(test_club)
        assert test_club.is_active is False

    def test_delete_club(self, client, admin_headers, test_club, db_session):
        """Test deleting a club"""
        club_id = test_club.id

        response = client.delete(
            f"/api/v1/admin/clubs/{club_id}",
            headers=admin_headers
        )

        assert response.status_code == status.HTTP_200_OK
        assert "deleted successfully" in response.json()["message"]

        # Verify club is deleted from database
        deleted_club = db_session.query(Club).filter(Club.id == club_id).first()
        assert deleted_club is None

    def test_delete_nonexistent_club(self, client, admin_headers):
        """Test deleting non-existent club - should return 404"""
        fake_uuid = "00000000-0000-0000-0000-000000000000"
        response = client.delete(
            f"/api/v1/admin/clubs/{fake_uuid}",
            headers=admin_headers
        )

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_club_operations_as_regular_user(self, client, auth_headers, test_club):
        """Test club operations as regular user - should fail"""
        # Try to toggle featured
        response = client.patch(
            f"/api/v1/admin/clubs/{test_club.id}/featured?is_featured=true",
            headers=auth_headers
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN

        # Try to delete
        response = client.delete(
            f"/api/v1/admin/clubs/{test_club.id}",
            headers=auth_headers
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN


class TestAdminActivityLog:
    """Tests for admin activity log endpoint"""

    def test_get_recent_activity(self, client, admin_headers, test_user, sample_clubs):
        """Test getting recent activity as admin"""
        response = client.get(
            "/api/v1/admin/activity",
            headers=admin_headers
        )

        assert response.status_code == status.HTTP_200_OK
        activity = response.json()

        assert isinstance(activity, list)

        # Activity should contain user registrations and club creations
        if len(activity) > 0:
            event = activity[0]
            assert "type" in event
            assert "timestamp" in event
            assert "description" in event

    def test_get_activity_with_limit(self, client, admin_headers):
        """Test getting activity with custom limit"""
        response = client.get(
            "/api/v1/admin/activity?limit=5",
            headers=admin_headers
        )

        assert response.status_code == status.HTTP_200_OK
        activity = response.json()

        assert len(activity) <= 5

    def test_get_activity_as_regular_user(self, client, auth_headers):
        """Test getting activity as regular user - should fail"""
        response = client.get(
            "/api/v1/admin/activity",
            headers=auth_headers
        )

        assert response.status_code == status.HTTP_403_FORBIDDEN
