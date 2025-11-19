#!/bin/bash
# Startup script for backend with automatic database migration

set -e

echo "🚀 Starting ClubCompass Backend..."
echo ""

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
until PGPASSWORD=$POSTGRES_PASSWORD psql -h "db" -U "postgres" -d "clubcompass" -c '\q' 2>/dev/null; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done

echo "✅ Database is ready!"
echo ""

# Run database migrations
echo "📦 Running database migrations..."
cd /app
python init_db.py

# Optionally seed the database (uncomment to auto-seed)
# echo ""
# echo "🌱 Seeding database with sample data..."
# python seed_clubs.py

echo ""
echo "✅ Backend setup complete! Starting server..."
echo ""

# Start the application
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
