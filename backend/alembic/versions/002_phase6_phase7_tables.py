"""Add Phase 6 and Phase 7 tables

Revision ID: 002_phase6_phase7_tables
Revises: 001_initial_schema
Create Date: 2025-11-19 01:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '002_phase6_phase7_tables'
down_revision = '001_initial_schema'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add Phase 6 and Phase 7 feature tables

    Phase 6 tables:
    - announcements: Club announcements
    - gallery_settings: Instagram gallery settings
    - favorites: User favorites/bookmarks

    Phase 7 tables:
    - user_reports: Content moderation and user reports
    """

    # Create announcements table (Phase 6)
    op.create_table(
        'announcements',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('club_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('priority', sa.Integer(), server_default='0', nullable=False),
        sa.ForeignKeyConstraint(['club_id'], ['clubs.id'], ondelete='CASCADE'),
    )
    op.create_index('idx_announcements_club', 'announcements', ['club_id'])
    op.create_index('idx_announcements_created_at', 'announcements', ['created_at'])

    # Create gallery_settings table (Phase 6)
    op.create_table(
        'gallery_settings',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('club_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('instagram_username', sa.String(100), nullable=True),
        sa.Column('instagram_access_token', sa.String(500), nullable=True),
        sa.Column('is_enabled', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('max_posts', sa.Integer(), server_default='6', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=False),
        sa.ForeignKeyConstraint(['club_id'], ['clubs.id'], ondelete='CASCADE'),
    )
    op.create_index('idx_gallery_settings_club', 'gallery_settings', ['club_id'])

    # Create favorites table (Phase 6)
    op.create_table(
        'favorites',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('club_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['club_id'], ['clubs.id'], ondelete='CASCADE'),
        sa.UniqueConstraint('user_id', 'club_id', name='uq_user_club_favorite'),
    )
    op.create_index('idx_favorites_user', 'favorites', ['user_id'])
    op.create_index('idx_favorites_club', 'favorites', ['club_id'])

    # Create user_reports table (Phase 7)
    op.create_table(
        'user_reports',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('reporter_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('reported_user_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('reported_club_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('report_type', sa.String(50), nullable=False),
        sa.Column('reason', sa.Text(), nullable=False),
        sa.Column('status', sa.String(50), server_default='pending', nullable=False),
        sa.Column('admin_notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=False),
        sa.Column('resolved_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('resolved_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.ForeignKeyConstraint(['reporter_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['reported_user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['reported_club_id'], ['clubs.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['resolved_by'], ['users.id'], ondelete='SET NULL'),
        sa.CheckConstraint(
            "report_type IN ('spam', 'inappropriate', 'harassment', 'fake_profile', 'other')",
            name='valid_report_type'
        ),
        sa.CheckConstraint(
            "status IN ('pending', 'reviewing', 'resolved', 'rejected')",
            name='valid_status'
        ),
    )
    op.create_index('idx_user_reports_reporter', 'user_reports', ['reporter_id'])
    op.create_index('idx_user_reports_status', 'user_reports', ['status'])
    op.create_index('idx_user_reports_created_at', 'user_reports', ['created_at'])

    # Add approval_status to clubs table (Phase 7 - Content Moderation)
    op.add_column('clubs', sa.Column('approval_status', sa.String(50), server_default='approved', nullable=False))
    op.create_check_constraint(
        'valid_approval_status',
        'clubs',
        "approval_status IN ('pending', 'approved', 'rejected', 'revision_required')"
    )
    op.create_index('idx_clubs_approval_status', 'clubs', ['approval_status'])

    print("✅ Created Phase 6 and Phase 7 tables")
    print("   Phase 6:")
    print("   - announcements table")
    print("   - gallery_settings table")
    print("   - favorites table")
    print("   Phase 7:")
    print("   - user_reports table")
    print("   - approval_status column in clubs")


def downgrade() -> None:
    """Drop Phase 6 and Phase 7 tables"""
    op.drop_index('idx_clubs_approval_status', 'clubs')
    op.drop_constraint('valid_approval_status', 'clubs', type_='check')
    op.drop_column('clubs', 'approval_status')

    op.drop_table('user_reports')
    op.drop_table('favorites')
    op.drop_table('gallery_settings')
    op.drop_table('announcements')

    print("✅ Dropped Phase 6 and Phase 7 tables")
