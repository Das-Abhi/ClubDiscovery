"""
Initialize database using Alembic migrations
Run this script to apply all database migrations via Alembic
"""
import subprocess
import sys
from pathlib import Path

from app.database import engine, Base
from app.models import User, Assessment, Recommendation, Club, Membership, Announcement, GallerySettings, Favorite, UserReport


def init_db():
    """Initialize database using Alembic migrations"""
    print("=" * 80)
    print("ClubCompass Database Initialization")
    print("=" * 80)
    print("\n🚀 Initializing database with Alembic migrations...\n")

    # Get the backend directory path
    backend_dir = Path(__file__).parent

    try:
        # Method 1: Run Alembic migrations (preferred)
        print("📦 Running Alembic migrations...")
        result = subprocess.run(
            ["alembic", "upgrade", "head"],
            cwd=backend_dir,
            capture_output=True,
            text=True,
            check=False
        )

        if result.returncode == 0:
            print("✅ Alembic migrations applied successfully!")
            print(result.stdout)

            # Display migration details
            print("\n" + "=" * 80)
            print("Migration Summary")
            print("=" * 80)
            print("\n📝 Phase 3 features:")
            print("  • Password reset tokens (reset_password_token, reset_password_token_expires)")
            print("  • Email verification tokens (email_verification_token, email_verification_token_expires)")

            print("\n🚀 Phase 5 features:")
            print("  • PostgreSQL Full-Text Search (GIN index)")
            print("  • O(log n) search performance vs O(n) with ILIKE")
            print("  • Relevance ranking with ts_rank")

            print("\n⭐ Phase 6 features:")
            print("  • Favorites/bookmarking system")
            print("  • User can favorite/bookmark clubs for quick access")

            print("\n🔧 Phase 7 features:")
            print("  • Content moderation workflow (approval_status field)")
            print("  • User reports system (report users, clubs, content)")
            print("  • CSV bulk import for clubs")

            print("\n📊 Database tables initialized:")
            print("  • users (includes password reset & email verification tokens)")
            print("  • assessments")
            print("  • recommendations")
            print("  • clubs (with Full-Text Search index & approval status)")
            print("  • memberships")
            print("  • announcements")
            print("  • gallery_settings")
            print("  • favorites")
            print("  • user_reports")

            print("\n" + "=" * 80)
            print("✅ Database initialization completed successfully!")
            print("=" * 80)

            return True

        else:
            print("⚠️  Alembic migrations failed. Falling back to direct table creation...")
            print(f"Error: {result.stderr}")
            raise Exception("Alembic migration failed")

    except Exception as e:
        # Method 2: Fallback to direct table creation (for development/testing)
        print(f"\n⚠️  Could not run Alembic migrations: {e}")
        print("🔄 Falling back to direct table creation (development mode)...\n")

        print("Creating database tables directly...")
        print("- Users table (with auth tokens)")
        print("- Assessments table")
        print("- Recommendations table")
        print("- Clubs table (with approval status)")
        print("- Memberships table")
        print("- Announcements table")
        print("- Gallery Settings table")
        print("- Favorites table")
        print("- User Reports table")

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
        except Exception as fts_error:
            print(f"⚠️  Warning: Could not create Full-Text Search index: {fts_error}")
            print("   This is optional but improves search performance")

        print("\n⚠️  Database initialized using fallback method")
        print("💡 For production, ensure Alembic migrations are working properly")

        return False


if __name__ == "__main__":
    init_db()
