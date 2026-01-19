"""
User management endpoints
"""

from fastapi import APIRouter, HTTPException
from app.models import UserCreate, UserResponse
from app.database import prisma
from app.services.intelligence import CareerIntelligence
from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel

router = APIRouter()
intelligence = CareerIntelligence()

# Helper function to check if user is admin
async def check_admin(user_id: str) -> bool:
    """Check if a user has admin privileges"""
    try:
        user = await prisma.user.find_unique(where={"id": user_id})
        if not user:
            return False
        # Handle case where isAdmin field doesn't exist yet (migration not run)
        return getattr(user, 'isAdmin', False)
    except Exception as e:
        print(f"Error checking admin status: {e}")
        return False

@router.post("/", response_model=UserResponse)
async def create_user(user_data: UserCreate):
    """Create a new user and calculate initial readiness score"""
    try:
        # Calculate initial readiness score (average across all roles)
        # For now, set to 0, will be calculated when applications are created
        readiness_score = 0.0
        
        user = await prisma.user.create(
            data={
                "careerStream": user_data.career_stream,
                "skills": user_data.skills,
                "universityYear": user_data.university_year,
                "graduationYear": user_data.graduation_year,
                "country": user_data.country,
                "targetTiers": user_data.target_tiers,
                "readinessScore": readiness_score
            }
        )
        
        return UserResponse(
            id=user.id,
            career_stream=user.careerStream,
            skills=user.skills,
            university_year=user.universityYear,
            graduation_year=user.graduationYear,
            country=user.country,
            target_tiers=user.targetTiers,
            readiness_score=user.readinessScore,
            profile_picture=user.profilePicture,
            email=user.email,
            username=getattr(user, 'username', None),
            last_active_at=user.lastActiveAt,
            created_at=user.createdAt,
            updated_at=user.updatedAt
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: str):
    """Get user by ID"""
    user = await prisma.user.find_unique(where={"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Handle case where username field doesn't exist yet (migration not run)
    try:
        username = user.username
    except AttributeError:
        username = None
    
    # Debug logging for profile picture
    profile_pic = user.profilePicture
    print(f"========== DEBUG get_user ==========")
    print(f"User ID: {user_id}")
    print(f"Email: {user.email}")
    print(f"Profile picture exists: {profile_pic is not None}")
    print(f"Profile picture type: {type(profile_pic)}")
    if profile_pic:
        print(f"Profile picture length: {len(profile_pic)}")
        print(f"First 100 chars: {profile_pic[:100]}...")
        print(f"Starts with 'data:': {profile_pic.startswith('data:')}")
    else:
        print(f"Profile picture is None or empty")
    print(f"====================================")
    
    # Build response explicitly
    response = UserResponse(
        id=user.id,
        career_stream=user.careerStream,
        skills=user.skills,
        university_year=user.universityYear,
        graduation_year=user.graduationYear,
        country=user.country,
        target_tiers=user.targetTiers,
        readiness_score=user.readinessScore,
        profile_picture=profile_pic,  # Explicitly set profile picture
        email=user.email,
        username=getattr(user, 'username', None),
        last_active_at=user.lastActiveAt,
        created_at=user.createdAt,
        updated_at=user.updatedAt
    )
    
    # Verify response has profile picture
    print(f"Response profile_picture exists: {response.profile_picture is not None}")
    if response.profile_picture:
        print(f"Response profile_picture length: {len(response.profile_picture)}")
    
    return response

@router.put("/{user_id}", response_model=UserResponse)
async def update_user(user_id: str, user_data: UserCreate):
    """Update user data"""
    user = await prisma.user.find_unique(where={"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    updated = await prisma.user.update(
        where={"id": user_id},
        data={
            "careerStream": user_data.career_stream,
            "skills": user_data.skills,
            "universityYear": user_data.university_year,
            "graduationYear": user_data.graduation_year,
            "country": user_data.country,
            "targetTiers": user_data.target_tiers
        }
    )
    
    return UserResponse(
        id=updated.id,
        career_stream=updated.careerStream,
        skills=updated.skills,
        university_year=updated.universityYear,
        graduation_year=updated.graduationYear,
        country=updated.country,
        target_tiers=updated.targetTiers,
        readiness_score=updated.readinessScore,
        profile_picture=updated.profilePicture,
        email=updated.email,
        username=getattr(updated, 'username', None),
        last_active_at=updated.lastActiveAt,
        created_at=updated.createdAt,
        updated_at=updated.updatedAt
    )

class ProblemStatsResponse(BaseModel):
    total_solved: int
    easy_solved: int
    medium_solved: int
    hard_solved: int
    difficulty_distribution: Dict[str, int]

class ActivityStatusResponse(BaseModel):
    is_online: bool
    last_active_at: Optional[datetime]

@router.get("/{user_id}/stats/problems", response_model=ProblemStatsResponse)
async def get_user_problem_stats(user_id: str):
    """
    Get user's problem solving statistics
    Returns total solved count and difficulty breakdown
    """
    try:
        # Import get_problem_difficulty from ranking
        from app.routers.ranking import get_problem_difficulty
        
        # Get all solved problems for this user
        progress_list = await prisma.userproblemprogress.find_many(
            where={"userId": user_id, "isSolved": True}
        )
        
        easy_count = 0
        medium_count = 0
        hard_count = 0
        
        for progress in progress_list:
            difficulty = get_problem_difficulty(progress.problemId)
            if difficulty == 'Easy':
                easy_count += 1
            elif difficulty == 'Medium':
                medium_count += 1
            else:
                hard_count += 1
        
        return ProblemStatsResponse(
            total_solved=len(progress_list),
            easy_solved=easy_count,
            medium_solved=medium_count,
            hard_solved=hard_count,
            difficulty_distribution={
                'Easy': easy_count,
                'Medium': medium_count,
                'Hard': hard_count
            }
        )
    except Exception as e:
        import traceback
        error_detail = f"{str(e)}\n{traceback.format_exc()}"
        print(f"Error in get_user_problem_stats: {error_detail}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{user_id}/activity/heartbeat")
async def update_user_activity(user_id: str):
    """
    Update user's last active timestamp
    Called periodically to track user activity
    """
    try:
        # Check if user exists
        user = await prisma.user.find_unique(where={"id": user_id})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Check if lastActiveAt field exists in the model (handle case where migration not run yet)
        try:
            # Update lastActiveAt with timezone-aware datetime
            from datetime import timezone
            await prisma.user.update(
                where={"id": user_id},
                data={"lastActiveAt": datetime.now(timezone.utc)}
            )
        except (AttributeError, Exception) as e:
            # If lastActiveAt field doesn't exist yet (migration not run), silently fail
            # This is not critical - activity tracking is optional
            error_msg = str(e).lower()
            if "lastactiveat" in error_msg or "attribute" in error_msg or "does not exist" in error_msg:
                print(f"Warning: lastActiveAt field not available yet. Migration may be needed.")
                return {"success": False, "message": "Activity tracking not available yet. Please run migrations."}
            raise
        
        return {"success": True, "last_active_at": datetime.now()}
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_detail = f"{str(e)}\n{traceback.format_exc()}"
        print(f"Error in update_user_activity: {error_detail}")
        # Return success anyway - activity tracking is not critical
        return {"success": False, "message": "Activity update failed"}

@router.get("/{user_id}/activity/status", response_model=ActivityStatusResponse)
async def get_user_activity_status(user_id: str):
    """
    Get user's activity status (online/offline with last active time)
    """
    try:
        user = await prisma.user.find_unique(where={"id": user_id})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Check if lastActiveAt field exists (handle case where migration not run yet)
        try:
            last_active = user.lastActiveAt
            is_online = False
            
            if last_active:
                # Consider user online if active within last 5 minutes
                # Handle timezone-aware datetimes from database
                from datetime import timezone
                # Make both datetimes timezone-aware for comparison
                if last_active.tzinfo is None:
                    # Database returned naive datetime, use naive now
                    now = datetime.now()
                else:
                    # Database returned timezone-aware datetime, use timezone-aware now
                    now = datetime.now(timezone.utc)
                time_diff = (now - last_active).total_seconds()
                is_online = time_diff < 300  # 5 minutes
            
            return ActivityStatusResponse(
                is_online=is_online,
                last_active_at=last_active
            )
        except AttributeError:
            # If lastActiveAt field doesn't exist yet, return offline status
            return ActivityStatusResponse(
                is_online=False,
                last_active_at=None
            )
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_detail = f"{str(e)}\n{traceback.format_exc()}"
        print(f"Error in get_user_activity_status: {error_detail}")
        # Return offline status on error - activity tracking is optional
        return ActivityStatusResponse(
            is_online=False,
            last_active_at=None
        )

class ProfileUpdateRequest(BaseModel):
    profile_picture: Optional[str] = None
    username: Optional[str] = None

@router.patch("/{user_id}/profile", response_model=UserResponse)
async def update_user_profile(user_id: str, profile_data: ProfileUpdateRequest):
    """
    Update user profile picture and/or username
    Validates username uniqueness and format
    """
    try:
        # Log which user is being updated
        print(f"DEBUG: update_user_profile called for user_id: {user_id}")
        print(f"DEBUG: Profile update data - has_picture: {profile_data.profile_picture is not None}, has_username: {profile_data.username is not None}")
        
        # Check if user exists
        user = await prisma.user.find_unique(where={"id": user_id})
        if not user:
            print(f"ERROR: User {user_id} not found in database")
            raise HTTPException(status_code=404, detail="User not found")
        
        print(f"DEBUG: Found user - id: {user.id}, email: {user.email}, current_profile_picture: {user.profilePicture is not None}")
        
        # Build update data
        update_data = {}
        
        # Validate and update profile picture
        if profile_data.profile_picture is not None:
            # Log the profile picture data for debugging
            profile_pic = profile_data.profile_picture
            print(f"DEBUG: Updating profile picture. Length: {len(profile_pic) if profile_pic else 0}, Type: {type(profile_pic)}")
            print(f"DEBUG: First 100 chars: {profile_pic[:100] if profile_pic else 'None'}...")
            
            # Handle empty string - treat as removing profile picture
            if profile_pic and profile_pic.strip():
                update_data["profilePicture"] = profile_pic
            else:
                # Empty string means remove profile picture
                update_data["profilePicture"] = None
                print(f"DEBUG: Profile picture is empty, setting to None")
        
        # Validate and update username (only if provided)
        # Note: We'll try to update username, but catch database errors if column doesn't exist
        if profile_data.username is not None:
            username = profile_data.username.strip()
            
            # Always validate username format first
            if len(username) < 3:
                raise HTTPException(status_code=400, detail="Username must be at least 3 characters long")
            if len(username) > 30:
                raise HTTPException(status_code=400, detail="Username must be at most 30 characters long")
            
            import re
            if not re.match(r'^[a-zA-Z0-9_-]+$', username):
                raise HTTPException(status_code=400, detail="Username can only contain letters, numbers, underscores, and hyphens")
            
            # Try to check if username field exists and validate uniqueness
            # If it doesn't exist, we'll catch the database error later
            try:
                # Try to get current username
                current_username = getattr(user, 'username', None) or ''
                
                # Check username uniqueness (if different from current)
                if username.lower() != current_username.lower():
                    try:
                        existing_user = await prisma.user.find_first(
                            where={"username": username, "id": {"not": user_id}}
                        )
                        if existing_user:
                            raise HTTPException(status_code=400, detail="Username is already taken")
                    except (AttributeError, Exception) as e:
                        # If Prisma client not regenerated or field doesn't exist, skip uniqueness check
                        error_msg = str(e).lower()
                        if "username" not in error_msg and "attribute" not in error_msg and "column" not in error_msg:
                            raise
                
                # Add username to update_data - will fail at database level if column doesn't exist
                update_data["username"] = username
            except AttributeError:
                # Field doesn't exist in model - skip username update
                print("Username field not available in model, skipping username update")
                # Don't add username to update_data
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        # Update user - handle case where database column doesn't exist yet
        try:
            print(f"DEBUG: Updating user {user_id} with data: {list(update_data.keys())}")
            print(f"DEBUG: Current user before update - id: {user.id}, email: {user.email}")
            if "profilePicture" in update_data:
                print(f"DEBUG: Profile picture update - old: {user.profilePicture[:50] if user.profilePicture else 'None'}..., new: {update_data['profilePicture'][:50] if update_data['profilePicture'] else 'None'}...")
            
            updated = await prisma.user.update(
                where={"id": user_id},
                data=update_data
            )
            print(f"DEBUG: Successfully updated user {updated.id}. Profile picture exists: {updated.profilePicture is not None}")
            if updated.profilePicture:
                print(f"DEBUG: Updated profile picture length: {len(updated.profilePicture)}, type: {'base64' if updated.profilePicture.startswith('data:') else 'URL'}")
        except Exception as e:
            # Log the error for debugging
            import traceback
            error_detail = f"{str(e)}\n{traceback.format_exc()}"
            print(f"========== ERROR UPDATING USER PROFILE ==========")
            print(f"Error: {str(e)}")
            print(f"Error type: {type(e).__name__}")
            print(f"Update data: {update_data}")
            print(f"Full traceback:\n{traceback.format_exc()}")
            print(f"================================================")
            
            # Check if error is about missing column (database migration not run)
            error_msg = str(e).lower()
            error_repr = repr(e).lower()
            
            # Check for database column errors related to username - be more lenient
            username_column_error = (
                ("column" in error_msg and "username" in error_msg) or
                ("column" in error_repr and "username" in error_repr) or
                ("does not exist" in error_msg and "username" in error_msg) or
                ("not found" in error_msg and "username" in error_msg) or
                ("missing" in error_msg and "username" in error_msg) or
                ("relation" in error_msg and "username" in error_msg) or
                ("undefined column" in error_msg and "username" in error_msg)
            )
            
            print(f"Username column error detected: {username_column_error}")
            print(f"'username' in update_data: {'username' in update_data}")
            
            if username_column_error and "username" in update_data:
                # Username column doesn't exist - retry without username
                print(f"Username column doesn't exist in database, retrying update without username")
                
                # Create update_data without username
                update_data_without_username = {k: v for k, v in update_data.items() if k != "username"}
                
                if not update_data_without_username:
                    # No other fields to update
                    raise HTTPException(
                        status_code=503,
                        detail="Username feature not available yet. Database migration required. Please update profile picture separately."
                    )
                
                # Retry update without username
                try:
                    updated = await prisma.user.update(
                        where={"id": user_id},
                        data=update_data_without_username
                    )
                    print(f"Successfully updated profile without username field")
                except Exception as e2:
                    # If profile picture update also fails, raise error
                    raise HTTPException(
                        status_code=500,
                        detail=f"Failed to update profile: {str(e2)}"
                    )
            else:
                # Some other error - wrap it in HTTPException
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to update profile: {str(e)}"
                )
        
        # Handle case where username field doesn't exist yet (migration not run)
        try:
            username = updated.username
        except AttributeError:
            username = None
        
        return UserResponse(
            id=updated.id,
            career_stream=updated.careerStream,
            skills=updated.skills,
            university_year=updated.universityYear,
            graduation_year=updated.graduationYear,
            country=updated.country,
            target_tiers=updated.targetTiers,
            readiness_score=updated.readinessScore,
            profile_picture=updated.profilePicture,
            email=updated.email,
            username=username,
            last_active_at=updated.lastActiveAt,
            created_at=updated.createdAt,
            updated_at=updated.updatedAt
        )
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_detail = f"{str(e)}\n{traceback.format_exc()}"
        print(f"Error in update_user_profile: {error_detail}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{user_id}/admin/check")
async def check_user_admin(user_id: str):
    """Check if a user has admin privileges"""
    is_admin = await check_admin(user_id)
    return {"is_admin": is_admin}





