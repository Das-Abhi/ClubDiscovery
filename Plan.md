# ClubCompass - Enterprise Architecture & Implementation Plan

## Executive Summary

This document outlines the complete architecture and phased implementation plan for rebuilding ClubCompass from scratch as an enterprise-level web application. The new system will maintain the existing visual design, user experience, and functionality while implementing modern best practices for scalability, security, performance, and maintainability.

**Project Goal:** Transform ClubCompass from a static HTML website into a production-ready, full-stack web application following KISS, DRY, and Clean Code principles.

---

## Table of Contents

1. [Current State Analysis](#1-current-state-analysis)
2. [High-Level Design (HLD)](#2-high-level-design-hld)
3. [Low-Level Design (LLD)](#3-low-level-design-lld)
4. [Technology Stack](#4-technology-stack)
5. [Database Schema](#5-database-schema)
6. [API Design](#6-api-design)
7. [Security Architecture](#7-security-architecture)
8. [Implementation Phases](#8-implementation-phases)
9. [Coding Standards & Best Practices](#9-coding-standards--best-practices)
10. [Testing Strategy](#10-testing-strategy)
11. [Deployment Architecture](#11-deployment-architecture)
12. [Performance Optimization](#12-performance-optimization)

---

## 1. Current State Analysis

### 1.1 Existing Features

**Pages & Functionality:**
- **Landing Page (index.html):** Hero section, trending clubs carousel, search functionality
- **Authentication (auth.html):** Login/signup forms with BMSCE email validation
- **Assessment (assessment.html):** Club recommendation questionnaire with scoring algorithm
- **Club Directories:**
  - Co-curricular clubs (40+ technical clubs)
  - Extra-curricular clubs (social & cultural)
  - Department clubs (10 department-specific clubs)
- **Club Details:** Modal-based club information display with contacts

**Current Design System:**
- Dark theme with black-to-red gradient (#000000 to #8B0000)
- Glassmorphism UI with backdrop blur effects
- Netflix-style card grid layouts
- Smooth animations and hover effects
- Responsive mobile design
- Custom scrollbar styling

**User Flows:**
1. Browse clubs by category
2. Search for specific clubs
3. Take assessment for personalized recommendations
4. View detailed club information
5. Contact club representatives

### 1.2 Current Limitations

- Static HTML with no backend
- No real authentication system
- No data persistence
- No user profiles or preferences
- No analytics or tracking
- Manual content updates required
- No admin panel
- No API for integrations
- Limited scalability

---

## 2. High-Level Design (HLD)

### 2.1 System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │    Next.js 15 Frontend (React + TypeScript)            │ │
│  │    - Server Components for SEO                         │ │
│  │    - Client Components for interactivity               │ │
│  │    - shadcn/ui + Tailwind CSS                          │ │
│  │    - Framer Motion animations                          │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↓ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │    Next.js API Routes / Server Actions                 │ │
│  │    - Authentication middleware                         │ │
│  │    - Rate limiting                                     │ │
│  │    - Request validation                                │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND SERVICE LAYER                      │
│  ┌─────────────────────┐  ┌──────────────────────────────┐ │
│  │  FastAPI Backend    │  │   Next.js Server Actions     │ │
│  │  - Club management  │  │   - User operations          │ │
│  │  - ML/AI features   │  │   - Simple CRUD              │ │
│  │  - Analytics        │  │   - Session management       │ │
│  └─────────────────────┘  └──────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      DATA LAYER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  PostgreSQL  │  │    Redis     │  │   File Storage   │  │
│  │  (Supabase)  │  │   (Cache)    │  │   (S3/Supabase)  │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Core System Components

**Frontend Application (Next.js 15)**
- SSR/ISR for optimal SEO and performance
- Server Components for static content
- Client Components for interactive features
- API route handlers for backend integration

**Backend Services**
- **Option A (Recommended):** FastAPI for complex operations (ML, analytics)
- **Option B:** Next.js Server Actions for simpler operations
- RESTful API design
- JWT-based authentication

**Database Layer**
- PostgreSQL (via Supabase) for relational data
- Redis for caching and session management
- Object storage for images/assets

**Infrastructure**
- Docker containerization
- Vercel for frontend deployment
- AWS Lambda/Render for backend services
- CDN for static assets

### 2.3 Key Architectural Decisions

1. **Monorepo Structure:** Single repository with frontend and backend
2. **API-First Design:** All data operations through well-defined APIs
3. **Progressive Enhancement:** Core functionality works without JavaScript
4. **Stateless Backend:** JWT tokens, no server-side sessions
5. **Database per Service:** Logical separation of concerns

---

## 3. Low-Level Design (LLD)

### 3.1 Frontend Component Architecture

```
src/
├── app/                          # Next.js 15 App Router
│   ├── (auth)/                   # Auth layout group
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── signup/
│   │       └── page.tsx
│   ├── (main)/                   # Main layout group
│   │   ├── page.tsx              # Landing page
│   │   ├── clubs/
│   │   │   ├── cocurricular/
│   │   │   │   └── page.tsx
│   │   │   ├── extracurricular/
│   │   │   │   └── page.tsx
│   │   │   ├── department/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Club detail page
│   │   ├── assessment/
│   │   │   └── page.tsx
│   │   └── profile/
│   │       └── page.tsx
│   ├── api/                      # API routes
│   │   ├── auth/
│   │   ├── clubs/
│   │   ├── assessment/
│   │   └── users/
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
│
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── modal.tsx
│   │   └── ...
│   ├── layout/                   # Layout components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Navigation.tsx
│   ├── clubs/                    # Club-specific components
│   │   ├── ClubCard.tsx
│   │   ├── ClubGrid.tsx
│   │   ├── ClubModal.tsx
│   │   ├── ClubCarousel.tsx
│   │   └── ClubSearch.tsx
│   ├── assessment/               # Assessment components
│   │   ├── QuestionCard.tsx
│   │   ├── ResultsDisplay.tsx
│   │   └── RecommendationList.tsx
│   └── auth/                     # Auth components
│       ├── LoginForm.tsx
│       ├── SignupForm.tsx
│       └── AuthGuard.tsx
│
├── lib/                          # Utility libraries
│   ├── api/                      # API client
│   │   ├── client.ts
│   │   ├── clubs.ts
│   │   ├── auth.ts
│   │   └── assessment.ts
│   ├── hooks/                    # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useClubs.ts
│   │   └── useAssessment.ts
│   ├── utils/                    # Utility functions
│   │   ├── validation.ts
│   │   ├── formatting.ts
│   │   └── constants.ts
│   └── types/                    # TypeScript types
│       ├── club.ts
│       ├── user.ts
│       └── assessment.ts
│
├── styles/                       # Additional styles
│   ├── animations.css
│   └── themes.css
│
└── config/                       # Configuration
    ├── site.ts                   # Site metadata
    └── env.ts                    # Environment variables
```

### 3.2 Backend Component Architecture (FastAPI)

```
backend/
├── app/
│   ├── main.py                   # FastAPI application
│   ├── config.py                 # Configuration
│   ├── database.py               # Database connection
│   │
│   ├── models/                   # SQLAlchemy ORM models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── club.py
│   │   ├── assessment.py
│   │   └── membership.py
│   │
│   ├── schemas/                  # Pydantic schemas
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── club.py
│   │   └── assessment.py
│   │
│   ├── api/                      # API endpoints
│   │   ├── __init__.py
│   │   ├── v1/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   ├── clubs.py
│   │   │   ├── users.py
│   │   │   └── assessment.py
│   │   └── deps.py               # Dependencies
│   │
│   ├── services/                 # Business logic
│   │   ├── __init__.py
│   │   ├── auth_service.py
│   │   ├── club_service.py
│   │   ├── assessment_service.py
│   │   └── recommendation_engine.py
│   │
│   ├── core/                     # Core utilities
│   │   ├── __init__.py
│   │   ├── security.py           # JWT, password hashing
│   │   ├── config.py
│   │   └── logger.py
│   │
│   └── middleware/               # Middleware
│       ├── __init__.py
│       ├── auth.py
│       ├── cors.py
│       └── rate_limit.py
│
├── alembic/                      # Database migrations
│   └── versions/
│
├── tests/                        # Tests
│   ├── unit/
│   ├── integration/
│   └── conftest.py
│
├── Dockerfile
├── requirements.txt
└── .env.example
```

### 3.3 Component Responsibilities

#### Frontend Components

**ClubCard.tsx**
- Display club thumbnail, name, tagline
- Handle hover animations
- Navigate to club details on click
- Lazy load images

**ClubGrid.tsx**
- Render responsive grid of club cards
- Handle empty states
- Implement pagination/infinite scroll
- Filter and sort clubs

**ClubModal.tsx**
- Display full club details
- Show contact information
- Handle modal open/close
- Support keyboard navigation (ESC)

**Header.tsx**
- Site branding and logo
- Search functionality
- Navigation links
- User profile dropdown (when logged in)
- Responsive mobile menu

**AssessmentFlow.tsx**
- Multi-step questionnaire
- Progress indicator
- Answer validation
- Results calculation
- Recommendation display

#### Backend Services

**AuthService**
- User registration with BMSCE email validation
- Login with JWT token generation
- Password hashing (bcrypt)
- Token refresh
- Email verification

**ClubService**
- CRUD operations for clubs
- Search and filtering
- Category management
- Contact information management
- Analytics tracking

**AssessmentService**
- Store user responses
- Calculate club matches using scoring algorithm
- Generate recommendations
- Store assessment history

**RecommendationEngine**
- Implement scoring algorithm
- Weight different factors
- Rank clubs by relevance
- Personalize based on user history

---

## 4. Technology Stack

### 4.1 Frontend Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Framework** | Next.js 15 | React framework with SSR/ISR |
| **Language** | TypeScript 5.x | Type-safe development |
| **Styling** | Tailwind CSS 3.x | Utility-first CSS |
| **UI Components** | shadcn/ui | Pre-built accessible components |
| **Animations** | Framer Motion | Smooth animations and transitions |
| **3D Graphics** | Three.js | Interactive 3D elements (optional) |
| **Typography Animation** | Typed.js | Typing animations |
| **State Management** | React Context + Zustand | Global state management |
| **Form Handling** | React Hook Form + Zod | Form validation |
| **HTTP Client** | Axios / Fetch API | API requests |

### 4.2 Backend Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Framework** | FastAPI | High-performance Python API |
| **Language** | Python 3.11+ | Backend logic |
| **ORM** | SQLAlchemy | Database ORM |
| **Migration** | Alembic | Database migrations |
| **Validation** | Pydantic | Request/response validation |
| **Authentication** | JWT + bcrypt | Secure authentication |
| **Testing** | Pytest | Unit and integration tests |
| **Documentation** | OpenAPI/Swagger | Auto-generated API docs |

### 4.3 Database & Storage

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Primary DB** | PostgreSQL 15+ | Relational data storage |
| **DB Hosting** | Supabase | Managed PostgreSQL |
| **Caching** | Redis | Session cache, rate limiting |
| **File Storage** | Supabase Storage / AWS S3 | Image and asset storage |
| **Search** | PostgreSQL Full-Text Search | Club search functionality |

### 4.4 DevOps & Infrastructure

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Containerization** | Docker | Application containers |
| **Orchestration** | Docker Compose | Local development |
| **Frontend Hosting** | Vercel | Next.js deployment |
| **Backend Hosting** | AWS Lambda + API Gateway / Render | Serverless/container hosting |
| **CDN** | Cloudflare / Vercel Edge | Static asset delivery |
| **Monitoring** | Sentry | Error tracking |
| **Analytics** | Vercel Analytics | User analytics |
| **CI/CD** | GitHub Actions | Automated deployment |

---

## 5. Database Schema

### 5.1 Entity Relationship Diagram

```
┌─────────────────┐       ┌──────────────────┐       ┌─────────────────┐
│     users       │       │   memberships    │       │     clubs       │
├─────────────────┤       ├──────────────────┤       ├─────────────────┤
│ id (PK)         │───┐   │ id (PK)          │   ┌───│ id (PK)         │
│ email           │   │   │ user_id (FK)     │───┘   │ name            │
│ password_hash   │   └───│ club_id (FK)     │       │ slug            │
│ full_name       │       │ role             │       │ category        │
│ created_at      │       │ joined_at        │       │ tagline         │
│ updated_at      │       │ status           │       │ description     │
│ email_verified  │       └──────────────────┘       │ logo_url        │
│ is_active       │                                  │ instagram       │
└─────────────────┘                                  │ faculty_contact │
                                                     │ created_at      │
                                                     │ updated_at      │
                                                     │ is_active       │
                                                     └─────────────────┘
        │                                                     │
        │                                                     │
        │              ┌──────────────────┐                  │
        │              │   assessments    │                  │
        │              ├──────────────────┤                  │
        └──────────────│ id (PK)          │                  │
                       │ user_id (FK)     │                  │
                       │ responses (JSON) │                  │
                       │ created_at       │                  │
                       └──────────────────┘                  │
                                │                            │
                                │                            │
                       ┌────────┴────────────┐              │
                       │                     │              │
              ┌────────▼────────┐   ┌────────▼──────────┐  │
              │  recommendations │   │  assessment_clubs │  │
              ├─────────────────┤   ├───────────────────┤  │
              │ id (PK)          │   │ id (PK)           │  │
              │ assessment_id(FK)│   │ assessment_id (FK)│  │
              │ club_id (FK)     │───│ club_id (FK)      │──┘
              │ score            │   │ contributed_score │
              │ rank             │   └───────────────────┘
              └──────────────────┘
```

### 5.2 Table Definitions

#### users

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    email_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,

    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@bmsce\.ac\.in$')
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
```

#### clubs

```sql
CREATE TABLE clubs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'cocurricular', 'extracurricular', 'department'
    tagline VARCHAR(255),
    description TEXT,
    overview TEXT,
    logo_url VARCHAR(500),
    instagram VARCHAR(100),
    faculty_contact JSONB, -- {name, phone, email}
    student_contacts JSONB[], -- [{name, phone, email}]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,

    CONSTRAINT valid_category CHECK (category IN ('cocurricular', 'extracurricular', 'department'))
);

CREATE INDEX idx_clubs_category ON clubs(category);
CREATE INDEX idx_clubs_slug ON clubs(slug);
CREATE INDEX idx_clubs_name_search ON clubs USING GIN(to_tsvector('english', name || ' ' || COALESCE(tagline, '') || ' ' || COALESCE(description, '')));
```

#### memberships

```sql
CREATE TABLE memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member', -- 'member', 'coordinator', 'faculty'
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'inactive', 'pending'

    UNIQUE(user_id, club_id)
);

CREATE INDEX idx_memberships_user ON memberships(user_id);
CREATE INDEX idx_memberships_club ON memberships(club_id);
```

#### assessments

```sql
CREATE TABLE assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    responses JSONB NOT NULL, -- {enjoy: 'coding', time: 'medium', ...}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_assessments_user ON assessments(user_id);
CREATE INDEX idx_assessments_created_at ON assessments(created_at);
```

#### recommendations

```sql
CREATE TABLE recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    rank INTEGER NOT NULL,

    UNIQUE(assessment_id, club_id)
);

CREATE INDEX idx_recommendations_assessment ON recommendations(assessment_id);
CREATE INDEX idx_recommendations_score ON recommendations(assessment_id, score DESC);
```

### 5.3 Sample Data Seeding Strategy

**Phase 1: Core Clubs**
- Migrate all 60+ clubs from current HTML to database
- Extract club information (name, tagline, description, contacts)
- Upload club logos to storage
- Generate slugs for URL routing

**Phase 2: User Data**
- Create admin users
- Create test users for different roles

**Phase 3: Sample Assessments**
- Create sample assessment responses
- Generate recommendation data

---

## 6. API Design

### 6.1 API Versioning & Base URL

```
Base URL: /api/v1
```

### 6.2 Authentication Endpoints

#### POST /api/v1/auth/register
**Description:** Register a new user

**Request:**
```json
{
  "email": "student@bmsce.ac.in",
  "password": "SecurePass123!",
  "full_name": "John Doe"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "student@bmsce.ac.in",
    "full_name": "John Doe",
    "created_at": "2024-01-15T10:30:00Z"
  },
  "access_token": "jwt_token_here",
  "token_type": "bearer"
}
```

#### POST /api/v1/auth/login
**Description:** Login user

**Request:**
```json
{
  "email": "student@bmsce.ac.in",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "access_token": "jwt_token_here",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "email": "student@bmsce.ac.in",
    "full_name": "John Doe"
  }
}
```

#### POST /api/v1/auth/refresh
**Description:** Refresh access token

**Request:**
```json
{
  "refresh_token": "refresh_token_here"
}
```

**Response (200):**
```json
{
  "access_token": "new_jwt_token_here",
  "token_type": "bearer"
}
```

### 6.3 Club Endpoints

#### GET /api/v1/clubs
**Description:** Get all clubs with filtering

**Query Parameters:**
- `category`: Filter by category (cocurricular, extracurricular, department)
- `search`: Search query
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "ACM Student Chapter",
      "slug": "acm",
      "category": "cocurricular",
      "tagline": "ACM student chapter — computing & AI",
      "logo_url": "https://storage.../acm.jpg"
    }
  ],
  "meta": {
    "total": 60,
    "page": 1,
    "limit": 20,
    "total_pages": 3
  }
}
```

#### GET /api/v1/clubs/:slug
**Description:** Get club details by slug

**Response (200):**
```json
{
  "id": "uuid",
  "name": "ACM Student Chapter",
  "slug": "acm",
  "category": "cocurricular",
  "tagline": "ACM student chapter — computing & AI",
  "description": "Full description...",
  "overview": "Detailed overview...",
  "logo_url": "https://storage.../acm.jpg",
  "instagram": "@bmsce_acm",
  "faculty_contact": {
    "name": "Dr. Example",
    "phone": "9999999999",
    "email": "faculty@bmsce.ac.in"
  },
  "student_contacts": [
    {
      "name": "Student Name",
      "phone": "8888888888"
    }
  ],
  "member_count": 150
}
```

#### POST /api/v1/clubs (Protected - Admin only)
**Description:** Create new club

**Request:**
```json
{
  "name": "New Club",
  "slug": "new-club",
  "category": "cocurricular",
  "tagline": "Club tagline",
  "description": "Full description",
  "faculty_contact": {...}
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "name": "New Club",
  "slug": "new-club",
  ...
}
```

### 6.4 Assessment Endpoints

#### POST /api/v1/assessments
**Description:** Submit assessment and get recommendations

**Request:**
```json
{
  "responses": {
    "enjoy": "coding",
    "time": "medium",
    "domain": "ai",
    "impact": "tech",
    "past": "coding"
  },
  "user_id": "uuid" // optional, null for anonymous
}
```

**Response (200):**
```json
{
  "assessment_id": "uuid",
  "recommendations": [
    {
      "club": {
        "id": "uuid",
        "name": "ACM Student Chapter",
        "slug": "acm",
        "tagline": "ACM student chapter — computing & AI",
        "logo_url": "..."
      },
      "score": 12,
      "rank": 1,
      "reasoning": [
        {
          "question": "What do you enjoy most?",
          "answer": "Coding / problem solving",
          "contribution": 4
        },
        {
          "question": "Which domain are you most drawn to?",
          "answer": "Artificial Intelligence / Data Science",
          "contribution": 3
        }
      ]
    }
  ]
}
```

#### GET /api/v1/assessments/:id
**Description:** Get assessment results by ID

**Response (200):**
```json
{
  "id": "uuid",
  "responses": {...},
  "recommendations": [...],
  "created_at": "2024-01-15T10:30:00Z"
}
```

### 6.5 User Endpoints (Protected)

#### GET /api/v1/users/me
**Description:** Get current user profile

**Response (200):**
```json
{
  "id": "uuid",
  "email": "student@bmsce.ac.in",
  "full_name": "John Doe",
  "memberships": [
    {
      "club": {
        "id": "uuid",
        "name": "ACM Student Chapter",
        "slug": "acm"
      },
      "role": "member",
      "joined_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### PATCH /api/v1/users/me
**Description:** Update user profile

**Request:**
```json
{
  "full_name": "John Smith"
}
```

#### POST /api/v1/users/me/clubs/:clubId/join
**Description:** Join a club

**Response (200):**
```json
{
  "membership": {
    "id": "uuid",
    "club_id": "uuid",
    "user_id": "uuid",
    "role": "member",
    "status": "pending"
  }
}
```

### 6.6 Error Response Format

All errors follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "email",
      "reason": "Email must be a valid BMSCE email"
    }
  }
}
```

**Common Error Codes:**
- `400 BAD_REQUEST`: Invalid request data
- `401 UNAUTHORIZED`: Missing or invalid authentication
- `403 FORBIDDEN`: Insufficient permissions
- `404 NOT_FOUND`: Resource not found
- `409 CONFLICT`: Resource conflict (e.g., duplicate email)
- `422 VALIDATION_ERROR`: Validation failed
- `429 RATE_LIMIT_EXCEEDED`: Too many requests
- `500 INTERNAL_ERROR`: Server error

---

## 7. Security Architecture

### 7.1 Authentication & Authorization

**JWT Token Strategy:**
- Access tokens expire in 1 hour
- Refresh tokens expire in 7 days
- Tokens signed with RS256 algorithm
- Store refresh tokens in httpOnly cookies

**Password Security:**
- bcrypt hashing with salt rounds = 12
- Minimum 8 characters, must include uppercase, lowercase, number
- Password reset via email verification

**Email Verification:**
- Send verification email on registration
- Expire verification links after 24 hours
- Restrict BMSCE email domain (@bmsce.ac.in)

### 7.2 Input Validation & Sanitization

**Frontend Validation:**
- Zod schema validation on all forms
- Real-time validation feedback
- XSS prevention via React's built-in escaping

**Backend Validation:**
- Pydantic models for all requests
- SQL injection prevention via ORM
- Whitelist allowed fields for updates

### 7.3 Rate Limiting

**API Rate Limits:**
- Anonymous users: 20 requests/minute
- Authenticated users: 100 requests/minute
- Assessment endpoint: 5 submissions/hour
- Registration: 3 attempts/hour per IP

**Implementation:**
- Redis-based rate limiting
- Token bucket algorithm
- Return 429 status with Retry-After header

### 7.4 CORS Policy

```python
ALLOWED_ORIGINS = [
    "https://clubcompass.bmsce.ac.in",
    "http://localhost:3000",  # Development only
]

CORS_CONFIG = {
    "allow_origins": ALLOWED_ORIGINS,
    "allow_credentials": True,
    "allow_methods": ["GET", "POST", "PUT", "PATCH", "DELETE"],
    "allow_headers": ["Authorization", "Content-Type"],
}
```

### 7.5 Data Protection

**Sensitive Data:**
- Never log passwords or tokens
- Encrypt email addresses at rest (optional)
- Redact contact info in logs

**GDPR Compliance:**
- User data export functionality
- Account deletion with data cleanup
- Privacy policy and terms of service

### 7.6 Security Headers

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';
```

---

## 8. Implementation Phases

### PHASE 0: Project Setup & Infrastructure (Week 1)

**Objectives:**
- Set up development environment
- Initialize repositories
- Configure CI/CD pipelines

**Tasks:**

**0.1 Repository Setup**
- [ ] Create GitHub repository with monorepo structure
- [ ] Initialize Next.js 15 project with TypeScript
- [ ] Initialize FastAPI project with Poetry/pip
- [ ] Set up .gitignore and .env.example files
- [ ] Create README.md with setup instructions

**0.2 Development Environment**
- [ ] Set up Docker Compose for local development
- [ ] Configure PostgreSQL container
- [ ] Configure Redis container
- [ ] Create Makefile for common commands
- [ ] Document local setup process

**0.3 Database Setup**
- [ ] Create Supabase project
- [ ] Set up PostgreSQL connection
- [ ] Initialize Alembic for migrations
- [ ] Create initial migration scripts
- [ ] Set up connection pooling

**0.4 CI/CD Pipeline**
- [ ] Configure GitHub Actions for frontend
- [ ] Configure GitHub Actions for backend
- [ ] Set up automated testing
- [ ] Configure deployment workflows
- [ ] Set up staging environment

**0.5 Design System Foundation**
- [ ] Install Tailwind CSS
- [ ] Configure shadcn/ui
- [ ] Create design tokens (colors, spacing, typography)
- [ ] Set up global styles
- [ ] Create CSS custom properties for theme

**Deliverables:**
- ✅ Working local development environment
- ✅ Database schema initialized
- ✅ CI/CD pipeline configured
- ✅ Design system foundation ready

---

### PHASE 1: Core Frontend Structure (Week 2-3)

**Objectives:**
- Build layout components
- Implement routing structure
- Create reusable UI components

**Tasks:**

**1.1 Layout Components**
- [ ] Create root layout with Header and Footer
- [ ] Implement responsive Header component
  - Logo and branding
  - Search bar
  - Navigation links
  - Mobile menu
- [ ] Implement Footer component
  - Links to About, Contact
  - Social media links
- [ ] Create loading screen component with compass animation

**1.2 Landing Page**
- [ ] Build hero section with logo and title
- [ ] Implement category navigation buttons
- [ ] Create trending clubs carousel
  - Auto-rotation every 4 seconds
  - Manual navigation arrows
  - Pause on hover
  - Indicators
- [ ] Add description section
- [ ] Implement search functionality

**1.3 UI Component Library**
- [ ] Set up shadcn/ui components
  - Button variants
  - Input fields
  - Cards
  - Modal/Dialog
  - Dropdown
  - Toast notifications
- [ ] Create custom components
  - ClubCard
  - LoadingSpinner
  - EmptyState
  - ErrorBoundary

**1.4 Styling & Animations**
- [ ] Implement dark theme with gradient background
- [ ] Create glassmorphism effects
- [ ] Add custom scrollbar styles
- [ ] Implement Framer Motion animations
  - Page transitions
  - Card hover effects
  - Modal animations
- [ ] Ensure mobile responsiveness

**Deliverables:**
- ✅ Complete landing page with carousel
- ✅ Responsive header and footer
- ✅ Reusable UI component library

---

### PHASE 2: Club Directory Pages (Week 3-4)

**Objectives:**
- Build club browsing experience
- Implement search and filtering
- Create club detail views

**Tasks:**

**2.1 Club Grid Component**
- [ ] Create ClubGrid component
  - Netflix-style responsive grid
  - Lazy loading of images
  - Empty state handling
- [ ] Build ClubCard component
  - Display logo, name, tagline
  - Hover animations
  - Click to open modal
  - Fallback initials if no logo

**2.2 Club Category Pages**
- [ ] Co-curricular clubs page (/clubs/cocurricular)
- [ ] Extra-curricular clubs page (/clubs/extracurricular)
- [ ] Department clubs page (/clubs/department)
- [ ] Implement category-specific filtering

**2.3 Search & Filter**
- [ ] Global search bar in header
- [ ] Local search on category pages
- [ ] Debounced search input
- [ ] Search highlighting
- [ ] Filter by subcategories (social, cultural, etc.)

**2.4 Club Detail Modal**
- [ ] Create ClubModal component
  - Club logo and header
  - Overview section
  - Contact information
  - Quick info sidebar
- [ ] Implement modal navigation
  - Open via URL parameter (?club=acm)
  - Deep linking support
  - Keyboard navigation (ESC to close)
- [ ] Add social media links (Instagram)

**2.5 Static Data Integration**
- [ ] Extract club data from HTML to JSON
- [ ] Create type definitions for clubs
- [ ] Implement data fetching functions
- [ ] Set up image optimization

**Deliverables:**
- ✅ Three club category pages
- ✅ Functional search and filtering
- ✅ Club detail modal with all information

---

### PHASE 3: Authentication System (Week 4-5)

**Objectives:**
- Implement user registration and login
- Build authentication UI
- Set up JWT token management

**Tasks:**

**3.1 Backend Authentication**
- [ ] Create User model and schema
- [ ] Implement password hashing with bcrypt
- [ ] Build JWT token generation/validation
- [ ] Create auth endpoints
  - POST /api/v1/auth/register
  - POST /api/v1/auth/login
  - POST /api/v1/auth/refresh
  - GET /api/v1/auth/me
- [ ] Implement email validation (@bmsce.ac.in)
- [ ] Add rate limiting to auth endpoints

**3.2 Frontend Authentication UI**
- [ ] Create auth layout (centered card design)
- [ ] Build LoginForm component
  - Email and password fields
  - Form validation with Zod
  - Error handling
  - Loading states
- [ ] Build SignupForm component
  - Full name, email, password, confirm password
  - Real-time email validation
  - Password strength indicator
- [ ] Implement tab switching (Login/Signup)
- [ ] Create "Forgot Password" flow

**3.3 Auth State Management**
- [ ] Create useAuth hook
- [ ] Implement token storage (httpOnly cookies)
- [ ] Build AuthGuard component for protected routes
- [ ] Add auto-refresh token logic
- [ ] Implement logout functionality

**3.4 User Profile**
- [ ] Create profile page (/profile)
- [ ] Display user information
- [ ] Show club memberships
- [ ] Add edit profile functionality

**Deliverables:**
- ✅ Complete authentication system
- ✅ Login and signup pages
- ✅ Protected routes with AuthGuard
- ✅ User profile page

---

### PHASE 4: Assessment & Recommendations (Week 5-6)

**Objectives:**
- Build club recommendation questionnaire
- Implement scoring algorithm
- Display personalized results

**Tasks:**

**4.1 Backend Assessment System**
- [ ] Create Assessment and Recommendation models
- [ ] Build scoring algorithm
  - Map questions to club attributes
  - Calculate weighted scores
  - Rank clubs by relevance
- [ ] Create assessment endpoints
  - POST /api/v1/assessments
  - GET /api/v1/assessments/:id
- [ ] Implement recommendation engine
- [ ] Store assessment history

**4.2 Assessment UI**
- [ ] Create assessment page (/assessment)
- [ ] Build QuestionCard component
  - Radio button options
  - Validation
  - Progress indicator
- [ ] Implement multi-step form
  - 5 questions total
  - Next/Previous navigation
  - Answer persistence
- [ ] Add loading animation during processing

**4.3 Results Display**
- [ ] Create ResultsDisplay component
  - Top recommendations list
  - Club scores and rankings
  - Reasoning breakdown
- [ ] Add "Why this match?" explanation
- [ ] Link to club detail pages
- [ ] Implement "View Club" buttons with deep links

**4.4 Recommendation Persistence**
- [ ] Store results in localStorage for anonymous users
- [ ] Save to database for logged-in users
- [ ] Allow users to retake assessment
- [ ] Show assessment history on profile

**Deliverables:**
- ✅ Complete assessment questionnaire
- ✅ Working recommendation engine
- ✅ Results page with explanations
- ✅ Assessment history for users

---

### PHASE 5: Backend API Development (Week 6-7)

**Objectives:**
- Build complete REST API
- Implement business logic
- Set up database operations

**Tasks:**

**5.1 Club Management API**
- [ ] Implement ClubService
  - CRUD operations
  - Search and filtering logic
  - Image upload handling
- [ ] Create club endpoints
  - GET /api/v1/clubs (with pagination)
  - GET /api/v1/clubs/:slug
  - POST /api/v1/clubs (admin only)
  - PATCH /api/v1/clubs/:slug (admin only)
  - DELETE /api/v1/clubs/:slug (admin only)
- [ ] Add full-text search with PostgreSQL
- [ ] Implement category filtering

**5.2 User Management API**
- [ ] Implement UserService
  - User profile operations
  - Club membership management
- [ ] Create user endpoints
  - GET /api/v1/users/me
  - PATCH /api/v1/users/me
  - POST /api/v1/users/me/clubs/:clubId/join
  - DELETE /api/v1/users/me/clubs/:clubId/leave
- [ ] Add user preferences storage

**5.3 Admin Panel Backend**
- [ ] Create admin role and permissions
- [ ] Build admin middleware
- [ ] Implement admin endpoints
  - GET /api/v1/admin/users
  - GET /api/v1/admin/analytics
  - POST /api/v1/admin/clubs/:id/approve
- [ ] Add activity logging

**5.4 Testing**
- [ ] Write unit tests for services
- [ ] Write integration tests for endpoints
- [ ] Test authentication flows
- [ ] Test edge cases and error handling

**Deliverables:**
- ✅ Complete REST API with documentation
- ✅ All CRUD operations implemented
- ✅ Test coverage > 80%

---

### PHASE 6: Advanced Features (Week 7-8)

**Objectives:**
- Add analytics and tracking
- Implement social features
- Enhance user experience

**Tasks:**

**6.1 Analytics & Tracking**
- [ ] Set up Vercel Analytics
- [ ] Track page views and user flows
- [ ] Monitor club popularity
- [ ] Track assessment completion rate
- [ ] Create analytics dashboard (admin)

**6.2 Social Features**
- [ ] Add "Join Club" functionality
- [ ] Show member counts on club cards
- [ ] Display "Popular Clubs" section
- [ ] Add club favoriting/bookmarking
- [ ] Show "Recommended for You" (logged-in users)

**6.3 Enhanced Search**
- [ ] Implement search autocomplete
- [ ] Add search history
- [ ] Create "Recent Searches" section
- [ ] Implement fuzzy search
- [ ] Add search filters (category, tags)

**6.4 Notifications**
- [ ] Email notification system
  - Welcome email on signup
  - Assessment results summary
  - Club updates (if joined)
- [ ] In-app notifications
  - Toast notifications
  - Notification center

**6.5 Performance Optimization**
- [ ] Implement image lazy loading
- [ ] Add skeleton loaders
- [ ] Optimize bundle size
- [ ] Implement code splitting
- [ ] Add service worker for offline support

**Deliverables:**
- ✅ Analytics dashboard
- ✅ Social features (join, favorite)
- ✅ Enhanced search experience
- ✅ Email notifications

---

### PHASE 7: Admin Panel (Week 8-9)

**Objectives:**
- Build admin dashboard
- Enable content management
- Monitor system health

**Tasks:**

**7.1 Admin Dashboard**
- [ ] Create admin layout
- [ ] Build dashboard page
  - User statistics
  - Club statistics
  - Recent activity
  - Popular clubs
- [ ] Add charts and visualizations

**7.2 Club Management**
- [ ] Create club list view
- [ ] Build club edit form
- [ ] Implement club creation flow
- [ ] Add bulk import feature (CSV)
- [ ] Enable/disable clubs

**7.3 User Management**
- [ ] Create user list view
- [ ] View user details
- [ ] Manage user roles
- [ ] Handle user reports

**7.4 Content Moderation**
- [ ] Review club submissions
- [ ] Approve/reject pending clubs
- [ ] Edit club information
- [ ] Manage contact information

**Deliverables:**
- ✅ Complete admin dashboard
- ✅ Club management interface
- ✅ User management tools

---

### PHASE 8: Testing & Quality Assurance (Week 9-10)

**Objectives:**
- Comprehensive testing
- Bug fixing
- Performance optimization

**Tasks:**

**8.1 Unit Testing**
- [ ] Frontend component tests (Jest + React Testing Library)
- [ ] Backend service tests (Pytest)
- [ ] Utility function tests
- [ ] Hook tests
- [ ] Achieve >80% code coverage

**8.2 Integration Testing**
- [ ] API endpoint tests
- [ ] Database operation tests
- [ ] Authentication flow tests
- [ ] End-to-end user flows

**8.3 E2E Testing**
- [ ] Set up Playwright/Cypress
- [ ] Test critical user paths
  - Registration → Login → Browse → Assessment
  - Search → Club Detail → Join
- [ ] Test responsive layouts
- [ ] Cross-browser testing

**8.4 Performance Testing**
- [ ] Lighthouse audits (target score >90)
- [ ] Load testing (Artillery/k6)
- [ ] Database query optimization
- [ ] API response time monitoring
- [ ] Bundle size analysis

**8.5 Security Testing**
- [ ] Penetration testing
- [ ] Dependency vulnerability scanning
- [ ] OWASP Top 10 checks
- [ ] Security headers validation

**8.6 Bug Fixing**
- [ ] Fix critical bugs
- [ ] Fix high-priority bugs
- [ ] Address edge cases
- [ ] Handle error scenarios gracefully

**Deliverables:**
- ✅ Test suite with >80% coverage
- ✅ E2E test suite
- ✅ Performance report (Lighthouse >90)
- ✅ Security audit report

---

### PHASE 9: Deployment & DevOps (Week 10-11)

**Objectives:**
- Deploy to production
- Set up monitoring
- Configure backups

**Tasks:**

**9.1 Frontend Deployment (Vercel)**
- [ ] Configure Vercel project
- [ ] Set up environment variables
- [ ] Configure custom domain
- [ ] Enable Vercel Analytics
- [ ] Set up preview deployments

**9.2 Backend Deployment**
- [ ] Choose hosting (AWS Lambda + API Gateway or Render)
- [ ] Create Dockerfile for backend
- [ ] Set up environment variables
- [ ] Configure CORS for production
- [ ] Set up health check endpoints

**9.3 Database Setup**
- [ ] Configure production PostgreSQL (Supabase)
- [ ] Set up connection pooling
- [ ] Run migrations
- [ ] Seed initial data
- [ ] Configure backups (daily)

**9.4 Monitoring & Logging**
- [ ] Set up Sentry for error tracking
- [ ] Configure log aggregation
- [ ] Set up uptime monitoring (UptimeRobot)
- [ ] Create alerting rules
- [ ] Set up performance monitoring

**9.5 CI/CD Pipeline**
- [ ] Automated testing on PR
- [ ] Automated deployment on merge to main
- [ ] Staging environment deployment
- [ ] Database migration automation
- [ ] Rollback strategy

**9.6 Documentation**
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Deployment guide
- [ ] Environment variable documentation
- [ ] Troubleshooting guide
- [ ] User guide

**Deliverables:**
- ✅ Production deployment on Vercel
- ✅ Backend deployed and running
- ✅ Monitoring and alerting configured
- ✅ Complete documentation

---

### PHASE 10: Launch & Post-Launch (Week 11-12)

**Objectives:**
- Soft launch to beta users
- Gather feedback
- Iterate and improve

**Tasks:**

**10.1 Beta Launch**
- [ ] Deploy to production
- [ ] Invite beta users (50-100 students)
- [ ] Monitor system performance
- [ ] Track user behavior
- [ ] Collect feedback

**10.2 Feedback Integration**
- [ ] Analyze user feedback
- [ ] Prioritize feature requests
- [ ] Fix critical issues
- [ ] Make UX improvements

**10.3 Marketing Preparation**
- [ ] Create social media accounts
- [ ] Design promotional materials
- [ ] Write launch announcement
- [ ] Prepare user onboarding flow

**10.4 Full Launch**
- [ ] Announce to all BMSCE students
- [ ] Monitor server load
- [ ] Provide user support
- [ ] Track metrics (signups, assessments, searches)

**10.5 Post-Launch Optimization**
- [ ] Address user-reported bugs
- [ ] Optimize based on analytics
- [ ] Scale infrastructure if needed
- [ ] Plan next features

**Deliverables:**
- ✅ Live production application
- ✅ Beta user feedback incorporated
- ✅ Marketing materials ready
- ✅ Post-launch report

---

## 9. Coding Standards & Best Practices

### 9.1 General Principles

**KISS (Keep It Simple, Stupid)**
- Favor simple, straightforward solutions
- Avoid over-engineering
- Write code that's easy to understand

**DRY (Don't Repeat Yourself)**
- Extract reusable functions and components
- Use configuration files for repeated values
- Create utility functions for common operations

**Clean Code**
- Descriptive variable and function names
- Single responsibility principle
- Functions should do one thing well
- Consistent naming conventions

### 9.2 TypeScript/JavaScript Standards

**Naming Conventions:**
```typescript
// PascalCase for components and classes
const ClubCard = () => { ... }

// camelCase for functions and variables
const fetchClubData = async () => { ... }

// UPPER_SNAKE_CASE for constants
const API_BASE_URL = "https://api.example.com"

// Prefix boolean variables with is/has/should
const isLoading = true
const hasError = false
```

**File Organization:**
```typescript
// 1. Imports (grouped by: external, internal, types)
import React from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { fetchClubs } from '@/lib/api/clubs'

import type { Club } from '@/lib/types/club'

// 2. Type definitions
interface ClubCardProps {
  club: Club
  onClick?: () => void
}

// 3. Component/Function
export function ClubCard({ club, onClick }: ClubCardProps) {
  // ...
}
```

**Error Handling:**
```typescript
// Always handle errors explicitly
try {
  const data = await fetchClubs()
  return data
} catch (error) {
  if (error instanceof ApiError) {
    // Handle API errors
    console.error('API Error:', error.message)
    throw new Error('Failed to fetch clubs')
  }
  // Handle unexpected errors
  console.error('Unexpected error:', error)
  throw error
}
```

**Async/Await:**
```typescript
// Prefer async/await over promises
// Good
const clubs = await fetchClubs()

// Avoid
fetchClubs().then(clubs => { ... })
```

### 9.3 React Best Practices

**Component Structure:**
```typescript
// Use functional components with hooks
export function ClubCard({ club }: ClubCardProps) {
  // 1. Hooks
  const [isExpanded, setIsExpanded] = useState(false)
  const router = useRouter()

  // 2. Derived state
  const imageUrl = club.logo_url || '/placeholder.jpg'

  // 3. Event handlers
  const handleClick = () => {
    setIsExpanded(true)
    onClick?.()
  }

  // 4. Effects
  useEffect(() => {
    // Side effects
  }, [dependency])

  // 5. Render
  return (
    <div onClick={handleClick}>
      {/* JSX */}
    </div>
  )
}
```

**Component Composition:**
```typescript
// Prefer composition over props drilling
// Good
<ClubLayout>
  <ClubHeader club={club} />
  <ClubBody club={club} />
</ClubLayout>

// Avoid
<ClubCard showHeader showBody headerProps={...} bodyProps={...} />
```

**Performance Optimization:**
```typescript
// Use React.memo for expensive components
export const ClubCard = React.memo(({ club }: ClubCardProps) => {
  // ...
})

// Use useMemo for expensive computations
const sortedClubs = useMemo(() => {
  return clubs.sort((a, b) => a.name.localeCompare(b.name))
}, [clubs])

// Use useCallback for event handlers passed to children
const handleClick = useCallback(() => {
  console.log('Clicked')
}, [])
```

### 9.4 Python/FastAPI Standards

**Code Style:**
```python
# Follow PEP 8
# Use type hints
from typing import List, Optional
from pydantic import BaseModel

def fetch_clubs(
    category: Optional[str] = None,
    limit: int = 20
) -> List[Club]:
    """
    Fetch clubs with optional filtering.

    Args:
        category: Optional category filter
        limit: Maximum number of results

    Returns:
        List of Club objects
    """
    # Implementation
    pass
```

**Error Handling:**
```python
from fastapi import HTTPException, status

@router.get("/clubs/{club_id}")
async def get_club(club_id: str):
    club = await club_service.get_by_id(club_id)

    if not club:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Club with id {club_id} not found"
        )

    return club
```

**Dependency Injection:**
```python
from fastapi import Depends
from app.core.security import get_current_user

@router.post("/clubs")
async def create_club(
    club_data: ClubCreate,
    current_user: User = Depends(get_current_user)
):
    # Only authenticated users can create clubs
    return await club_service.create(club_data)
```

### 9.5 Git Commit Conventions

**Commit Message Format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(auth): add JWT authentication

- Implement JWT token generation
- Add login and signup endpoints
- Create authentication middleware

Closes #123

---

fix(clubs): resolve search not working on mobile

The search input was not properly debounced on mobile devices.
Added 300ms debounce to improve performance.

Fixes #456

---

docs(api): update API documentation

Added examples for all club endpoints
```

### 9.6 Code Review Checklist

**Before Submitting PR:**
- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] No console.logs or debug code
- [ ] No commented-out code
- [ ] Error handling implemented
- [ ] TypeScript types defined
- [ ] Commit messages follow convention

**Reviewers Check:**
- [ ] Code is readable and maintainable
- [ ] No security vulnerabilities
- [ ] Performance considerations
- [ ] Edge cases handled
- [ ] Consistent with existing patterns

---

## 10. Testing Strategy

### 10.1 Testing Pyramid

```
        /\
       /  \
      / E2E \              10% - End-to-End Tests
     /______\
    /        \
   /Integration\          30% - Integration Tests
  /____________\
 /              \
/   Unit Tests   \        60% - Unit Tests
/__________________\
```

### 10.2 Frontend Testing

**Unit Tests (Jest + React Testing Library)**
```typescript
// components/clubs/ClubCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { ClubCard } from './ClubCard'

describe('ClubCard', () => {
  const mockClub = {
    id: '1',
    name: 'ACM',
    slug: 'acm',
    category: 'cocurricular',
    tagline: 'Computing club'
  }

  it('renders club name and tagline', () => {
    render(<ClubCard club={mockClub} />)

    expect(screen.getByText('ACM')).toBeInTheDocument()
    expect(screen.getByText('Computing club')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn()
    render(<ClubCard club={mockClub} onClick={handleClick} />)

    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('displays fallback initials when no logo', () => {
    const clubWithoutLogo = { ...mockClub, logo_url: null }
    render(<ClubCard club={clubWithoutLogo} />)

    expect(screen.getByText('AC')).toBeInTheDocument()
  })
})
```

**Hook Tests**
```typescript
// lib/hooks/useAuth.test.ts
import { renderHook, act } from '@testing-library/react-hooks'
import { useAuth } from './useAuth'

describe('useAuth', () => {
  it('should login user successfully', async () => {
    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.login('test@bmsce.ac.in', 'password')
    })

    expect(result.current.user).toBeDefined()
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('should logout user', async () => {
    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.logout()
    })

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })
})
```

**Integration Tests**
```typescript
// app/clubs/cocurricular/page.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import CocurricularPage from './page'

// Mock API
jest.mock('@/lib/api/clubs', () => ({
  fetchClubs: jest.fn(() => Promise.resolve([
    { id: '1', name: 'ACM', category: 'cocurricular' }
  ]))
}))

describe('Cocurricular Clubs Page', () => {
  it('loads and displays clubs', async () => {
    render(<CocurricularPage />)

    expect(screen.getByText('Loading...')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('ACM')).toBeInTheDocument()
    })
  })
})
```

### 10.3 Backend Testing

**Unit Tests (Pytest)**
```python
# tests/unit/test_club_service.py
import pytest
from app.services.club_service import ClubService

@pytest.fixture
def club_service():
    return ClubService()

@pytest.fixture
def sample_club():
    return {
        "name": "ACM",
        "slug": "acm",
        "category": "cocurricular",
        "tagline": "Computing club"
    }

def test_create_club(club_service, sample_club):
    club = club_service.create(sample_club)

    assert club.name == "ACM"
    assert club.slug == "acm"
    assert club.is_active is True

def test_get_club_by_slug(club_service, sample_club):
    created_club = club_service.create(sample_club)

    fetched_club = club_service.get_by_slug("acm")

    assert fetched_club is not None
    assert fetched_club.id == created_club.id

def test_get_nonexistent_club(club_service):
    club = club_service.get_by_slug("nonexistent")
    assert club is None
```

**API Endpoint Tests**
```python
# tests/integration/test_clubs_api.py
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_get_clubs():
    response = client.get("/api/v1/clubs")

    assert response.status_code == 200
    assert "data" in response.json()
    assert "meta" in response.json()

def test_get_club_by_slug():
    response = client.get("/api/v1/clubs/acm")

    assert response.status_code == 200
    data = response.json()
    assert data["slug"] == "acm"

def test_create_club_unauthorized():
    response = client.post("/api/v1/clubs", json={
        "name": "New Club",
        "slug": "new-club",
        "category": "cocurricular"
    })

    assert response.status_code == 401

@pytest.mark.authenticated
def test_create_club_authorized(auth_headers):
    response = client.post(
        "/api/v1/clubs",
        json={
            "name": "New Club",
            "slug": "new-club",
            "category": "cocurricular"
        },
        headers=auth_headers
    )

    assert response.status_code == 201
    assert response.json()["name"] == "New Club"
```

### 10.4 E2E Testing (Playwright)

```typescript
// e2e/clubs.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Club Browsing', () => {
  test('should display clubs on cocurricular page', async ({ page }) => {
    await page.goto('/clubs/cocurricular')

    await expect(page.locator('h1')).toContainText('Co-Curricular Clubs')

    const clubCards = page.locator('[data-testid="club-card"]')
    await expect(clubCards).toHaveCountGreaterThan(0)
  })

  test('should search for clubs', async ({ page }) => {
    await page.goto('/')

    await page.fill('[data-testid="search-input"]', 'ACM')
    await page.press('[data-testid="search-input"]', 'Enter')

    await expect(page.locator('text=ACM')).toBeVisible()
  })

  test('should open club modal', async ({ page }) => {
    await page.goto('/clubs/cocurricular')

    await page.click('[data-testid="club-card"]:first-child')

    await expect(page.locator('[data-testid="club-modal"]')).toBeVisible()
    await expect(page.locator('[data-testid="club-overview"]')).toBeVisible()
  })
})

test.describe('Assessment Flow', () => {
  test('should complete assessment and show results', async ({ page }) => {
    await page.goto('/assessment')

    // Answer all questions
    await page.click('input[value="coding"]')
    await page.click('input[value="medium"]')
    await page.click('input[value="ai"]')
    await page.click('input[value="tech"]')
    await page.click('input[value="coding"]')

    // Submit
    await page.click('button:has-text("Submit")')

    // Wait for results
    await expect(page.locator('[data-testid="results"]')).toBeVisible()
    await expect(page.locator('[data-testid="recommendation"]')).toHaveCountGreaterThan(0)
  })
})
```

### 10.5 Performance Testing

**Lighthouse CI Configuration**
```json
// lighthouserc.json
{
  "ci": {
    "collect": {
      "url": [
        "http://localhost:3000",
        "http://localhost:3000/clubs/cocurricular",
        "http://localhost:3000/assessment"
      ],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.9}],
        "categories:accessibility": ["error", {"minScore": 0.9}],
        "categories:best-practices": ["error", {"minScore": 0.9}],
        "categories:seo": ["error", {"minScore": 0.9}]
      }
    }
  }
}
```

**Load Testing (k6)**
```javascript
// load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },  // Ramp up to 50 users
    { duration: '3m', target: 50 },  // Stay at 50 users
    { duration: '1m', target: 100 }, // Ramp up to 100 users
    { duration: '3m', target: 100 }, // Stay at 100 users
    { duration: '1m', target: 0 },   // Ramp down
  ],
};

export default function () {
  // Test GET /clubs
  const clubsRes = http.get('https://api.clubcompass.com/v1/clubs');
  check(clubsRes, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);

  // Test GET /clubs/:slug
  const clubRes = http.get('https://api.clubcompass.com/v1/clubs/acm');
  check(clubRes, {
    'status is 200': (r) => r.status === 200,
    'response time < 300ms': (r) => r.timings.duration < 300,
  });

  sleep(1);
}
```

---

## 11. Deployment Architecture

### 11.1 Production Environment

```
┌──────────────────────────────────────────────────────────┐
│                    CLOUDFLARE CDN                        │
│                  (Static Assets, Images)                 │
└──────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────┐
│                   VERCEL EDGE NETWORK                    │
│              (Next.js Frontend + API Routes)             │
│  ┌────────────────────────────────────────────────────┐  │
│  │   Edge Functions (Middleware, Auth)                │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────┐
│              AWS API GATEWAY / RENDER                    │
│                  (FastAPI Backend)                       │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Lambda Functions / Docker Containers              │  │
│  │  - Club API                                        │  │
│  │  - Assessment Engine                               │  │
│  │  - User Management                                 │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
                           │
          ┌────────────────┴────────────────┐
          │                                 │
          ▼                                 ▼
┌──────────────────────┐         ┌──────────────────────┐
│   SUPABASE           │         │   REDIS CLOUD        │
│   (PostgreSQL)       │         │   (Cache, Sessions)  │
│   - Primary DB       │         │   - Rate Limiting    │
│   - File Storage     │         │   - Temp Data        │
└──────────────────────┘         └──────────────────────┘
```

### 11.2 Environment Configuration

**Frontend (.env.production)**
```bash
# Public environment variables
NEXT_PUBLIC_API_URL=https://api.clubcompass.com/v1
NEXT_PUBLIC_SITE_URL=https://clubcompass.bmsce.ac.in
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx

# Private environment variables
DATABASE_URL=postgresql://user:pass@host:5432/clubcompass
JWT_SECRET=xxxxx
REDIS_URL=redis://xxxxx

# Analytics
NEXT_PUBLIC_ANALYTICS_ID=xxxxx
SENTRY_DSN=xxxxx
```

**Backend (.env.production)**
```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/clubcompass
REDIS_URL=redis://xxxxx

# Security
JWT_SECRET=xxxxx
JWT_ALGORITHM=RS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=60
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@clubcompass.com
SMTP_PASSWORD=xxxxx

# Storage
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=xxxxx

# CORS
ALLOWED_ORIGINS=https://clubcompass.bmsce.ac.in

# Monitoring
SENTRY_DSN=xxxxx
LOG_LEVEL=INFO
```

### 11.3 Docker Configuration

**Frontend Dockerfile**
```dockerfile
# frontend/Dockerfile
FROM node:20-alpine AS base

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

**Backend Dockerfile**
```dockerfile
# backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Create non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Docker Compose (Local Development)**
```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
    depends_on:
      - backend

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/clubcompass
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  db:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=clubcompass
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### 11.4 CI/CD Pipeline (GitHub Actions)

**Frontend Deployment**
```yaml
# .github/workflows/deploy-frontend.yml
name: Deploy Frontend

on:
  push:
    branches: [main]
    paths:
      - 'frontend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci
        working-directory: ./frontend

      - name: Run tests
        run: npm test
        working-directory: ./frontend

      - name: Build
        run: npm run build
        working-directory: ./frontend
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.API_URL }}

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./frontend
```

**Backend Deployment**
```yaml
# .github/workflows/deploy-backend.yml
name: Deploy Backend

on:
  push:
    branches: [main]
    paths:
      - 'backend/**'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install pytest pytest-cov
        working-directory: ./backend

      - name: Run tests
        run: pytest --cov=app tests/
        working-directory: ./backend

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Render
        uses: johnbeynon/render-deploy-action@v0.0.8
        with:
          service-id: ${{ secrets.RENDER_SERVICE_ID }}
          api-key: ${{ secrets.RENDER_API_KEY }}
```

### 11.5 Monitoring & Alerting

**Sentry Configuration**
```typescript
// frontend/sentry.config.ts
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  beforeSend(event) {
    // Don't send errors in development
    if (process.env.NODE_ENV === 'development') {
      return null
    }
    return event
  }
})
```

**Uptime Monitoring**
- UptimeRobot checks every 5 minutes
- Alert via email/SMS on downtime
- Monitor endpoints:
  - Frontend: https://clubcompass.bmsce.ac.in
  - API: https://api.clubcompass.com/health

**Performance Monitoring**
- Vercel Analytics for frontend metrics
- Custom CloudWatch dashboards for backend
- Track:
  - Response times (p50, p95, p99)
  - Error rates
  - Request volumes
  - Database query performance

---

## 12. Performance Optimization

### 12.1 Frontend Optimization

**Image Optimization**
```typescript
// Use Next.js Image component
import Image from 'next/image'

<Image
  src={club.logo_url}
  alt={club.name}
  width={120}
  height={120}
  placeholder="blur"
  blurDataURL="/placeholder.jpg"
  loading="lazy"
/>
```

**Code Splitting**
```typescript
// Dynamic imports for heavy components
import dynamic from 'next/dynamic'

const ClubModal = dynamic(() => import('@/components/clubs/ClubModal'), {
  loading: () => <LoadingSkeleton />,
  ssr: false
})
```

**Bundle Optimization**
```javascript
// next.config.js
module.exports = {
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
    optimizeCss: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
}
```

**Caching Strategy**
```typescript
// Incremental Static Regeneration
export const revalidate = 3600 // Revalidate every hour

export async function generateStaticParams() {
  const clubs = await fetchClubs()
  return clubs.map(club => ({ slug: club.slug }))
}
```

### 12.2 Backend Optimization

**Database Query Optimization**
```python
# Use select_in_loading to avoid N+1 queries
from sqlalchemy.orm import selectinload

clubs = session.query(Club)\
    .options(selectinload(Club.memberships))\
    .all()

# Add database indexes
class Club(Base):
    __tablename__ = "clubs"

    __table_args__ = (
        Index('idx_category', 'category'),
        Index('idx_name_search', 'name', postgresql_using='gin'),
    )
```

**Caching with Redis**
```python
import redis
import json

redis_client = redis.Redis.from_url(settings.REDIS_URL)

async def get_clubs_cached(category: str = None):
    cache_key = f"clubs:{category or 'all'}"

    # Try cache first
    cached = redis_client.get(cache_key)
    if cached:
        return json.loads(cached)

    # Fetch from database
    clubs = await club_service.get_all(category=category)

    # Cache for 1 hour
    redis_client.setex(cache_key, 3600, json.dumps(clubs))

    return clubs
```

**API Response Compression**
```python
from fastapi.middleware.gzip import GZipMiddleware

app.add_middleware(GZipMiddleware, minimum_size=1000)
```

### 12.3 Database Optimization

**Connection Pooling**
```python
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool

engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
    pool_recycle=3600
)
```

**Read Replicas (Optional)**
```python
# For high-traffic scenarios
read_engine = create_engine(READ_REPLICA_URL)
write_engine = create_engine(PRIMARY_DB_URL)

# Use read replica for queries
def get_clubs():
    with read_engine.connect() as conn:
        return conn.execute(select(Club)).fetchall()
```

### 12.4 CDN Configuration

**Cloudflare Settings**
- Cache static assets for 1 year
- Minify HTML, CSS, JS
- Enable Brotli compression
- Use Polish for image optimization
- Enable HTTP/3

**Cache Headers**
```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}
```

---

## Appendix

### A. Glossary

- **SSR**: Server-Side Rendering
- **ISR**: Incremental Static Regeneration
- **JWT**: JSON Web Token
- **ORM**: Object-Relational Mapping
- **CDN**: Content Delivery Network
- **CI/CD**: Continuous Integration/Continuous Deployment

### B. References

- Next.js Documentation: https://nextjs.org/docs
- FastAPI Documentation: https://fastapi.tiangolo.com
- Supabase Documentation: https://supabase.com/docs
- Tailwind CSS Documentation: https://tailwindcss.com/docs
- PostgreSQL Documentation: https://www.postgresql.org/docs

### C. Contact & Support

**Development Team:**
- Project Lead: [Name]
- Frontend Lead: [Name]
- Backend Lead: [Name]

**Repository:**
- GitHub: https://github.com/bmsce/clubcompass

**Documentation:**
- API Docs: https://api.clubcompass.com/docs
- User Guide: https://docs.clubcompass.com

---

**Document Version:** 1.0
**Last Updated:** 2024-01-15
**Status:** Ready for Implementation
