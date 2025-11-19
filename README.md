# ClubCompass 🧭

> Navigate Your Club Journey at BMSCE

ClubCompass is an enterprise-level web application designed to help students at BMS College of Engineering discover and connect with over 60+ clubs across co-curricular, extra-curricular, and department categories.

## 🚀 Features

- **Smart Club Recommendations**: AI-powered assessment to match students with relevant clubs
- **Comprehensive Club Directory**: Browse clubs by category with detailed information
- **User Authentication**: Secure login with BMSCE email validation
- **Search & Filter**: Advanced search functionality to find clubs quickly
- **Responsive Design**: Beautiful dark theme with glassmorphism effects
- **Modern Tech Stack**: Built with Next.js 15, FastAPI, PostgreSQL, and Redis

## 🏗️ Architecture

This is a monorepo containing:

- **Frontend**: Next.js 15 with TypeScript, Tailwind CSS, and shadcn/ui
- **Backend**: FastAPI with Python, PostgreSQL, and Redis
- **Infrastructure**: Docker Compose for local development

```
ClubDiscovery/
├── frontend/          # Next.js 15 frontend application
├── backend/           # FastAPI backend service
├── docker-compose.yml # Docker orchestration
└── Makefile          # Development commands
```

## 📋 Prerequisites

- Node.js 20+ and npm
- Python 3.11+
- Docker and Docker Compose (recommended)
- PostgreSQL 15+ (if running without Docker)
- Redis 7+ (if running without Docker)

## 🛠️ Quick Start

### Option 1: Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ClubDiscovery
   ```

2. **Start the development environment**
   ```bash
   make dev
   ```
   Or manually:
   ```bash
   docker-compose up
   ```

3. **Access the applications**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Option 2: Local Development

#### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

#### Backend Setup

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

## 📚 Development Commands

We use a Makefile for common development tasks:

```bash
make help            # Show all available commands
make dev             # Start development environment
make up              # Start services in background
make down            # Stop all services
make build           # Build Docker images
make logs            # Show logs from all services
make test            # Run tests
make lint            # Run linters
make format          # Format code
```

## 🗂️ Project Structure

### Frontend Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Authentication pages
│   │   ├── (main)/            # Main application pages
│   │   ├── api/               # API routes
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Landing page
│   ├── components/            # React components
│   │   ├── ui/                # shadcn/ui components
│   │   ├── layout/            # Layout components
│   │   ├── clubs/             # Club components
│   │   ├── assessment/        # Assessment components
│   │   └── auth/              # Auth components
│   ├── lib/                   # Utilities
│   │   ├── api/               # API clients
│   │   ├── hooks/             # Custom hooks
│   │   ├── utils/             # Utility functions
│   │   └── types/             # TypeScript types
│   └── config/                # Configuration
├── public/                    # Static assets
└── package.json
```

### Backend Structure

```
backend/
├── app/
│   ├── api/                   # API endpoints
│   │   └── v1/               # API version 1
│   ├── core/                  # Core utilities
│   ├── models/                # Database models
│   ├── schemas/               # Pydantic schemas
│   ├── services/              # Business logic
│   ├── middleware/            # Middleware
│   ├── database.py           # Database config
│   └── main.py               # FastAPI app
├── alembic/                   # Database migrations
├── tests/                     # Tests
└── requirements.txt
```

## 🔧 Configuration

### Environment Variables

#### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

#### Backend (.env)
```bash
DATABASE_URL=postgresql://postgres:password@localhost:5432/clubcompass
REDIS_URL=redis://localhost:6379
SECRET_KEY=your-secret-key
ALLOWED_ORIGINS=http://localhost:3000
```

## 🧪 Testing

### Frontend Tests
```bash
cd frontend
npm test                # Run tests
npm run test:watch     # Run tests in watch mode
```

### Backend Tests
```bash
cd backend
pytest                  # Run all tests
pytest --cov=app       # Run with coverage
```

## 📦 Database

ClubCompass uses **PostgreSQL** for data storage and **Alembic** for database migrations.

### Database Migrations (Alembic)

We use Alembic for version-controlled database schema management. See [backend/MIGRATIONS.md](backend/MIGRATIONS.md) for comprehensive documentation.

#### Quick Start

```bash
# Apply all pending migrations
cd backend
python manage_migrations.py upgrade

# Check migration status
python manage_migrations.py current

# Create a new migration
python manage_migrations.py create "Add new feature"
```

#### Using Makefile (if available)

```bash
make db-migrate         # Run migrations
make db-migration      # Create new migration
```

#### First-Time Setup

For existing databases:
```bash
cd backend
python manage_migrations.py init  # Stamp current state
```

For new databases:
```bash
cd backend
python init_db.py                  # Create initial schema
python manage_migrations.py init   # Initialize Alembic
```

### Database Access

```bash
make shell-db          # Access PostgreSQL shell (via Docker)

# Or directly
psql -h localhost -U postgres -d clubcompass
```

### Database Seeding

```bash
cd backend
python seed_clubs.py   # Seed club data
```

📚 **Full Documentation**: [backend/MIGRATIONS.md](backend/MIGRATIONS.md)

## 🎨 Design System

ClubCompass features a custom dark theme with:
- **Colors**: Black to dark red gradient (#000000 to #8B0000)
- **Effects**: Glassmorphism with backdrop blur
- **Animations**: Smooth transitions and hover effects
- **Typography**: Inter font family
- **Components**: Built with shadcn/ui and Tailwind CSS

## 📖 API Documentation

Once the backend is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Key Endpoints

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/clubs` - Get all clubs
- `GET /api/v1/clubs/:slug` - Get club details
- `POST /api/v1/assessments` - Submit assessment

## 🚢 Deployment

See [Plan.md](./Plan.md) for detailed deployment instructions for:
- Frontend: Vercel
- Backend: AWS Lambda / Render
- Database: Supabase
- Cache: Redis Cloud

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention

We follow conventional commits:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test updates
- `chore`: Maintenance tasks

## 📝 Implementation Phases

This project is being built in phases as outlined in [Plan.md](./Plan.md):

- ✅ **Phase 0**: Project Setup & Infrastructure (100% Complete - includes Alembic migrations)
- ✅ **Phase 1**: Core Frontend Structure (92% Complete)
- ✅ **Phase 2**: Club Directory Pages (95% Complete)
- ⚠️ **Phase 3**: Authentication System (85% Complete)
- ✅ **Phase 4**: Assessment & Recommendations (99% Complete)
- ⚠️ **Phase 5**: Backend API Development (75% Complete)
- ⚠️ **Phase 6**: Advanced Features (55% Complete)
- ✅ **Phase 7**: Admin Panel (85% Complete)
- ⚠️ **Phase 8**: Testing & QA (65% Complete)
- ⚠️ **Phase 9**: Deployment & DevOps (85% Complete)

📊 **Overall Completion: 83%** | 📋 See [FINAL_IMPLEMENTATION_ANALYSIS.md](./FINAL_IMPLEMENTATION_ANALYSIS.md) for detailed status

## 🐛 Troubleshooting

### Docker Issues

```bash
make clean             # Clean up Docker resources
make build             # Rebuild images
```

### Port Conflicts

If ports 3000, 8000, 5432, or 6379 are already in use, modify the ports in `docker-compose.yml`.

### Database Connection Issues

Ensure PostgreSQL is running and the connection string in `.env` is correct.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

**ClubCompass Development Team**
- BMS College of Engineering

## 🙏 Acknowledgments

- BMS College of Engineering
- All club coordinators and student volunteers
- Open source community

---

For detailed architecture and implementation details, see [Plan.md](./Plan.md).
