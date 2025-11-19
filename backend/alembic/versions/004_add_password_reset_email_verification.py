"""Add password reset and email verification tokens to users

Revision ID: 004_add_auth_tokens
Revises: 003_add_subcategory
Create Date: 2025-11-19 14:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '004_add_auth_tokens'
down_revision = '003_add_subcategory'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add password reset and email verification token columns to users table"""
    # Add password reset token fields
    op.add_column('users', sa.Column('reset_password_token', sa.String(length=255), nullable=True))
    op.add_column('users', sa.Column('reset_password_token_expires', sa.DateTime(), nullable=True))

    # Add email verification token fields
    op.add_column('users', sa.Column('email_verification_token', sa.String(length=255), nullable=True))
    op.add_column('users', sa.Column('email_verification_token_expires', sa.DateTime(), nullable=True))

    # Create indexes for better query performance
    op.create_index(op.f('ix_users_reset_password_token'), 'users', ['reset_password_token'], unique=False)
    op.create_index(op.f('ix_users_email_verification_token'), 'users', ['email_verification_token'], unique=False)


def downgrade() -> None:
    """Remove password reset and email verification token columns from users table"""
    # Drop indexes first
    op.drop_index(op.f('ix_users_email_verification_token'), table_name='users')
    op.drop_index(op.f('ix_users_reset_password_token'), table_name='users')

    # Drop columns
    op.drop_column('users', 'email_verification_token_expires')
    op.drop_column('users', 'email_verification_token')
    op.drop_column('users', 'reset_password_token_expires')
    op.drop_column('users', 'reset_password_token')
