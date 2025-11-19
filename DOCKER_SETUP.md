# Docker Setup Guide

## Prerequisites

- Docker 20.10+
- Docker Compose 2.0+

## Quick Start

```bash
# Build and start all services
make dev

# Or manually:
docker-compose up -d
```

## Available Commands

```bash
make help          # Show all available commands
make build         # Build all Docker containers
make up            # Start all services
make down          # Stop all services
make logs          # View logs from all services
make clean         # Remove all containers, volumes, and images
make db-migrate    # Run database migrations (Alembic)
make shell-db      # Access database shell
```

## Services

The Docker Compose setup includes:

1. **PostgreSQL Database** (port 5432)
   - Database: clubcompass
   - User: postgres
   - Password: password

2. **Redis Cache** (port 6379)
   - Used for session management and caching

3. **FastAPI Backend** (port 8000)
   - API documentation: http://localhost:8000/docs
   - Auto-reload enabled for development

4. **Next.js Frontend** (port 3000)
   - Hot reload enabled
   - Accessible at: http://localhost:3000

## Environment Variables

### Backend
Copy `.env.example` to `.env` and configure:
```bash
cd backend
cp .env.example .env
```

### Frontend
Copy `.env.example` to `.env.local` and configure:
```bash
cd frontend
cp .env.example .env.local
```

## Database Setup

```bash
# Run migrations (Alembic)
make db-migrate

# Or manually from backend directory:
cd backend
python manage_migrations.py upgrade

# Initialize database (first time setup)
cd backend
python init_db.py

# Seed with sample data
cd backend
python seed_clubs.py
```

## Troubleshooting

### Port Already in Use
If ports 3000, 5432, 6379, or 8000 are already in use:
```bash
# Stop the services using those ports, or modify docker-compose.yml
docker-compose down
```

### Database Connection Issues
```bash
# Check if database is healthy
docker-compose ps

# View database logs
docker-compose logs db
```

### Frontend Not Loading
```bash
# Rebuild frontend container
docker-compose build frontend
docker-compose up -d frontend
```

## Development Workflow

1. Start services: `make up`
2. Make changes to code (auto-reload enabled)
3. Run migrations if schema changes: `make db-migrate`
4. View logs: `make logs`
5. Stop services: `make down`

## Production Build

For production deployment:
- **Frontend**: Deployed to Vercel (see [DEPLOYMENT.md](./DEPLOYMENT.md))
- **Backend**: Uses `backend/Dockerfile` or AWS Lambda (see [DEPLOYMENT.md](./DEPLOYMENT.md))

Development uses:
- `frontend/Dockerfile.dev` (development with hot reload)
- `backend/Dockerfile` (supports both dev and production)
