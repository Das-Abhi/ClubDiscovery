"""
Assessment service for processing quiz responses and generating club recommendations
"""
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from datetime import datetime
import uuid

from app.models.assessment import Assessment, Recommendation
from app.schemas.assessment import AssessmentCreate, AssessmentResult, ClubRecommendation, ReasoningItem


class AssessmentService:
    """Service for handling assessment operations and recommendations"""

    # Scoring weights for different response combinations
    CLUB_SCORING_RULES = {
        # Technical/Coding clubs
        "acm": {
            "enjoy": {"coding": 4, "designing": 2, "organizing": 1, "public_speaking": 1, "creative": 2},
            "domain": {"ai": 3, "robotics": 2, "web": 3, "electronics": 1, "management": 0},
            "impact": {"tech": 4, "social": 1, "cultural": 0, "entrepreneurship": 2},
            "past": {"coding": 3, "technical": 3, "cultural": 0, "sports": 0, "none": 1},
        },
        "ieee": {
            "enjoy": {"coding": 3, "designing": 2, "organizing": 1, "public_speaking": 1, "creative": 1},
            "domain": {"ai": 2, "robotics": 3, "web": 2, "electronics": 4, "management": 0},
            "impact": {"tech": 4, "social": 1, "cultural": 0, "entrepreneurship": 2},
            "past": {"coding": 2, "technical": 4, "cultural": 0, "sports": 0, "none": 1},
        },
        "robotics": {
            "enjoy": {"coding": 3, "designing": 4, "organizing": 1, "public_speaking": 0, "creative": 3},
            "domain": {"ai": 3, "robotics": 5, "web": 1, "electronics": 4, "management": 0},
            "impact": {"tech": 4, "social": 1, "cultural": 0, "entrepreneurship": 2},
            "past": {"coding": 2, "technical": 4, "cultural": 0, "sports": 0, "none": 1},
        },
        # Cultural clubs
        "dance": {
            "enjoy": {"coding": 0, "designing": 2, "organizing": 1, "public_speaking": 2, "creative": 5},
            "domain": {"ai": 0, "robotics": 0, "web": 0, "electronics": 0, "management": 2},
            "impact": {"tech": 0, "social": 2, "cultural": 5, "entrepreneurship": 1},
            "past": {"coding": 0, "technical": 0, "cultural": 5, "sports": 1, "none": 2},
        },
        "music": {
            "enjoy": {"coding": 0, "designing": 2, "organizing": 1, "public_speaking": 3, "creative": 5},
            "domain": {"ai": 0, "robotics": 0, "web": 1, "electronics": 1, "management": 1},
            "impact": {"tech": 0, "social": 2, "cultural": 5, "entrepreneurship": 1},
            "past": {"coding": 0, "technical": 0, "cultural": 5, "sports": 0, "none": 2},
        },
        # Management/Entrepreneurship clubs
        "edc": {
            "enjoy": {"coding": 1, "designing": 2, "organizing": 4, "public_speaking": 4, "creative": 3},
            "domain": {"ai": 1, "robotics": 0, "web": 2, "electronics": 0, "management": 5},
            "impact": {"tech": 2, "social": 2, "cultural": 1, "entrepreneurship": 5},
            "past": {"coding": 1, "technical": 1, "cultural": 1, "sports": 1, "none": 2},
        },
    }

    # Question mappings
    QUESTION_TEXT = {
        "enjoy": "What do you enjoy most?",
        "time": "How much time can you commit?",
        "domain": "Which domain are you most drawn to?",
        "impact": "What kind of impact do you want to create?",
        "past": "Past experience?",
    }

    ANSWER_TEXT = {
        "enjoy": {
            "coding": "Coding / problem solving",
            "designing": "Designing and building things",
            "organizing": "Organizing events",
            "public_speaking": "Public speaking",
            "creative": "Creative arts",
        },
        "domain": {
            "ai": "Artificial Intelligence / Data Science",
            "robotics": "Robotics / IoT",
            "web": "Web / Mobile Development",
            "electronics": "Electronics / Hardware",
            "management": "Management / Entrepreneurship",
        },
        "impact": {
            "tech": "Technological innovation",
            "social": "Social change",
            "cultural": "Cultural enrichment",
            "entrepreneurship": "Entrepreneurship / Business",
        },
        "past": {
            "coding": "Coding competitions",
            "technical": "Technical projects",
            "cultural": "Cultural events",
            "sports": "Sports events",
            "none": "None, first time!",
        },
    }

    @staticmethod
    def calculate_club_score(club_slug: str, responses: Dict[str, str]) -> tuple[int, List[ReasoningItem]]:
        """
        Calculate score for a club based on assessment responses

        Returns: (score, reasoning_list)
        """
        rules = AssessmentService.CLUB_SCORING_RULES.get(club_slug, {})
        total_score = 0
        reasoning = []

        for question_key, answer_value in responses.items():
            if question_key == "time":  # Time commitment doesn't affect scoring
                continue

            if question_key in rules and answer_value in rules[question_key]:
                contribution = rules[question_key][answer_value]
                total_score += contribution

                if contribution > 0:  # Only add if it contributed to the score
                    reasoning.append(ReasoningItem(
                        question=AssessmentService.QUESTION_TEXT[question_key],
                        answer=AssessmentService.ANSWER_TEXT[question_key].get(answer_value, answer_value),
                        contribution=contribution
                    ))

        return total_score, reasoning

    @staticmethod
    def get_club_recommendations(
        db: Session,
        responses: Dict[str, str],
        top_n: int = 10
    ) -> List[ClubRecommendation]:
        """
        Generate club recommendations based on assessment responses

        For now, we'll use the sample clubs since we don't have clubs in DB yet
        """
        # Sample clubs data (hardcoded for now - will be replaced with DB query)
        sample_clubs = [
            {"id": "1", "name": "ACM Student Chapter", "slug": "acm", "tagline": "ACM student chapter — computing & AI", "logo_url": "/images/clubs/acm.jpg"},
            {"id": "2", "name": "IEEE Student Branch", "slug": "ieee", "tagline": "Advancing technology for humanity", "logo_url": "/images/clubs/ieee.jpg"},
            {"id": "3", "name": "Robotics Club", "slug": "robotics", "tagline": "Build the future", "logo_url": "/images/clubs/robotics.jpg"},
            {"id": "4", "name": "Dance Club", "slug": "dance", "tagline": "Express through movement", "logo_url": "/images/clubs/dance.jpg"},
            {"id": "5", "name": "Music Club", "slug": "music", "tagline": "Create harmony", "logo_url": "/images/clubs/music.jpg"},
            {"id": "6", "name": "EDC", "slug": "edc", "tagline": "Entrepreneurship Development Cell", "logo_url": "/images/clubs/edc.jpg"},
        ]

        # Calculate scores for all clubs
        scored_clubs = []
        for club in sample_clubs:
            score, reasoning = AssessmentService.calculate_club_score(club["slug"], responses)
            scored_clubs.append({
                "club": club,
                "score": score,
                "reasoning": reasoning
            })

        # Sort by score (descending) and assign ranks
        scored_clubs.sort(key=lambda x: x["score"], reverse=True)

        # Create recommendations with ranks
        recommendations = []
        for rank, item in enumerate(scored_clubs[:top_n], start=1):
            recommendations.append(ClubRecommendation(
                club=item["club"],
                score=item["score"],
                rank=rank,
                reasoning=[r.model_dump() for r in item["reasoning"]]
            ))

        return recommendations

    @staticmethod
    def create_assessment(
        db: Session,
        assessment_data: AssessmentCreate
    ) -> Assessment:
        """Create a new assessment and store it in the database"""
        # Create assessment
        assessment = Assessment(
            id=uuid.uuid4(),
            user_id=assessment_data.user_id,
            responses=assessment_data.responses.model_dump(),
        )

        db.add(assessment)
        db.commit()
        db.refresh(assessment)

        # Generate recommendations
        recommendations = AssessmentService.get_club_recommendations(
            db,
            assessment_data.responses.model_dump()
        )

        # Store recommendations
        for rec in recommendations:
            recommendation = Recommendation(
                assessment_id=assessment.id,
                club_id=rec.club["slug"],
                score=rec.score,
                rank=rec.rank,
                reasoning=[r.model_dump() if hasattr(r, 'model_dump') else r for r in rec.reasoning]
            )
            db.add(recommendation)

        db.commit()

        return assessment

    @staticmethod
    def get_assessment_by_id(
        db: Session,
        assessment_id: str
    ) -> Optional[Assessment]:
        """Get assessment by ID"""
        try:
            assessment_uuid = uuid.UUID(assessment_id)
            return db.query(Assessment).filter(Assessment.id == assessment_uuid).first()
        except ValueError:
            return None

    @staticmethod
    def get_user_assessments(
        db: Session,
        user_id: str,
        limit: int = 10
    ) -> List[Assessment]:
        """Get assessments for a specific user"""
        try:
            user_uuid = uuid.UUID(user_id)
            return db.query(Assessment)\
                .filter(Assessment.user_id == user_uuid)\
                .order_by(Assessment.created_at.desc())\
                .limit(limit)\
                .all()
        except ValueError:
            return []


# Create singleton instance
assessment_service = AssessmentService()
