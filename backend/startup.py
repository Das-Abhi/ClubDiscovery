#!/usr/bin/env python3
"""
Startup script for backend with automatic database migration.
Uses Python to avoid bash line ending issues on Windows.
"""
import os
import sys
import time
import subprocess
import psycopg2


def wait_for_db():
    """Wait for PostgreSQL to be ready."""
    print("🚀 Starting ClubCompass Backend...")
    print("")
    print("⏳ Waiting for database to be ready...")

    db_url = os.getenv("DATABASE_URL", "postgresql://postgres:password@db:5432/clubcompass")
    max_retries = 30
    retry_count = 0

    while retry_count < max_retries:
        try:
            # Try to connect to the database
            conn = psycopg2.connect(db_url)
            conn.close()
            print("✅ Database is ready!")
            print("")
            return True
        except psycopg2.OperationalError:
            retry_count += 1
            print(f"Postgres is unavailable - sleeping (attempt {retry_count}/{max_retries})")
            time.sleep(1)

    print("❌ Failed to connect to database after 30 attempts")
    sys.exit(1)


def run_migrations():
    """Run database migrations."""
    print("📦 Running database migrations...")
    try:
        result = subprocess.run(
            [sys.executable, "init_db.py"],
            cwd="/app",
            check=True,
            capture_output=True,
            text=True
        )
        print(result.stdout)
        if result.stderr:
            print(result.stderr)
    except subprocess.CalledProcessError as e:
        print(f"❌ Migration failed: {e}")
        print(e.stdout)
        print(e.stderr)
        sys.exit(1)


def start_server():
    """Start the Uvicorn server."""
    print("")
    print("✅ Backend setup complete! Starting server...")
    print("")

    # Use os.execvp to replace the current process with uvicorn
    os.execvp("uvicorn", [
        "uvicorn",
        "app.main:app",
        "--host", "0.0.0.0",
        "--port", "8000",
        "--reload"
    ])


if __name__ == "__main__":
    wait_for_db()
    run_migrations()
    start_server()
