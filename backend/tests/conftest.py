"""
Pytest configuration and shared fixtures
"""
import pytest
from typing import Generator
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import Base, get_db
from app.models.user import User
from app.models.club import Club, Membership
from app.core.security import get_password_hash, create_access_token


# Create in-memory SQLite database for testing
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session() -> Generator:
    """
    Create a fresh database session for each test
    """
    # Create tables
    Base.metadata.create_all(bind=engine)

    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        # Drop all tables after test
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session) -> Generator:
    """
    Create a test client with database session override
    """
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture
def test_user(db_session) -> User:
    """
    Create a test user
    """
    user = User(
        email="test@bmsce.ac.in",
        password_hash=get_password_hash("TestPass123!"),
        full_name="Test User",
        email_verified=True,
        is_active=True,
        is_admin=False
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def test_admin(db_session) -> User:
    """
    Create a test admin user
    """
    admin = User(
        email="admin@bmsce.ac.in",
        password_hash=get_password_hash("AdminPass123!"),
        full_name="Admin User",
        email_verified=True,
        is_active=True,
        is_admin=True
    )
    db_session.add(admin)
    db_session.commit()
    db_session.refresh(admin)
    return admin


@pytest.fixture
def test_club(db_session) -> Club:
    """
    Create a test club
    """
    club = Club(
        name="Test Club",
        slug="test-club",
        category="cocurricular",
        tagline="A test club for testing",
        description="This is a test club",
        is_active=True,
        is_featured=False
    )
    db_session.add(club)
    db_session.commit()
    db_session.refresh(club)
    return club


@pytest.fixture
def auth_headers(test_user) -> dict:
    """
    Create authentication headers for regular user
    """
    access_token = create_access_token(data={"sub": test_user.email})
    return {"Authorization": f"Bearer {access_token}"}


@pytest.fixture
def admin_headers(test_admin) -> dict:
    """
    Create authentication headers for admin user
    """
    access_token = create_access_token(data={"sub": test_admin.email})
    return {"Authorization": f"Bearer {access_token}"}


@pytest.fixture
def sample_clubs(db_session) -> list[Club]:
    """
    Create multiple test clubs
    """
    clubs = [
        Club(
            name="ACM Student Chapter",
            slug="acm",
            category="cocurricular",
            tagline="Computing & AI club",
            description="ACM student chapter",
            is_active=True,
            is_featured=True,
            member_count=50
        ),
        Club(
            name="Music Club",
            slug="music-club",
            category="extracurricular",
            tagline="Music and performances",
            description="College music club",
            is_active=True,
            is_featured=False,
            member_count=30
        ),
        Club(
            name="CSE Department Club",
            slug="cse-dept",
            category="department",
            tagline="Computer Science Department",
            description="CSE department club",
            is_active=False,
            is_featured=False,
            member_count=100
        ),
    ]

    for club in clubs:
        db_session.add(club)

    db_session.commit()

    for club in clubs:
        db_session.refresh(club)

    return clubs
