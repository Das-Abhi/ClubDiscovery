"""
Initialize database tables
Run this script to create all database tables
"""
from app.database import engine, Base
from app.models import User


def init_db():
    """Create all database tables"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")


if __name__ == "__main__":
    init_db()
