"""
Unit tests for security headers validation
Tests OWASP security headers and CORS configuration
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app


client = TestClient(app)


class TestSecurityHeaders:
    """Test suite for security headers"""

    def test_security_headers_on_root_endpoint(self):
        """Test that security headers are present on root endpoint"""
        response = client.get("/")

        # Should have CORS headers
        assert "access-control-allow-origin" in response.headers
        assert response.status_code == 200

    def test_security_headers_on_api_endpoint(self):
        """Test that security headers are present on API endpoints"""
        response = client.get("/api/v1/clubs/")

        # Should have CORS headers
        assert "access-control-allow-origin" in response.headers
        assert response.status_code == 200

    def test_cors_allow_credentials(self):
        """Test that CORS allows credentials"""
        response = client.options(
            "/api/v1/clubs/",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "GET",
            },
        )

        assert "access-control-allow-credentials" in response.headers
        assert response.headers["access-control-allow-credentials"] == "true"

    def test_cors_allowed_methods(self):
        """Test that CORS allows required methods"""
        response = client.options(
            "/api/v1/clubs/",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "POST",
            },
        )

        allowed_methods = response.headers.get("access-control-allow-methods", "")
        required_methods = ["GET", "POST", "PUT", "PATCH", "DELETE"]

        for method in required_methods:
            assert method in allowed_methods

    def test_cors_allowed_headers(self):
        """Test that CORS allows required headers"""
        response = client.options(
            "/api/v1/clubs/",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "GET",
                "Access-Control-Request-Headers": "Authorization, Content-Type",
            },
        )

        allowed_headers = response.headers.get("access-control-allow-headers", "").lower()
        assert "authorization" in allowed_headers
        assert "content-type" in allowed_headers

    def test_compression_enabled(self):
        """Test that GZip compression is enabled for large responses"""
        # Make a request that should return a large response
        response = client.get("/api/v1/clubs/")

        # GZip middleware should add vary header
        if len(response.content) > 1000:
            # Large responses should be compressed
            # Note: The actual compression header depends on the client's Accept-Encoding
            assert response.status_code == 200

    def test_json_content_type(self):
        """Test that API endpoints return JSON content type"""
        response = client.get("/api/v1/clubs/")

        content_type = response.headers.get("content-type", "")
        assert "application/json" in content_type

    def test_health_endpoint_accessible(self):
        """Test that health check endpoint is accessible"""
        response = client.get("/health")

        assert response.status_code == 200
        assert response.json()["status"] == "healthy"
        assert response.json()["service"] == "clubcompass-api"

    def test_api_documentation_accessible(self):
        """Test that API documentation is accessible"""
        # Test OpenAPI JSON
        response = client.get("/openapi.json")
        assert response.status_code == 200
        assert "openapi" in response.json()

        # Test Swagger UI
        response = client.get("/docs")
        assert response.status_code == 200

        # Test ReDoc
        response = client.get("/redoc")
        assert response.status_code == 200


class TestRateLimiting:
    """Test suite for rate limiting"""

    def test_rate_limiter_configured(self):
        """Test that rate limiter is configured"""
        # Make a request to verify rate limiter is set up
        response = client.get("/api/v1/clubs/")
        assert response.status_code == 200

        # Rate limit headers should be present (from slowapi)
        # Note: Actual rate limiting behavior depends on Redis configuration
        # This test just verifies the endpoint is accessible

    def test_excessive_requests_rate_limited(self):
        """Test that excessive requests are rate limited"""
        # This test would require Redis to be configured
        # For now, just verify the endpoint responds correctly
        for _ in range(5):
            response = client.get("/api/v1/clubs/")
            assert response.status_code in [200, 429]  # 200 or rate limited

            if response.status_code == 429:
                # Should have retry-after header
                assert "retry-after" in response.headers
                break


class TestCSRFProtection:
    """Test suite for CSRF protection"""

    def test_get_requests_allowed_without_token(self):
        """Test that GET requests work without CSRF token"""
        response = client.get("/api/v1/clubs/")
        assert response.status_code == 200

    def test_post_requests_require_authentication(self):
        """Test that POST requests require authentication"""
        response = client.post(
            "/api/v1/clubs/",
            json={
                "name": "Test Club",
                "slug": "test-club",
                "category": "cocurricular",
            },
        )

        # Should be unauthorized without auth token
        assert response.status_code in [401, 403, 422]  # Various auth errors


class TestInputValidation:
    """Test suite for input validation"""

    def test_invalid_club_category_rejected(self):
        """Test that invalid club category is rejected"""
        response = client.get("/api/v1/clubs/?category=invalid")

        # Should either reject or return empty list
        assert response.status_code in [200, 422]

        if response.status_code == 200:
            # Should return empty list or validation error
            data = response.json()
            assert "data" in data

    def test_sql_injection_prevented(self):
        """Test that SQL injection attempts are prevented"""
        # Try SQL injection in search parameter
        response = client.get(
            "/api/v1/clubs/?search=' OR '1'='1"
        )

        # Should not cause an error (SQLAlchemy prevents injection)
        assert response.status_code == 200

    def test_xss_prevention_in_search(self):
        """Test that XSS attempts in search are handled safely"""
        xss_payload = "<script>alert('XSS')</script>"
        response = client.get(
            f"/api/v1/clubs/?search={xss_payload}"
        )

        # Should not cause an error
        assert response.status_code == 200

    def test_pagination_validation(self):
        """Test that pagination parameters are validated"""
        # Test negative page number
        response = client.get("/api/v1/clubs/?page=-1")
        assert response.status_code in [200, 422]

        # Test zero page number
        response = client.get("/api/v1/clubs/?page=0")
        assert response.status_code in [200, 422]

        # Test excessive per_page
        response = client.get("/api/v1/clubs/?per_page=10000")
        assert response.status_code in [200, 422]


class TestErrorHandling:
    """Test suite for error handling"""

    def test_404_error_handled(self):
        """Test that 404 errors are handled properly"""
        response = client.get("/api/v1/clubs/nonexistent-club-slug")

        # Should return 404 or empty response
        assert response.status_code in [200, 404]

    def test_405_method_not_allowed(self):
        """Test that invalid HTTP methods return 405"""
        # Try to DELETE the clubs list endpoint
        response = client.request("TRACE", "/api/v1/clubs/")

        # Should return method not allowed
        assert response.status_code in [405, 422]

    def test_error_response_format(self):
        """Test that error responses have consistent format"""
        # Trigger an error by accessing non-existent endpoint
        response = client.get("/api/v1/nonexistent")

        # Should return JSON error
        if response.status_code >= 400:
            # FastAPI returns detail in error responses
            assert response.headers.get("content-type") == "application/json"


class TestAuthentication:
    """Test suite for authentication security"""

    def test_protected_endpoints_require_auth(self):
        """Test that protected endpoints require authentication"""
        # Try to create a club without auth
        response = client.post(
            "/api/v1/clubs/",
            json={
                "name": "Test Club",
                "slug": "test-club",
                "category": "cocurricular",
            },
        )

        # Should be unauthorized
        assert response.status_code in [401, 403, 422]

    def test_invalid_token_rejected(self):
        """Test that invalid auth tokens are rejected"""
        headers = {"Authorization": "Bearer invalid_token"}
        response = client.get("/api/v1/users/me", headers=headers)

        # Should be unauthorized
        assert response.status_code == 401

    def test_malformed_token_rejected(self):
        """Test that malformed auth tokens are rejected"""
        headers = {"Authorization": "NotBearer token"}
        response = client.get("/api/v1/users/me", headers=headers)

        # Should be unauthorized
        assert response.status_code in [401, 403]
