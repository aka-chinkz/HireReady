"""
Friends management endpoints
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
from app.database import prisma

router = APIRouter()

class FriendUser(BaseModel):
    id: str
    username: str
    avatar_url: Optional[str] = None
    email: Optional[str] = None
    total_solved: int = 0
    rank: Optional[int] = None

class FriendsListResponse(BaseModel):
    friends: List[FriendUser]
    total_count: int

class FriendCountResponse(BaseModel):
    friends_count: int
    followers_count: int

class AddFriendResponse(BaseModel):
    success: bool
    message: str
    is_friend: bool

@router.post("/add/{user_id}/{friend_id}", response_model=AddFriendResponse)
async def add_friend(user_id: str, friend_id: str):
    """
    Add a friend
    - user_id: The user who is adding the friend
    - friend_id: The user to be added as a friend
    """
    try:
        # Prevent adding yourself as a friend
        if user_id == friend_id:
            raise HTTPException(status_code=400, detail="Cannot add yourself as a friend")
        
        # Check if both users exist
        user = await prisma.user.find_unique(where={"id": user_id})
        friend = await prisma.user.find_unique(where={"id": friend_id})
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        if not friend:
            raise HTTPException(status_code=404, detail="Friend user not found")
        
        # Try to check/create friendship - handle case where friends table might not exist yet
        try:
            # Check if friendship already exists
            existing = await prisma.friend.find_unique(
                where={
                    "userId_friendId": {
                        "userId": user_id,
                        "friendId": friend_id
                    }
                }
            )
            
            if existing:
                return AddFriendResponse(
                    success=True,
                    message="Already friends",
                    is_friend=True
                )
            
            # Create friendship
            await prisma.friend.create(
                data={
                    "userId": user_id,
                    "friendId": friend_id
                }
            )
            
            return AddFriendResponse(
                success=True,
                message="Friend added successfully",
                is_friend=True
            )
        except AttributeError as e:
            # Friend model doesn't exist in Prisma client (migration/regeneration not done)
            raise HTTPException(
                status_code=503, 
                detail="Friends feature is not available yet. Please run: 'prisma generate --schema=prisma/schema.prisma' and then 'prisma migrate dev --name add_friends --schema=prisma/schema.prisma'"
            )
        except Exception as e:
            # Check if it's a table not found error
            error_msg = str(e).lower()
            if "relation" in error_msg and "does not exist" in error_msg or "no attribute 'friend'" in error_msg:
                raise HTTPException(
                    status_code=503,
                    detail="Friends feature requires database migration. Please run: 'prisma migrate dev --name add_friends --schema=prisma/schema.prisma'"
                )
            raise
    
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_detail = f"{str(e)}\n{traceback.format_exc()}"
        print(f"Error in add_friend: {error_detail}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/remove/{user_id}/{friend_id}", response_model=AddFriendResponse)
async def remove_friend(user_id: str, friend_id: str):
    """
    Remove a friend
    - user_id: The user who is removing the friend
    - friend_id: The user to be removed from friends
    """
    try:
        # Try to check/remove friendship - handle case where friends table might not exist yet
        try:
            # Check if friendship exists
            existing = await prisma.friend.find_unique(
                where={
                    "userId_friendId": {
                        "userId": user_id,
                        "friendId": friend_id
                    }
                }
            )
            
            if not existing:
                return AddFriendResponse(
                    success=False,
                    message="Not friends",
                    is_friend=False
                )
            
            # Delete friendship
            await prisma.friend.delete(
                where={
                    "userId_friendId": {
                        "userId": user_id,
                        "friendId": friend_id
                    }
                }
            )
            
            return AddFriendResponse(
                success=True,
                message="Friend removed successfully",
                is_friend=False
            )
        except AttributeError as e:
            # Friend model doesn't exist in Prisma client
            raise HTTPException(
                status_code=503,
                detail="Friends feature is not available yet. Please run database migration."
            )
        except Exception as e:
            # Check if it's a table not found error
            error_msg = str(e).lower()
            if "relation" in error_msg and "does not exist" in error_msg or "no attribute 'friend'" in error_msg:
                raise HTTPException(
                    status_code=503,
                    detail="Friends feature requires database migration."
                )
            raise
    
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_detail = f"{str(e)}\n{traceback.format_exc()}"
        print(f"Error in remove_friend: {error_detail}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/list/{user_id}", response_model=FriendsListResponse)
async def get_friends_list(
    user_id: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100)
):
    """
    Get list of friends for a user
    """
    try:
        # Check if user exists
        user = await prisma.user.find_unique(where={"id": user_id})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get friends - handle case where friends table might not exist yet
        try:
            # Get all friends first (no pagination yet)
            all_friends_relations = await prisma.friend.find_many(
                where={"userId": user_id}
            )
            
            # Sort manually by createdAt descending (Prisma Python doesn't support order_by for Friend model)
            all_friends_relations = sorted(
                all_friends_relations, 
                key=lambda x: x.createdAt if x.createdAt else datetime.min, 
                reverse=True
            )
            
            # Get total count
            total_count = len(all_friends_relations)
            
            # If no friends, return empty list early
            if not all_friends_relations:
                return FriendsListResponse(
                    friends=[],
                    total_count=0
                )
            
            # Apply pagination manually
            start_idx = (page - 1) * page_size
            end_idx = start_idx + page_size
            friends_relations = all_friends_relations[start_idx:end_idx]
        except AttributeError as e:
            # Friend model doesn't exist in Prisma client (migration not run)
            # Return empty list gracefully
            return FriendsListResponse(
                friends=[],
                total_count=0
            )
        except Exception as e:
            # Check if it's a table not found error
            error_msg = str(e).lower()
            if "relation" in error_msg and "does not exist" in error_msg:
                # Table doesn't exist yet - return empty list
                return FriendsListResponse(
                    friends=[],
                    total_count=0
                )
            raise
        
        # Get user stats for each friend
        friends_list = []
        for relation in friends_relations:
            try:
                # Fetch the friend user separately (more reliable than include)
                friend_user = await prisma.user.find_unique(where={"id": relation.friendId})
                if not friend_user:
                    print(f"Friend user {relation.friendId} not found, skipping")
                    continue
                
                # Get stats for this friend (inline function to avoid circular import)
                try:
                    # Import get_problem_difficulty function from ranking (lazy import to avoid circular)
                    from app.routers.ranking import get_problem_difficulty
                    
                    # Get all progress for this user
                    progress_list = await prisma.userproblemprogress.find_many(
                        where={"userId": friend_user.id, "isSolved": True}
                    )
                    
                    if not progress_list:
                        stats = {
                            'total_solved': 0,
                            'easy_solved': 0,
                            'medium_solved': 0,
                            'hard_solved': 0
                        }
                    else:
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
                        
                        stats = {
                            'total_solved': len(progress_list),
                            'easy_solved': easy_count,
                            'medium_solved': medium_count,
                            'hard_solved': hard_count
                        }
                except Exception as stats_error:
                    # Fallback to basic stats if calculation fails
                    import traceback
                    print(f"Error getting stats for friend {friend_user.id}: {stats_error}")
                    print(traceback.format_exc())
                    stats = {'total_solved': 0, 'easy_solved': 0, 'medium_solved': 0, 'hard_solved': 0}
                
                # Get username from email
                username = friend_user.email.split('@')[0] if friend_user.email else f"user_{friend_user.id[:8]}"
                
                # Calculate rank (simplified - would need full ranking calculation for accurate rank)
                # For now, we'll leave rank as None
                friends_list.append(FriendUser(
                    id=friend_user.id,
                    username=username,
                    avatar_url=friend_user.profilePicture,
                    email=friend_user.email,
                    total_solved=stats.get('total_solved', 0),
                    rank=None
                ))
            except Exception as friend_error:
                # Skip this friend if there's an error processing them
                import traceback
                error_detail = f"{str(friend_error)}\n{traceback.format_exc()}"
                print(f"Error processing friend relation: {error_detail}")
                continue
        
        return FriendsListResponse(
            friends=friends_list,
            total_count=total_count
        )
    
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_detail = f"{str(e)}\n{traceback.format_exc()}"
        print(f"Error in get_friends_list: {error_detail}")
        # Return a more detailed error message for debugging
        raise HTTPException(
            status_code=500, 
            detail=f"Error loading friends list: {str(e)}. Check server logs for details."
        )

@router.get("/counts/{user_id}", response_model=FriendCountResponse)
async def get_friend_counts(user_id: str):
    """
    Get friends and followers counts for a user
    """
    try:
        # Check if user exists
        user = await prisma.user.find_unique(where={"id": user_id})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get counts - handle case where friends table might not exist yet
        try:
            friends_count = await prisma.friend.count(where={"userId": user_id})
            followers_count = await prisma.friend.count(where={"friendId": user_id})
        except AttributeError as e:
            # Friend model doesn't exist in Prisma client (migration not run)
            # Return zero counts gracefully
            return FriendCountResponse(
                friends_count=0,
                followers_count=0
            )
        except Exception as e:
            # Check if it's a table not found error
            error_msg = str(e).lower()
            if "relation" in error_msg and "does not exist" in error_msg:
                # Table doesn't exist yet - return zero counts
                return FriendCountResponse(
                    friends_count=0,
                    followers_count=0
                )
            raise
        
        return FriendCountResponse(
            friends_count=friends_count,
            followers_count=followers_count
        )
    
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_detail = f"{str(e)}\n{traceback.format_exc()}"
        print(f"========== ERROR IN get_friend_counts ==========")
        print(f"Error: {str(e)}")
        print(f"Error type: {type(e).__name__}")
        print(f"Full traceback:\n{traceback.format_exc()}")
        print(f"================================================")
        
        # Return zero counts instead of crashing
        return FriendCountResponse(
            friends_count=0,
            followers_count=0
        )

@router.get("/status/{user_id}/{friend_id}")
async def get_friendship_status(user_id: str, friend_id: str):
    """
    Check if user_id has added friend_id as a friend
    Returns: {"is_friend": bool}
    """
    try:
        try:
            existing = await prisma.friend.find_unique(
                where={
                    "userId_friendId": {
                        "userId": user_id,
                        "friendId": friend_id
                    }
                }
            )
        except AttributeError as e:
            # Friend model doesn't exist in Prisma client (migration not run)
            # Return False gracefully
            return {"is_friend": False}
        except Exception as e:
            # Check if it's a table not found error
            error_msg = str(e).lower()
            if "relation" in error_msg and "does not exist" in error_msg:
                # Table doesn't exist yet - return False
                return {"is_friend": False}
            raise
        
        return {"is_friend": existing is not None}
    
    except Exception as e:
        import traceback
        error_detail = f"{str(e)}\n{traceback.format_exc()}"
        print(f"Error in get_friendship_status: {error_detail}")
        # Return False on any error to prevent breaking the UI
        return {"is_friend": False}
