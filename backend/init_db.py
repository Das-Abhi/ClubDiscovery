"""
Initialize database tables
Run this script to create all database tables
"""
from app.database import engine, Base
from app.models import User, Assessment, Recommendation, Club, Membership, Announcement, GallerySettings, Favorite, UserReport


def init_db():
    """Create all database tables"""
    print("Creating database tables...")
    print("- Users table (with auth tokens)")
    print("- Assessments table")
    print("- Recommendations table")
    print("- Clubs table (with approval status)")
    print("- Memberships table")
    print("- Announcements table")
    print("- Gallery Settings table")
    print("- Favorites table")
    print("- User Reports table (Phase 7)")

    Base.metadata.create_all(bind=engine)

    # Add PostgreSQL Full-Text Search (FTS) capabilities to clubs table
    print("\n🔍 Setting up Full-Text Search for clubs...")
    try:
        from sqlalchemy import text
        with engine.connect() as conn:
            # Check if search_vector column exists
            result = conn.execute(text("""
                SELECT column_name
                FROM information_schema.columns
                WHERE table_name='clubs' AND column_name='search_vector'
            """))

            if result.fetchone() is None:
                # Add generated tsvector column for full-text search
                conn.execute(text("""
                    ALTER TABLE clubs ADD COLUMN search_vector tsvector
                    GENERATED ALWAYS AS (
                        to_tsvector('english',
                            COALESCE(name, '') || ' ' ||
                            COALESCE(tagline, '') || ' ' ||
                            COALESCE(description, '')
                        )
                    ) STORED;
                """))

                # Create GIN index for fast full-text search
                conn.execute(text("""
                    CREATE INDEX idx_clubs_search_vector ON clubs USING GIN(search_vector);
                """))

                conn.commit()
                print("✅ Full-Text Search index created successfully!")
            else:
                print("✅ Full-Text Search index already exists")
    except Exception as e:
        print(f"⚠️  Warning: Could not create Full-Text Search index: {e}")
        print("   This is optional but improves search performance")

    print("\n✅ Database tables created successfully!")
    print("\nTables created:")
    print("  • users (includes password reset & email verification tokens)")
    print("  • assessments")
    print("  • recommendations")
    print("  • clubs (with Full-Text Search index & approval status)")
    print("  • memberships")
    print("  • announcements")
    print("  • gallery_settings")
    print("  • favorites (Phase 6)")
    print("  • user_reports (Phase 7)")
    print("\n📝 Phase 3 features:")
    print("  - reset_password_token")
    print("  - reset_password_token_expires")
    print("  - email_verification_token")
    print("  - email_verification_token_expires")
    print("\n🚀 Phase 5 features:")
    print("  - PostgreSQL Full-Text Search (GIN index)")
    print("  - O(log n) search performance vs O(n) with ILIKE")
    print("  - Relevance ranking with ts_rank")
    print("\n⭐ Phase 6 features:")
    print("  - Favorites/bookmarking system")
    print("  - User can favorite/bookmark clubs for quick access")
    print("\n🔧 Phase 7 features:")
    print("  - Content moderation workflow (approval_status field)")
    print("  - User reports system (report users, clubs, content)")
    print("  - CSV bulk import for clubs")
    print("  - Admin moderation endpoints (approve/reject/request revision)")


if __name__ == "__main__":
    init_db()
