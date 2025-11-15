"""
Users endpoints
"""
from fastapi import APIRouter

router = APIRouter()


@router.get("/me")
async def get_current_user():
    """Get current user profile"""
    return {"message": "Get user profile - to be implemented"}


@router.patch("/me")
async def update_profile():
    """Update user profile"""
    return {"message": "Update profile - to be implemented"}


@router.post("/me/clubs/{club_id}/join")
async def join_club(club_id: str):
    """Join a club"""
    return {"message": f"Join club {club_id} - to be implemented"}
