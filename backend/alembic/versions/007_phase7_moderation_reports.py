"""Phase 7: Add moderation workflow and user reports

Revision ID: 007_phase7_moderation_reports
Revises: 006_add_user_preferences
Create Date: 2025-11-19

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '007_phase7_moderation_reports'
down_revision = '006_add_user_preferences'
branch_labels = None
depends_on = None


def upgrade():
    # Add approval_status and rejection_reason to clubs table
    op.add_column('clubs', sa.Column('approval_status',
        sa.Enum('PENDING', 'APPROVED', 'REJECTED', 'NEEDS_REVISION', name='approvalstatus'),
        nullable=False,
        server_default='APPROVED'))

    op.add_column('clubs', sa.Column('rejection_reason', sa.Text(), nullable=True))

    # Create index on approval_status
    op.create_index(op.f('ix_clubs_approval_status'), 'clubs', ['approval_status'], unique=False)

    # Create user_reports table
    op.create_table('user_reports',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('reporter_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('reported_user_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('reported_club_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('report_type',
            sa.Enum('USER', 'CLUB', 'CONTENT', 'OTHER', name='reporttype'),
            nullable=False),
        sa.Column('reason', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('status',
            sa.Enum('PENDING', 'REVIEWING', 'RESOLVED', 'REJECTED', name='reportstatus'),
            nullable=False,
            server_default='PENDING'),
        sa.Column('reviewed_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('admin_notes', sa.Text(), nullable=True),
        sa.Column('reviewed_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['reporter_id'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['reported_user_id'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['reported_club_id'], ['clubs.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['reviewed_by'], ['users.id'], ondelete='SET NULL')
    )

    # Create indexes on user_reports
    op.create_index(op.f('ix_user_reports_reporter_id'), 'user_reports', ['reporter_id'], unique=False)
    op.create_index(op.f('ix_user_reports_reported_user_id'), 'user_reports', ['reported_user_id'], unique=False)
    op.create_index(op.f('ix_user_reports_reported_club_id'), 'user_reports', ['reported_club_id'], unique=False)
    op.create_index(op.f('ix_user_reports_report_type'), 'user_reports', ['report_type'], unique=False)
    op.create_index(op.f('ix_user_reports_status'), 'user_reports', ['status'], unique=False)
    op.create_index(op.f('ix_user_reports_reviewed_by'), 'user_reports', ['reviewed_by'], unique=False)
    op.create_index(op.f('ix_user_reports_created_at'), 'user_reports', ['created_at'], unique=False)


def downgrade():
    # Drop user_reports table and indexes
    op.drop_index(op.f('ix_user_reports_created_at'), table_name='user_reports')
    op.drop_index(op.f('ix_user_reports_reviewed_by'), table_name='user_reports')
    op.drop_index(op.f('ix_user_reports_status'), table_name='user_reports')
    op.drop_index(op.f('ix_user_reports_report_type'), table_name='user_reports')
    op.drop_index(op.f('ix_user_reports_reported_club_id'), table_name='user_reports')
    op.drop_index(op.f('ix_user_reports_reported_user_id'), table_name='user_reports')
    op.drop_index(op.f('ix_user_reports_reporter_id'), table_name='user_reports')
    op.drop_table('user_reports')

    # Drop approval_status column and index from clubs
    op.drop_index(op.f('ix_clubs_approval_status'), table_name='clubs')
    op.drop_column('clubs', 'rejection_reason')
    op.drop_column('clubs', 'approval_status')

    # Drop enum types
    op.execute('DROP TYPE IF EXISTS reportstatus')
    op.execute('DROP TYPE IF EXISTS reporttype')
    op.execute('DROP TYPE IF EXISTS approvalstatus')
