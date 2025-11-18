"""
Initialize database tables
Run this script to create all database tables
"""
from app.database import engine, Base
from app.models import User, Assessment, Recommendation, Club, Membership, Announcement, GallerySettings


def init_db():
    """Create all database tables"""
    print("Creating database tables...")
    print("- Users table")
    print("- Assessments table")
    print("- Recommendations table")
    print("- Clubs table")
    print("- Memberships table")
    print("- Announcements table")
    print("- Gallery Settings table")

    Base.metadata.create_all(bind=engine)

    print("\n✅ Database tables created successfully!")
    print("\nTables created:")
    print("  • users")
    print("  • assessments")
    print("  • recommendations")
    print("  • clubs")
    print("  • memberships")
    print("  • announcements")
    print("  • gallery_settings")


if __name__ == "__main__":
    init_db()
