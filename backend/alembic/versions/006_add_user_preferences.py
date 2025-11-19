"""Add user preferences JSON field to users table

Revision ID: 006_add_user_preferences
Revises: 005_add_fulltext_search
Create Date: 2025-11-19 16:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '006_add_user_preferences'
down_revision = '005_add_fulltext_search'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add preferences JSONB column to users table

    This enables storing user preferences as structured JSON data:
    - UI theme preference (light/dark)
    - Notification settings
    - Preferred club categories
    - Language preference
    - Newsletter subscription status

    JSONB provides efficient querying and indexing capabilities for JSON data.
    """
    # Add preferences column as JSONB (JSON with binary storage for better performance)
    op.add_column(
        'users',
        sa.Column('preferences', postgresql.JSONB(astext_type=sa.Text()), nullable=True)
    )

    # Set default empty object for existing users
    op.execute("UPDATE users SET preferences = '{}'::jsonb WHERE preferences IS NULL")

    print("✅ Added user preferences field")
    print("   - JSONB column for structured preference storage")
    print("   - Supports: theme, notifications, categories, language, etc.")


def downgrade() -> None:
    """Remove preferences column from users table"""
    op.drop_column('users', 'preferences')

    print("✅ Removed user preferences field")
