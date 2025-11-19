"""
ClubCompass FastAPI Backend
Main application entry point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from slowapi.errors import RateLimitExceeded

from app.core.config import settings
from app.core.sentry import init_sentry
from app.api.v1 import auth, clubs, users, assessment, admin, favorites, reports
from app.middleware.rate_limit import limiter, rate_limit_exceeded_handler

# Initialize Sentry for error tracking and monitoring
init_sentry()

# Create FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="ClubCompass - BMSCE Club Discovery Platform API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# Set up rate limiter state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

# GZip Compression
app.add_middleware(GZipMiddleware, minimum_size=1000)


# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "clubcompass-api",
        "version": "1.0.0",
    }


# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    """Root endpoint"""
    return {
        "message": "ClubCompass API",
        "version": "1.0.0",
        "docs": "/docs",
    }


# Include API routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(clubs.router, prefix="/api/v1/clubs", tags=["Clubs"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(assessment.router, prefix="/api/v1/assessments", tags=["Assessment"])
app.include_router(favorites.router, prefix="/api/v1/favorites", tags=["Favorites"])
app.include_router(reports.router, prefix="/api/v1", tags=["Reports"])
app.include_router(admin.router, prefix="/api/v1", tags=["Admin"])


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
