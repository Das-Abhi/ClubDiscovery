"""Initial database schema - base tables

Revision ID: 001_initial_schema
Revises: None
Create Date: 2025-11-19 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001_initial_schema'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create initial database schema for ClubCompass

    This migration creates the foundational tables:
    - users: User accounts with BMSCE email validation
    - clubs: Club information with categorization
    - assessments: User assessment responses
    - recommendations: Assessment-based club recommendations
    - memberships: User-club membership relationships
    """

    # Create users table
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('email', sa.String(255), nullable=False, unique=True),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('full_name', sa.String(255), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=False),
        sa.Column('email_verified', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('is_admin', sa.Boolean(), server_default='false', nullable=False),
        sa.CheckConstraint("email ~* '^[A-Za-z0-9._%+-]+@bmsce\\.ac\\.in$'", name='email_format'),
    )
    op.create_index('idx_users_email', 'users', ['email'])
    op.create_index('idx_users_created_at', 'users', ['created_at'])

    # Create clubs table
    op.create_table(
        'clubs',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('slug', sa.String(255), nullable=False, unique=True),
        sa.Column('category', sa.String(50), nullable=False),
        sa.Column('tagline', sa.String(255), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('overview', sa.Text(), nullable=True),
        sa.Column('logo_url', sa.String(500), nullable=True),
        sa.Column('cover_image_url', sa.String(500), nullable=True),
        sa.Column('instagram', sa.String(100), nullable=True),
        sa.Column('linkedin', sa.String(100), nullable=True),
        sa.Column('twitter', sa.String(100), nullable=True),
        sa.Column('website', sa.String(200), nullable=True),
        sa.Column('faculty_contact', postgresql.JSONB(), nullable=True),
        sa.Column('student_contacts', postgresql.ARRAY(postgresql.JSONB()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('is_featured', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('view_count', sa.Integer(), server_default='0', nullable=False),
        sa.CheckConstraint("category IN ('cocurricular', 'extracurricular', 'department')", name='valid_category'),
    )
    op.create_index('idx_clubs_category', 'clubs', ['category'])
    op.create_index('idx_clubs_slug', 'clubs', ['slug'])

    # Create assessments table
    op.create_table(
        'assessments',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('responses', postgresql.JSONB(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
    )
    op.create_index('idx_assessments_user', 'assessments', ['user_id'])
    op.create_index('idx_assessments_created_at', 'assessments', ['created_at'])

    # Create recommendations table
    op.create_table(
        'recommendations',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('assessment_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('club_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('score', sa.Integer(), nullable=False),
        sa.Column('rank', sa.Integer(), nullable=False),
        sa.Column('reasoning', postgresql.JSONB(), nullable=True),
        sa.ForeignKeyConstraint(['assessment_id'], ['assessments.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['club_id'], ['clubs.id'], ondelete='CASCADE'),
        sa.UniqueConstraint('assessment_id', 'club_id', name='uq_assessment_club'),
    )
    op.create_index('idx_recommendations_assessment', 'recommendations', ['assessment_id'])
    op.create_index('idx_recommendations_score', 'recommendations', ['assessment_id', 'score'], postgresql_ops={'score': 'DESC'})

    # Create memberships table
    op.create_table(
        'memberships',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('club_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('role', sa.String(50), server_default='member', nullable=False),
        sa.Column('joined_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=False),
        sa.Column('status', sa.String(50), server_default='active', nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['club_id'], ['clubs.id'], ondelete='CASCADE'),
        sa.UniqueConstraint('user_id', 'club_id', name='uq_user_club'),
    )
    op.create_index('idx_memberships_user', 'memberships', ['user_id'])
    op.create_index('idx_memberships_club', 'memberships', ['club_id'])

    print("✅ Created initial database schema (Phase 0-2)")
    print("   - users table with BMSCE email validation")
    print("   - clubs table with categorization")
    print("   - assessments table")
    print("   - recommendations table with scoring")
    print("   - memberships table")


def downgrade() -> None:
    """Drop all tables"""
    op.drop_table('memberships')
    op.drop_table('recommendations')
    op.drop_table('assessments')
    op.drop_table('clubs')
    op.drop_table('users')

    print("✅ Dropped initial database schema")
