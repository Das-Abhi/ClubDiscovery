"""
Assessment endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.schemas.assessment import (
    AssessmentCreate,
    AssessmentResponse,
    AssessmentResult,
    ClubRecommendation,
)
from app.services.assessment_service import assessment_service
from app.services.club_service import club_service
from app.api.deps import get_current_user, get_optional_user
from app.models.user import User

router = APIRouter()


@router.post("/", response_model=AssessmentResult, status_code=status.HTTP_201_CREATED)
async def submit_assessment(
    assessment_data: AssessmentCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """
    Submit assessment and get club recommendations

    This endpoint can be used by both authenticated and anonymous users.
    If user is authenticated, the assessment will be saved to their profile.

    - **responses**: Assessment question responses
    - **user_id**: Optional user ID (only for authenticated users)

    Returns recommendations ranked by relevance
    """
    try:
        # Override user_id if user is authenticated
        if current_user:
            assessment_data.user_id = str(current_user.id)

        # Create assessment and get recommendations
        assessment = assessment_service.create_assessment(db, assessment_data)

        # Get recommendations
        recommendations = assessment_service.get_club_recommendations(
            db,
            assessment_data.responses.model_dump()
        )

        return AssessmentResult(
            assessment_id=str(assessment.id),
            recommendations=recommendations,
            created_at=assessment.created_at
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Assessment processing failed: {str(e)}"
        ) from e


@router.get("/{assessment_id}", response_model=AssessmentResult)
async def get_assessment(
    assessment_id: str,
    db: Session = Depends(get_db)
):
    """
    Get assessment results by ID

    - **assessment_id**: UUID of the assessment

    Returns the assessment with recommendations
    """
    assessment = assessment_service.get_assessment_by_id(db, assessment_id)

    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found"
        )

    # Reconstruct recommendations from stored data by fetching club details from database
    recommendations = []

    for rec in sorted(assessment.recommendations, key=lambda x: x.rank):
        # Fetch club from database using slug
        club = club_service.get_club_by_slug(db, rec.club_id)

        if club:
            # Use actual club data from database
            club_data = {
                "id": str(club.id),
                "name": club.name,
                "slug": club.slug,
                "tagline": club.tagline or "",
                "logo_url": club.logo_url or ""
            }
        else:
            # Fallback for clubs that might have been deleted
            club_data = {
                "id": rec.club_id,
                "name": rec.club_id.replace("-", " ").title(),
                "slug": rec.club_id,
                "tagline": "Club information unavailable",
                "logo_url": ""
            }

        recommendations.append(ClubRecommendation(
            club=club_data,
            score=rec.score,
            rank=rec.rank,
            reasoning=rec.reasoning or []
        ))

    return AssessmentResult(
        assessment_id=str(assessment.id),
        recommendations=recommendations,
        created_at=assessment.created_at
    )


@router.get("/user/{user_id}", response_model=List[AssessmentResponse])
async def get_user_assessments(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all assessments for a user

    Requires authentication. Users can only access their own assessments.

    - **user_id**: UUID of the user

    Returns list of assessments
    """
    # Verify user can only access their own assessments
    if str(current_user.id) != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only access your own assessments"
        )

    assessments = assessment_service.get_user_assessments(db, user_id)

    return [
        AssessmentResponse(
            id=str(assessment.id),
            user_id=str(assessment.user_id) if assessment.user_id else None,
            responses=assessment.responses,
            created_at=assessment.created_at
        )
        for assessment in assessments
    ]
