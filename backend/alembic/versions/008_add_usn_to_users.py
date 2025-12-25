"""Add USN field to users table

Revision ID: 008_add_usn_to_users
Revises: 007_phase7_moderation_reports
Create Date: 2025-12-25

This migration adds the University Student Number (USN) field to the users table.
USN format: 1BM22CS001 (Year-BM-YY-Department-Roll)
The field is nullable to maintain backward compatibility with existing users.
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '008_add_usn_to_users'
down_revision = '007_phase7_moderation_reports'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add USN column to users table with unique constraint and index"""
    # Add USN column (nullable for existing users)
    op.add_column('users', sa.Column('usn', sa.String(20), nullable=True))

    # Create unique constraint for USN (allows NULL values)
    op.create_unique_constraint('uq_users_usn', 'users', ['usn'])

    # Create index for faster lookups
    op.create_index('idx_users_usn', 'users', ['usn'])

    print("  Added USN column to users table")


def downgrade() -> None:
    """Remove USN column from users table"""
    op.drop_index('idx_users_usn', table_name='users')
    op.drop_constraint('uq_users_usn', 'users', type_='unique')
    op.drop_column('users', 'usn')

    print("  Removed USN column from users table")
