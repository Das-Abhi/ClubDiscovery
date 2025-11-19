# Database Migrations Guide

This document provides comprehensive guidance on managing database migrations for the ClubCompass application using Alembic.

## Table of Contents

1. [Overview](#overview)
2. [Setup](#setup)
3. [Common Operations](#common-operations)
4. [Migration Workflow](#migration-workflow)
5. [Best Practices](#best-practices)
6. [Troubleshooting](#troubleshooting)

## Overview

ClubCompass uses **Alembic** for database schema version control and migrations. Alembic is a lightweight database migration tool that works with SQLAlchemy to manage database schema changes in a version-controlled, repeatable manner.

### Why Alembic?

- ✅ Version-controlled database schemas
- ✅ Automatic migration generation from model changes
- ✅ Safe rollback capabilities
- ✅ Production-ready migration management
- ✅ Support for complex schema changes

## Setup

### First-Time Setup (Existing Database)

If you're setting up Alembic for an existing database that was created using `init_db.py`:

```bash
cd backend

# Stamp the database at the current state (no migrations run)
python manage_migrations.py init

# Verify the setup
python manage_migrations.py current
```

This marks your database as being at the "head" revision without running any migrations.

### New Database Setup

For a completely new database:

```bash
cd backend

# Run initial database setup
python init_db.py

# Stamp at head (since schema matches models)
python manage_migrations.py init
```

## Common Operations

### Using the Migration Management Script

We provide a convenient `manage_migrations.py` script for common operations:

#### Create a New Migration

```bash
# Auto-generate migration from model changes
python manage_migrations.py create "Add user preferences table"
```

This will:
- Compare your models with the current database
- Generate a migration file in `alembic/versions/`
- Include both `upgrade()` and `downgrade()` functions

#### Apply Migrations

```bash
# Upgrade to latest version
python manage_migrations.py upgrade

# Upgrade to specific revision
python manage_migrations.py upgrade <revision_id>
```

#### Rollback Migrations

```bash
# Rollback one migration
python manage_migrations.py downgrade

# Rollback to specific revision
python manage_migrations.py downgrade <revision_id>

# Rollback all migrations
python manage_migrations.py downgrade base
```

#### Check Migration Status

```bash
# Show current revision
python manage_migrations.py current

# Show migration history
python manage_migrations.py history

# Check if migrations are needed
python manage_migrations.py check
```

### Using Alembic Directly

You can also use Alembic commands directly:

```bash
# Create empty migration (for data migrations)
python -m alembic revision -m "Seed initial club data"

# View SQL without executing
python -m alembic upgrade head --sql

# Show detailed history
python -m alembic history --verbose
```

## Migration Workflow

### Standard Development Workflow

1. **Modify your models** in `app/models/`
   ```python
   # Example: Add a new column to User model
   class User(Base):
       # ... existing columns ...
       phone_number = Column(String(15), nullable=True)
   ```

2. **Create migration**
   ```bash
   python manage_migrations.py create "Add phone number to users"
   ```

3. **Review the generated migration** in `alembic/versions/`
   ```python
   def upgrade() -> None:
       op.add_column('users', sa.Column('phone_number', sa.String(15), nullable=True))

   def downgrade() -> None:
       op.drop_column('users', 'phone_number')
   ```

4. **Test the migration** on development database
   ```bash
   python manage_migrations.py upgrade
   ```

5. **Test the rollback**
   ```bash
   python manage_migrations.py downgrade
   python manage_migrations.py upgrade  # Re-apply
   ```

6. **Commit the migration file** to version control
   ```bash
   git add alembic/versions/<revision>_add_phone_number_to_users.py
   git commit -m "feat(db): add phone number to users"
   ```

### Data Migrations

For migrations that modify data (not just schema):

1. **Create empty migration**
   ```bash
   python -m alembic revision -m "Populate default user roles"
   ```

2. **Edit the migration** to include data operations
   ```python
   def upgrade() -> None:
       # Get database connection
       connection = op.get_bind()

       # Execute data operations
       connection.execute(
           text("UPDATE users SET role = 'member' WHERE role IS NULL")
       )

   def downgrade() -> None:
       # Reverse data changes if possible
       pass
   ```

### Complex Migrations

For complex changes that Alembic can't auto-generate:

1. Create the migration and review carefully
2. Add manual adjustments as needed
3. Test thoroughly with realistic data
4. Document any manual steps required

## Best Practices

### 1. Always Review Auto-Generated Migrations

Alembic's autogenerate is powerful but not perfect. Always review:
- Column type changes
- Index creation/deletion
- Constraint modifications
- Enum type changes

### 2. Make Migrations Reversible

Always implement both `upgrade()` and `downgrade()`:

```python
# Good ✅
def upgrade() -> None:
    op.add_column('users', sa.Column('phone', sa.String(15)))

def downgrade() -> None:
    op.drop_column('users', 'phone')

# Bad ❌
def downgrade() -> None:
    pass  # No rollback capability
```

### 3. Keep Migrations Atomic

One logical change per migration:

```bash
# Good ✅
python manage_migrations.py create "Add phone to users"
python manage_migrations.py create "Add address to users"

# Bad ❌
python manage_migrations.py create "Add various user fields"
```

### 4. Test Before Production

```bash
# Create database backup
pg_dump clubcompass > backup.sql

# Test migration
python manage_migrations.py upgrade

# Verify application still works
python -m pytest

# Test rollback
python manage_migrations.py downgrade
python manage_migrations.py upgrade  # Re-apply
```

### 5. Backup Production Database

**Always backup before migrating production:**

```bash
# PostgreSQL backup
pg_dump -h <host> -U <user> -d clubcompass > prod_backup_$(date +%Y%m%d).sql

# Verify backup
pg_restore --list prod_backup_*.sql

# Run migration
python manage_migrations.py upgrade
```

### 6. Handle Migration Conflicts

If multiple developers create migrations:

```bash
# Merge migrations into a linear history
python -m alembic merge heads -m "Merge migrations"
```

## Troubleshooting

### Migration Not Detecting Model Changes

**Problem:** `alembic revision --autogenerate` doesn't detect your changes

**Solutions:**
1. Ensure model is imported in `alembic/env.py`
2. Verify you're modifying the correct model file
3. Check that models inherit from `Base`
4. Try running `python -c "from app.models import *"` to verify imports

### Database Out of Sync

**Problem:** "Target database is not up to date"

**Solution:**
```bash
# Check current state
python manage_migrations.py current

# Apply pending migrations
python manage_migrations.py upgrade
```

### Can't Locate Revision

**Problem:** "Can't locate revision identified by '<revision_id>'"

**Solutions:**
1. Ensure all migration files are in `alembic/versions/`
2. Check for missing migration files in version control
3. Verify the revision chain is intact

### Manual SQL Migration Files

If you have manual SQL migrations (like `migrations/add_is_admin_to_users.sql`):

1. **Don't run them directly** - convert to Alembic migrations
2. Create an empty Alembic migration
3. Add the SQL using `op.execute()`

```python
def upgrade() -> None:
    op.execute("""
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
    """)
```

### Production Migration Failed Midway

**If a migration fails in production:**

1. **Don't panic** - transactions ensure atomicity
2. Check error logs
3. Fix the issue (bad SQL, missing dependency, etc.)
4. Re-run the migration
5. If needed, manually rollback and fix

```bash
# Check what went wrong
python manage_migrations.py current

# Fix the migration file
vim alembic/versions/<failed_revision>.py

# Try again
python manage_migrations.py upgrade
```

## CI/CD Integration

### GitHub Actions Example

```yaml
- name: Run Database Migrations
  run: |
    cd backend
    python manage_migrations.py upgrade
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

### Docker Integration

In your `docker-compose.yml`:

```yaml
services:
  backend:
    command: >
      sh -c "python manage_migrations.py upgrade &&
             uvicorn app.main:app --host 0.0.0.0"
```

## Additional Resources

- [Alembic Documentation](https://alembic.sqlalchemy.org/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [ClubCompass Database Schema](../Plan.md#5-database-schema)

## Support

For questions or issues:
1. Check this documentation
2. Review `alembic/README`
3. Check existing migrations in `alembic/versions/`
4. Contact the development team

---

**Last Updated:** 2025-11-19
**Version:** 1.0
