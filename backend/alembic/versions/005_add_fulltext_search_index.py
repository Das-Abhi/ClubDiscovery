"""Add full-text search GIN index to clubs table

Revision ID: 005_add_fulltext_search
Revises: 004_add_auth_tokens
Create Date: 2025-11-19 16:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '005_add_fulltext_search'
down_revision = '004_add_auth_tokens'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add PostgreSQL Full-Text Search GIN index to clubs table

    This creates a GIN index on a tsvector generated from the club's name,
    tagline, and description fields to enable fast full-text search.

    Performance improvement: O(n) ILIKE search → O(log n) FTS search
    """
    # Add a generated tsvector column for full-text search (PostgreSQL 12+)
    # Note: For PostgreSQL < 12, you would need to use a trigger-based approach
    op.execute("""
        ALTER TABLE clubs ADD COLUMN search_vector tsvector
        GENERATED ALWAYS AS (
            to_tsvector('english',
                COALESCE(name, '') || ' ' ||
                COALESCE(tagline, '') || ' ' ||
                COALESCE(description, '')
            )
        ) STORED;
    """)

    # Create GIN index on the tsvector column for fast full-text search
    op.execute("""
        CREATE INDEX idx_clubs_search_vector ON clubs USING GIN(search_vector);
    """)

    print("✅ Created full-text search index on clubs table")
    print("   - Added search_vector generated column")
    print("   - Created GIN index for O(log n) search performance")


def downgrade() -> None:
    """Remove PostgreSQL Full-Text Search GIN index from clubs table"""
    # Drop the GIN index first
    op.execute("DROP INDEX IF EXISTS idx_clubs_search_vector;")

    # Drop the generated column
    op.execute("ALTER TABLE clubs DROP COLUMN IF EXISTS search_vector;")

    print("✅ Removed full-text search index from clubs table")
