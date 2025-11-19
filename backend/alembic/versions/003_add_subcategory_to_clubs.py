"""Add subcategory to clubs

Revision ID: 003_add_subcategory
Revises: 002_add_gallery_announcements
Create Date: 2025-11-19 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '003_add_subcategory'
down_revision = '002_add_gallery_announcements'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add subcategory column to clubs table"""
    op.add_column('clubs', sa.Column('subcategory', sa.String(length=100), nullable=True))
    op.create_index(op.f('ix_clubs_subcategory'), 'clubs', ['subcategory'], unique=False)


def downgrade() -> None:
    """Remove subcategory column from clubs table"""
    op.drop_index(op.f('ix_clubs_subcategory'), table_name='clubs')
    op.drop_column('clubs', 'subcategory')
