"""
Practice problem progress endpoints
"""

from fastapi import APIRouter, HTTPException
from app.database import prisma
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter()

class ProblemProgressCreate(BaseModel):
    problem_id: int
    is_bookmarked: Optional[bool] = False
    is_solved: Optional[bool] = False
    attempts: Optional[int] = 0

class ProblemProgressUpdate(BaseModel):
    is_bookmarked: Optional[bool] = None
    is_solved: Optional[bool] = None
    attempts: Optional[int] = None

class ProblemProgressResponse(BaseModel):
    id: str
    user_id: str
    problem_id: int
    is_bookmarked: bool
    is_solved: bool
    attempts: int
    last_attempted: Optional[datetime]
    solved_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

@router.get("/user/{user_id}/progress", response_model=List[ProblemProgressResponse])
async def get_user_progress(user_id: str):
    """Get all problem progress for a user"""
    try:
        progress_list = await prisma.userproblemprogress.find_many(
            where={"userId": user_id}
        )
        return [
            ProblemProgressResponse(
                id=progress.id,
                user_id=progress.userId,
                problem_id=progress.problemId,
                is_bookmarked=progress.isBookmarked,
                is_solved=progress.isSolved,
                attempts=progress.attempts,
                last_attempted=progress.lastAttempted,
                solved_at=progress.solvedAt,
                created_at=progress.createdAt,
                updated_at=progress.updatedAt
            )
            for progress in progress_list
        ]
    except Exception as e:
        import traceback
        error_detail = f"{str(e)}\n{traceback.format_exc()}"
        print(f"Error in get_user_progress: {error_detail}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/user/{user_id}/progress", response_model=ProblemProgressResponse)
async def create_or_update_progress(user_id: str, progress_data: ProblemProgressCreate):
    """Create or update problem progress for a user"""
    try:
        # Check if progress already exists using find_first (more reliable than find_unique for compound keys)
        existing = await prisma.userproblemprogress.find_first(
            where={
                "userId": user_id,
                "problemId": progress_data.problem_id
            }
        )
        
        update_data = {
            "isBookmarked": progress_data.is_bookmarked,
            "isSolved": progress_data.is_solved,
            "attempts": progress_data.attempts,
        }
        
        # Set solved_at if marking as solved, clear it if unsolving
        if progress_data.is_solved:
            # Always update solvedAt when marking as solved (ensures today's date is set)
            # This handles cases where problem was solved before and is being re-solved today
            update_data["solvedAt"] = datetime.now()
        else:
            # Clear solved_at when unsolving
            update_data["solvedAt"] = None
        
        # Set last_attempted
        update_data["lastAttempted"] = datetime.now()
        
        if existing:
            # Update existing progress
            updated = await prisma.userproblemprogress.update(
                where={"id": existing.id},
                data=update_data
            )
        else:
            # Create new progress
            updated = await prisma.userproblemprogress.create(
                data={
                    "userId": user_id,
                    "problemId": progress_data.problem_id,
                    **update_data
                }
            )
        
        return ProblemProgressResponse(
            id=updated.id,
            user_id=updated.userId,
            problem_id=updated.problemId,
            is_bookmarked=updated.isBookmarked,
            is_solved=updated.isSolved,
            attempts=updated.attempts,
            last_attempted=updated.lastAttempted,
            solved_at=updated.solvedAt,
            created_at=updated.createdAt,
            updated_at=updated.updatedAt
        )
    except Exception as e:
        import traceback
        error_detail = f"{str(e)}\n{traceback.format_exc()}"
        print(f"Error in create_or_update_progress: {error_detail}")
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/user/{user_id}/progress/{problem_id}", response_model=ProblemProgressResponse)
async def update_progress(user_id: str, problem_id: int, progress_data: ProblemProgressUpdate):
    """Update specific problem progress fields"""
    try:
        # Find existing progress using find_first
        existing = await prisma.userproblemprogress.find_first(
            where={
                "userId": user_id,
                "problemId": problem_id
            }
        )
        
        if not existing:
            raise HTTPException(status_code=404, detail="Progress not found")
        
        update_data = {}
        if progress_data.is_bookmarked is not None:
            update_data["isBookmarked"] = progress_data.is_bookmarked
        if progress_data.is_solved is not None:
            update_data["isSolved"] = progress_data.is_solved
            # Always update solvedAt when marking as solved (ensures today's date is set)
            # This handles cases where problem was solved before and is being re-solved today
            if progress_data.is_solved:
                update_data["solvedAt"] = datetime.now()
            else:
                # Clear solved_at when unsolving
                update_data["solvedAt"] = None
        if progress_data.attempts is not None:
            update_data["attempts"] = progress_data.attempts
        
        update_data["lastAttempted"] = datetime.now()
        
        updated = await prisma.userproblemprogress.update(
            where={"id": existing.id},
            data=update_data
        )
        
        return ProblemProgressResponse(
            id=updated.id,
            user_id=updated.userId,
            problem_id=updated.problemId,
            is_bookmarked=updated.isBookmarked,
            is_solved=updated.isSolved,
            attempts=updated.attempts,
            last_attempted=updated.lastAttempted,
            solved_at=updated.solvedAt,
            created_at=updated.createdAt,
            updated_at=updated.updatedAt
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/user/{user_id}/backfill-solved-dates")
async def backfill_solved_dates(user_id: str):
    """
    Backfill solved_at dates for solved problems that don't have them.
    Uses updated_at as the solved date (best guess for when it was marked as solved).
    This is a one-time migration endpoint.
    """
    try:
        # Find all solved problems without solved_at
        # Get all solved problems first, then filter for None solved_at in Python
        all_solved = await prisma.userproblemprogress.find_many(
            where={
                "userId": user_id,
                "isSolved": True
            }
        )
        # Filter for those without solved_at
        progress_list = [p for p in all_solved if p.solvedAt is None]
        
        updated_count = 0
        for progress in progress_list:
            # Use updated_at as the solved date (when it was last marked as solved)
            # If updated_at is also None, use created_at
            solved_date = progress.updatedAt if progress.updatedAt else progress.createdAt
            
            await prisma.userproblemprogress.update(
                where={"id": progress.id},
                data={"solvedAt": solved_date}
            )
            updated_count += 1
        
        return {
            "message": f"Backfilled solved_at dates for {updated_count} problems",
            "updated_count": updated_count
        }
    except Exception as e:
        import traceback
        error_detail = f"{str(e)}\n{traceback.format_exc()}"
        print(f"Error in backfill_solved_dates: {error_detail}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/user/{user_id}/progress/{problem_id}")
async def delete_progress(user_id: str, problem_id: int):
    """Delete problem progress"""
    try:
        existing = await prisma.userproblemprogress.find_first(
            where={
                "userId": user_id,
                "problemId": problem_id
            }
        )
        
        if not existing:
            raise HTTPException(status_code=404, detail="Progress not found")
        
        await prisma.userproblemprogress.delete(where={"id": existing.id})
        return {"message": "Progress deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
