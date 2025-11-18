"""
Assessment service for processing quiz responses and generating club recommendations
"""
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from datetime import datetime
import uuid

from app.models.assessment import Assessment, Recommendation
from app.models.club import Club
from app.schemas.assessment import AssessmentCreate, AssessmentResult, ClubRecommendation, ReasoningItem


class AssessmentService:
    """Service for handling assessment operations and recommendations"""

    # Scoring weights for different response combinations (expanded for all major clubs)
    CLUB_SCORING_RULES = {
        # Technical/Coding clubs - Co-Curricular
        "acm": {
            "enjoy": {"coding": 4, "designing": 2, "organizing": 1, "public_speaking": 1, "creative": 2},
            "domain": {"ai": 3, "robotics": 2, "web": 3, "electronics": 1, "management": 0},
            "impact": {"tech": 4, "social": 1, "cultural": 0, "entrepreneurship": 2},
            "past": {"coding": 3, "technical": 3, "cultural": 0, "sports": 0, "none": 1},
        },
        "teamcodelocked": {
            "enjoy": {"coding": 5, "designing": 2, "organizing": 1, "public_speaking": 1, "creative": 1},
            "domain": {"ai": 2, "robotics": 1, "web": 3, "electronics": 1, "management": 0},
            "impact": {"tech": 5, "social": 0, "cultural": 0, "entrepreneurship": 1},
            "past": {"coding": 4, "technical": 3, "cultural": 0, "sports": 0, "none": 1},
        },
        "gdscl": {
            "enjoy": {"coding": 4, "designing": 3, "organizing": 2, "public_speaking": 2, "creative": 2},
            "domain": {"ai": 3, "robotics": 1, "web": 4, "electronics": 1, "management": 1},
            "impact": {"tech": 4, "social": 2, "cultural": 0, "entrepreneurship": 2},
            "past": {"coding": 3, "technical": 3, "cultural": 0, "sports": 0, "none": 2},
        },

        # AI/ML/Data Science clubs
        "augmentai": {
            "enjoy": {"coding": 4, "designing": 2, "organizing": 1, "public_speaking": 1, "creative": 2},
            "domain": {"ai": 5, "robotics": 2, "web": 2, "electronics": 1, "management": 1},
            "impact": {"tech": 5, "social": 1, "cultural": 0, "entrepreneurship": 2},
            "past": {"coding": 3, "technical": 4, "cultural": 0, "sports": 0, "none": 1},
        },
        "varaince": {
            "enjoy": {"coding": 4, "designing": 2, "organizing": 1, "public_speaking": 1, "creative": 1},
            "domain": {"ai": 5, "robotics": 1, "web": 2, "electronics": 1, "management": 1},
            "impact": {"tech": 5, "social": 1, "cultural": 0, "entrepreneurship": 2},
            "past": {"coding": 3, "technical": 4, "cultural": 0, "sports": 0, "none": 1},
        },
        "dsync": {
            "enjoy": {"coding": 4, "designing": 1, "organizing": 1, "public_speaking": 1, "creative": 1},
            "domain": {"ai": 5, "robotics": 1, "web": 3, "electronics": 1, "management": 1},
            "impact": {"tech": 4, "social": 1, "cultural": 0, "entrepreneurship": 2},
            "past": {"coding": 4, "technical": 3, "cultural": 0, "sports": 0, "none": 1},
        },
        "gradient": {
            "enjoy": {"coding": 4, "designing": 2, "organizing": 1, "public_speaking": 1, "creative": 1},
            "domain": {"ai": 5, "robotics": 2, "web": 2, "electronics": 1, "management": 1},
            "impact": {"tech": 5, "social": 1, "cultural": 0, "entrepreneurship": 2},
            "past": {"coding": 3, "technical": 4, "cultural": 0, "sports": 0, "none": 1},
        },

        # Robotics/Hardware/Aerospace clubs
        "robotics": {
            "enjoy": {"coding": 3, "designing": 4, "organizing": 1, "public_speaking": 0, "creative": 3},
            "domain": {"ai": 3, "robotics": 5, "web": 1, "electronics": 4, "management": 0},
            "impact": {"tech": 4, "social": 1, "cultural": 0, "entrepreneurship": 2},
            "past": {"coding": 2, "technical": 4, "cultural": 0, "sports": 0, "none": 1},
        },
        "aquila": {
            "enjoy": {"coding": 2, "designing": 4, "organizing": 1, "public_speaking": 1, "creative": 3},
            "domain": {"ai": 1, "robotics": 5, "web": 0, "electronics": 3, "management": 1},
            "impact": {"tech": 4, "social": 1, "cultural": 0, "entrepreneurship": 2},
            "past": {"coding": 1, "technical": 4, "cultural": 0, "sports": 0, "none": 1},
        },
        "aero": {
            "enjoy": {"coding": 2, "designing": 4, "organizing": 1, "public_speaking": 1, "creative": 3},
            "domain": {"ai": 1, "robotics": 5, "web": 0, "electronics": 3, "management": 1},
            "impact": {"tech": 4, "social": 1, "cultural": 0, "entrepreneurship": 2},
            "past": {"coding": 1, "technical": 4, "cultural": 0, "sports": 0, "none": 1},
        },
        "rocketry": {
            "enjoy": {"coding": 2, "designing": 5, "organizing": 1, "public_speaking": 1, "creative": 3},
            "domain": {"ai": 1, "robotics": 4, "web": 0, "electronics": 3, "management": 1},
            "impact": {"tech": 5, "social": 0, "cultural": 0, "entrepreneurship": 2},
            "past": {"coding": 1, "technical": 5, "cultural": 0, "sports": 0, "none": 1},
        },
        "upagraha": {
            "enjoy": {"coding": 3, "designing": 4, "organizing": 1, "public_speaking": 1, "creative": 2},
            "domain": {"ai": 2, "robotics": 5, "web": 1, "electronics": 4, "management": 1},
            "impact": {"tech": 5, "social": 1, "cultural": 0, "entrepreneurship": 2},
            "past": {"coding": 2, "technical": 5, "cultural": 0, "sports": 0, "none": 1},
        },
        "bullz": {
            "enjoy": {"coding": 1, "designing": 5, "organizing": 2, "public_speaking": 1, "creative": 3},
            "domain": {"ai": 0, "robotics": 4, "web": 0, "electronics": 3, "management": 2},
            "impact": {"tech": 4, "social": 1, "cultural": 0, "entrepreneurship": 3},
            "past": {"coding": 1, "technical": 5, "cultural": 0, "sports": 2, "none": 1},
        },

        # IEEE clubs
        "ieee-sb": {
            "enjoy": {"coding": 3, "designing": 2, "organizing": 1, "public_speaking": 1, "creative": 1},
            "domain": {"ai": 2, "robotics": 3, "web": 2, "electronics": 4, "management": 0},
            "impact": {"tech": 4, "social": 1, "cultural": 0, "entrepreneurship": 2},
            "past": {"coding": 2, "technical": 4, "cultural": 0, "sports": 0, "none": 1},
        },
        "ieee-cs": {
            "enjoy": {"coding": 4, "designing": 2, "organizing": 1, "public_speaking": 1, "creative": 1},
            "domain": {"ai": 3, "robotics": 2, "web": 4, "electronics": 2, "management": 0},
            "impact": {"tech": 5, "social": 1, "cultural": 0, "entrepreneurship": 1},
            "past": {"coding": 4, "technical": 3, "cultural": 0, "sports": 0, "none": 1},
        },
        "ieee-wie": {
            "enjoy": {"coding": 3, "designing": 2, "organizing": 2, "public_speaking": 2, "creative": 1},
            "domain": {"ai": 2, "robotics": 2, "web": 2, "electronics": 3, "management": 2},
            "impact": {"tech": 3, "social": 3, "cultural": 1, "entrepreneurship": 2},
            "past": {"coding": 2, "technical": 3, "cultural": 1, "sports": 0, "none": 2},
        },
        "ieee-pes": {
            "enjoy": {"coding": 2, "designing": 3, "organizing": 1, "public_speaking": 1, "creative": 1},
            "domain": {"ai": 1, "robotics": 2, "web": 1, "electronics": 5, "management": 1},
            "impact": {"tech": 4, "social": 2, "cultural": 0, "entrepreneurship": 1},
            "past": {"coding": 1, "technical": 4, "cultural": 0, "sports": 0, "none": 1},
        },
        "ieee-sps": {
            "enjoy": {"coding": 3, "designing": 2, "organizing": 1, "public_speaking": 1, "creative": 1},
            "domain": {"ai": 3, "robotics": 1, "web": 1, "electronics": 4, "management": 0},
            "impact": {"tech": 4, "social": 1, "cultural": 0, "entrepreneurship": 1},
            "past": {"coding": 2, "technical": 4, "cultural": 0, "sports": 0, "none": 1},
        },

        # Electronics & Engineering clubs
        "elsoc": {
            "enjoy": {"coding": 2, "designing": 4, "organizing": 1, "public_speaking": 1, "creative": 2},
            "domain": {"ai": 2, "robotics": 3, "web": 1, "electronics": 5, "management": 0},
            "impact": {"tech": 4, "social": 1, "cultural": 0, "entrepreneurship": 1},
            "past": {"coding": 2, "technical": 4, "cultural": 0, "sports": 0, "none": 1},
        },
        "eeea": {
            "enjoy": {"coding": 2, "designing": 3, "organizing": 1, "public_speaking": 1, "creative": 1},
            "domain": {"ai": 1, "robotics": 2, "web": 1, "electronics": 5, "management": 1},
            "impact": {"tech": 4, "social": 1, "cultural": 0, "entrepreneurship": 1},
            "past": {"coding": 1, "technical": 4, "cultural": 0, "sports": 0, "none": 1},
        },
        "mea": {
            "enjoy": {"coding": 1, "designing": 4, "organizing": 1, "public_speaking": 1, "creative": 2},
            "domain": {"ai": 1, "robotics": 3, "web": 0, "electronics": 3, "management": 2},
            "impact": {"tech": 4, "social": 1, "cultural": 0, "entrepreneurship": 2},
            "past": {"coding": 1, "technical": 5, "cultural": 0, "sports": 0, "none": 1},
        },

        # Department clubs - CS/IS
        "codeio": {
            "enjoy": {"coding": 5, "designing": 3, "organizing": 1, "public_speaking": 1, "creative": 2},
            "domain": {"ai": 3, "robotics": 1, "web": 4, "electronics": 1, "management": 1},
            "impact": {"tech": 5, "social": 1, "cultural": 0, "entrepreneurship": 2},
            "past": {"coding": 4, "technical": 3, "cultural": 0, "sports": 0, "none": 1},
        },
        "protocol": {
            "enjoy": {"coding": 4, "designing": 2, "organizing": 2, "public_speaking": 2, "creative": 2},
            "domain": {"ai": 2, "robotics": 1, "web": 3, "electronics": 1, "management": 1},
            "impact": {"tech": 4, "social": 1, "cultural": 0, "entrepreneurship": 2},
            "past": {"coding": 3, "technical": 3, "cultural": 0, "sports": 0, "none": 2},
        },
        "iseclub": {
            "enjoy": {"coding": 4, "designing": 2, "organizing": 2, "public_speaking": 2, "creative": 2},
            "domain": {"ai": 3, "robotics": 1, "web": 3, "electronics": 1, "management": 1},
            "impact": {"tech": 4, "social": 2, "cultural": 1, "entrepreneurship": 2},
            "past": {"coding": 3, "technical": 3, "cultural": 1, "sports": 0, "none": 2},
        },

        # Entrepreneurship clubs
        "edc": {
            "enjoy": {"coding": 1, "designing": 2, "organizing": 4, "public_speaking": 4, "creative": 3},
            "domain": {"ai": 1, "robotics": 0, "web": 2, "electronics": 0, "management": 5},
            "impact": {"tech": 2, "social": 2, "cultural": 1, "entrepreneurship": 5},
            "past": {"coding": 1, "technical": 1, "cultural": 1, "sports": 1, "none": 2},
        },
        "ciie": {
            "enjoy": {"coding": 1, "designing": 2, "organizing": 4, "public_speaking": 4, "creative": 2},
            "domain": {"ai": 2, "robotics": 0, "web": 2, "electronics": 0, "management": 5},
            "impact": {"tech": 2, "social": 2, "cultural": 0, "entrepreneurship": 5},
            "past": {"coding": 1, "technical": 1, "cultural": 0, "sports": 0, "none": 2},
        },
        "iic": {
            "enjoy": {"coding": 1, "designing": 2, "organizing": 4, "public_speaking": 3, "creative": 2},
            "domain": {"ai": 2, "robotics": 0, "web": 2, "electronics": 0, "management": 5},
            "impact": {"tech": 2, "social": 2, "cultural": 0, "entrepreneurship": 5},
            "past": {"coding": 1, "technical": 1, "cultural": 0, "sports": 0, "none": 2},
        },
        "business-insights": {
            "enjoy": {"coding": 1, "designing": 1, "organizing": 4, "public_speaking": 4, "creative": 2},
            "domain": {"ai": 1, "robotics": 0, "web": 1, "electronics": 0, "management": 5},
            "impact": {"tech": 1, "social": 2, "cultural": 0, "entrepreneurship": 5},
            "past": {"coding": 0, "technical": 1, "cultural": 1, "sports": 0, "none": 2},
        },

        # MedTech & Biotech
        "corrtechs": {
            "enjoy": {"coding": 2, "designing": 3, "organizing": 2, "public_speaking": 2, "creative": 2},
            "domain": {"ai": 3, "robotics": 2, "web": 2, "electronics": 3, "management": 2},
            "impact": {"tech": 4, "social": 4, "cultural": 0, "entrepreneurship": 3},
            "past": {"coding": 2, "technical": 3, "cultural": 0, "sports": 0, "none": 2},
        },
        "synapse": {
            "enjoy": {"coding": 1, "designing": 2, "organizing": 2, "public_speaking": 2, "creative": 2},
            "domain": {"ai": 2, "robotics": 1, "web": 1, "electronics": 2, "management": 2},
            "impact": {"tech": 3, "social": 3, "cultural": 1, "entrepreneurship": 2},
            "past": {"coding": 1, "technical": 3, "cultural": 1, "sports": 0, "none": 2},
        },

        # Mathematics
        "pentagram": {
            "enjoy": {"coding": 3, "designing": 1, "organizing": 2, "public_speaking": 2, "creative": 2},
            "domain": {"ai": 3, "robotics": 1, "web": 2, "electronics": 1, "management": 1},
            "impact": {"tech": 3, "social": 1, "cultural": 1, "entrepreneurship": 1},
            "past": {"coding": 3, "technical": 2, "cultural": 0, "sports": 0, "none": 2},
        },

        # Social/Service clubs
        "nss": {
            "enjoy": {"coding": 0, "designing": 1, "organizing": 4, "public_speaking": 3, "creative": 2},
            "domain": {"ai": 0, "robotics": 0, "web": 0, "electronics": 0, "management": 3},
            "impact": {"tech": 0, "social": 5, "cultural": 2, "entrepreneurship": 1},
            "past": {"coding": 0, "technical": 0, "cultural": 2, "sports": 1, "none": 3},
        },
        "rotaract": {
            "enjoy": {"coding": 0, "designing": 1, "organizing": 5, "public_speaking": 4, "creative": 2},
            "domain": {"ai": 0, "robotics": 0, "web": 0, "electronics": 0, "management": 4},
            "impact": {"tech": 0, "social": 5, "cultural": 2, "entrepreneurship": 2},
            "past": {"coding": 0, "technical": 0, "cultural": 2, "sports": 1, "none": 3},
        },
        "leosatva": {
            "enjoy": {"coding": 0, "designing": 1, "organizing": 4, "public_speaking": 4, "creative": 2},
            "domain": {"ai": 0, "robotics": 0, "web": 0, "electronics": 0, "management": 3},
            "impact": {"tech": 0, "social": 5, "cultural": 1, "entrepreneurship": 2},
            "past": {"coding": 0, "technical": 0, "cultural": 1, "sports": 1, "none": 3},
        },
        "mountaineering": {
            "enjoy": {"coding": 0, "designing": 1, "organizing": 2, "public_speaking": 1, "creative": 3},
            "domain": {"ai": 0, "robotics": 0, "web": 0, "electronics": 0, "management": 1},
            "impact": {"tech": 0, "social": 3, "cultural": 2, "entrepreneurship": 1},
            "past": {"coding": 0, "technical": 0, "cultural": 1, "sports": 5, "none": 2},
        },
        "respawn": {
            "enjoy": {"coding": 1, "designing": 2, "organizing": 3, "public_speaking": 1, "creative": 3},
            "domain": {"ai": 1, "robotics": 0, "web": 1, "electronics": 0, "management": 2},
            "impact": {"tech": 2, "social": 3, "cultural": 3, "entrepreneurship": 1},
            "past": {"coding": 1, "technical": 1, "cultural": 2, "sports": 3, "none": 2},
        },

        # Cultural clubs - Music & Dance
        "ninaad": {
            "enjoy": {"coding": 0, "designing": 1, "organizing": 1, "public_speaking": 3, "creative": 5},
            "domain": {"ai": 0, "robotics": 0, "web": 0, "electronics": 0, "management": 1},
            "impact": {"tech": 0, "social": 2, "cultural": 5, "entrepreneurship": 0},
            "past": {"coding": 0, "technical": 0, "cultural": 5, "sports": 0, "none": 2},
        },
        "groovehouse": {
            "enjoy": {"coding": 0, "designing": 2, "organizing": 2, "public_speaking": 3, "creative": 5},
            "domain": {"ai": 0, "robotics": 0, "web": 1, "electronics": 1, "management": 1},
            "impact": {"tech": 0, "social": 2, "cultural": 5, "entrepreneurship": 1},
            "past": {"coding": 0, "technical": 0, "cultural": 5, "sports": 0, "none": 2},
        },
        "paramvah": {
            "enjoy": {"coding": 0, "designing": 2, "organizing": 1, "public_speaking": 2, "creative": 5},
            "domain": {"ai": 0, "robotics": 0, "web": 0, "electronics": 0, "management": 1},
            "impact": {"tech": 0, "social": 2, "cultural": 5, "entrepreneurship": 0},
            "past": {"coding": 0, "technical": 0, "cultural": 5, "sports": 1, "none": 2},
        },
        "danzaddix": {
            "enjoy": {"coding": 0, "designing": 2, "organizing": 1, "public_speaking": 2, "creative": 5},
            "domain": {"ai": 0, "robotics": 0, "web": 0, "electronics": 0, "management": 1},
            "impact": {"tech": 0, "social": 2, "cultural": 5, "entrepreneurship": 0},
            "past": {"coding": 0, "technical": 0, "cultural": 5, "sports": 1, "none": 2},
        },

        # Cultural clubs - Arts & Literature
        "inksanity": {
            "enjoy": {"coding": 0, "designing": 1, "organizing": 2, "public_speaking": 5, "creative": 4},
            "domain": {"ai": 0, "robotics": 0, "web": 1, "electronics": 0, "management": 2},
            "impact": {"tech": 0, "social": 3, "cultural": 5, "entrepreneurship": 1},
            "past": {"coding": 0, "technical": 0, "cultural": 5, "sports": 0, "none": 2},
        },
        "finearts": {
            "enjoy": {"coding": 0, "designing": 3, "organizing": 1, "public_speaking": 1, "creative": 5},
            "domain": {"ai": 0, "robotics": 0, "web": 1, "electronics": 0, "management": 0},
            "impact": {"tech": 0, "social": 2, "cultural": 5, "entrepreneurship": 0},
            "past": {"coding": 0, "technical": 0, "cultural": 5, "sports": 0, "none": 2},
        },
        "falcons": {
            "enjoy": {"coding": 1, "designing": 4, "organizing": 2, "public_speaking": 1, "creative": 5},
            "domain": {"ai": 1, "robotics": 1, "web": 2, "electronics": 1, "management": 1},
            "impact": {"tech": 2, "social": 2, "cultural": 5, "entrepreneurship": 1},
            "past": {"coding": 0, "technical": 1, "cultural": 4, "sports": 1, "none": 2},
        },
        "pravrutthi": {
            "enjoy": {"coding": 0, "designing": 2, "organizing": 2, "public_speaking": 5, "creative": 5},
            "domain": {"ai": 0, "robotics": 0, "web": 0, "electronics": 0, "management": 1},
            "impact": {"tech": 0, "social": 3, "cultural": 5, "entrepreneurship": 0},
            "past": {"coding": 0, "technical": 0, "cultural": 5, "sports": 0, "none": 2},
        },
        "panache": {
            "enjoy": {"coding": 0, "designing": 4, "organizing": 3, "public_speaking": 2, "creative": 5},
            "domain": {"ai": 0, "robotics": 0, "web": 1, "electronics": 0, "management": 2},
            "impact": {"tech": 0, "social": 2, "cultural": 5, "entrepreneurship": 2},
            "past": {"coding": 0, "technical": 0, "cultural": 5, "sports": 0, "none": 2},
        },
        "chiranthana": {
            "enjoy": {"coding": 0, "designing": 1, "organizing": 2, "public_speaking": 3, "creative": 4},
            "domain": {"ai": 0, "robotics": 0, "web": 0, "electronics": 0, "management": 1},
            "impact": {"tech": 0, "social": 2, "cultural": 5, "entrepreneurship": 0},
            "past": {"coding": 0, "technical": 0, "cultural": 5, "sports": 0, "none": 2},
        },
        "samskruthi": {
            "enjoy": {"coding": 0, "designing": 2, "organizing": 2, "public_speaking": 3, "creative": 5},
            "domain": {"ai": 0, "robotics": 0, "web": 0, "electronics": 0, "management": 1},
            "impact": {"tech": 0, "social": 2, "cultural": 5, "entrepreneurship": 0},
            "past": {"coding": 0, "technical": 0, "cultural": 5, "sports": 0, "none": 2},
        },
        "munsoc": {
            "enjoy": {"coding": 0, "designing": 1, "organizing": 4, "public_speaking": 5, "creative": 2},
            "domain": {"ai": 0, "robotics": 0, "web": 0, "electronics": 0, "management": 4},
            "impact": {"tech": 0, "social": 4, "cultural": 3, "entrepreneurship": 2},
            "past": {"coding": 0, "technical": 0, "cultural": 3, "sports": 0, "none": 2},
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

        Now uses real clubs from the database with comprehensive scoring rules
        """
        # Query all active clubs from the database
        db_clubs = db.query(Club).filter(Club.is_active == True).all()

        # If no clubs in database, return empty list
        if not db_clubs:
            return []

        # Convert database clubs to dict format and calculate scores
        scored_clubs = []
        for db_club in db_clubs:
            # Only calculate score if we have scoring rules for this club
            if db_club.slug in AssessmentService.CLUB_SCORING_RULES:
                score, reasoning = AssessmentService.calculate_club_score(db_club.slug, responses)

                # Convert club to dict format expected by recommendation schema
                club_dict = {
                    "id": str(db_club.id),
                    "name": db_club.name,
                    "slug": db_club.slug,
                    "tagline": db_club.tagline or "",
                    "logo_url": db_club.logo_url or f"/images/clubs/{db_club.slug}.jpg"
                }

                scored_clubs.append({
                    "club": club_dict,
                    "score": score,
                    "reasoning": reasoning
                })

        # If no clubs have scoring rules, return empty list
        if not scored_clubs:
            return []

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
