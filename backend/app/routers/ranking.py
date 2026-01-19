"""
Ranking/Leaderboard endpoints
Implements global and friends rankings with dense ranking logic
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
from app.database import prisma

router = APIRouter()

class RankingUser(BaseModel):
    id: str
    username: str
    avatar_url: Optional[str] = None
    total_solved: int
    easy_solved: int
    medium_solved: int
    hard_solved: int
    last_solved_at: Optional[datetime] = None
    rank: int
    email: Optional[str] = None

class RankingResponse(BaseModel):
    users: List[RankingUser]
    total_count: int
    page: int
    page_size: int
    current_user_rank: Optional[int] = None

def compare_users(a: Dict[str, Any], b: Dict[str, Any]) -> int:
    """
    Compare users for ranking
    Primary: total_solved (descending)
    Tie-breaker #1: hard_solved (descending)
    Tie-breaker #2: medium_solved (descending)
    Tie-breaker #3: last_solved_at (most recent first)
    Final fallback: email/username (alphabetical)
    """
    # Primary: total solved
    if b['total_solved'] != a['total_solved']:
        return b['total_solved'] - a['total_solved']
    
    # Tie-breaker #1: hard solved
    if b['hard_solved'] != a['hard_solved']:
        return b['hard_solved'] - a['hard_solved']
    
    # Tie-breaker #2: medium solved
    if b['medium_solved'] != a['medium_solved']:
        return b['medium_solved'] - a['medium_solved']
    
    # Tie-breaker #3: last solved date (most recent first)
    a_date = a.get('last_solved_at') or datetime.min
    b_date = b.get('last_solved_at') or datetime.min
    
    if isinstance(a_date, str):
        try:
            a_date = datetime.fromisoformat(a_date.replace('Z', '+00:00'))
        except:
            a_date = datetime.min
    if isinstance(b_date, str):
        try:
            b_date = datetime.fromisoformat(b_date.replace('Z', '+00:00'))
        except:
            b_date = datetime.min
    
    if b_date != a_date:
        return 1 if b_date > a_date else -1
    
    # Final fallback: email/username (alphabetical)
    a_email = (a.get('email') or a.get('username', '')).lower()
    b_email = (b.get('email') or b.get('username', '')).lower()
    return (a_email > b_email) - (a_email < b_email)

def assign_dense_ranks(sorted_users: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Assign dense ranks to sorted users
    Users with same scores get the same rank
    Next rank increases by 1 (not skipped)
    """
    if not sorted_users:
        return []
    
    ranked_users = []
    current_rank = 1
    
    for i, user in enumerate(sorted_users):
        if i > 0:
            prev_user = sorted_users[i - 1]
            # Check if this user is different from previous (not tied)
            if (prev_user['total_solved'] != user['total_solved'] or
                prev_user['hard_solved'] != user['hard_solved'] or
                prev_user['medium_solved'] != user['medium_solved']):
                current_rank = i + 1
        
        user['rank'] = current_rank
        ranked_users.append(user)
    
    return ranked_users

def get_problem_difficulty(problem_id: int) -> str:
    """
    Map problem ID to difficulty
    Based on frontend problems.ts structure:
    - IDs 1-90: Easy
    - IDs 91-180: Medium
    - IDs 181+: Hard
    """
    if problem_id <= 90:
        return 'Easy'
    elif problem_id <= 180:
        return 'Medium'
    else:
        return 'Hard'

async def get_user_stats(user_id: str) -> Dict[str, Any]:
    """Get solved statistics for a user"""
    # Get all progress for this user
    progress_list = await prisma.userproblemprogress.find_many(
        where={"userId": user_id, "isSolved": True}
    )
    
    if not progress_list:
        return {
            'total_solved': 0,
            'easy_solved': 0,
            'medium_solved': 0,
            'hard_solved': 0,
            'last_solved_at': None
        }
    
    easy_count = 0
    medium_count = 0
    hard_count = 0
    last_solved = None
    
    solved_dates = []
    
    for progress in progress_list:
        difficulty = get_problem_difficulty(progress.problemId)
        if difficulty == 'Easy':
            easy_count += 1
        elif difficulty == 'Medium':
            medium_count += 1
        else:
            hard_count += 1
        
        if progress.solvedAt:
            solved_dates.append(progress.solvedAt)
    
    if solved_dates:
        last_solved = max(solved_dates)
    
    return {
        'total_solved': len(progress_list),
        'easy_solved': easy_count,
        'medium_solved': medium_count,
        'hard_solved': hard_count,
        'last_solved_at': last_solved
    }

@router.get("/global", response_model=RankingResponse)
async def get_global_ranking(
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(50, ge=1, le=100, description="Number of users per page"),
    current_user_id: Optional[str] = Query(None, description="Current user ID to highlight")
):
    """
    Get global leaderboard rankings
    Returns paginated list of users ranked by total solved problems
    """
    try:
        # Get all users
        all_users = await prisma.user.find_many()
        print(f"DEBUG: Found {len(all_users)} users in database")
        
        # Calculate stats for each user
        users_with_stats = []
        for user in all_users:
            try:
                stats = await get_user_stats(user.id)
                
                # Get username from database field, fallback to email or ID
                try:
                    username = user.username
                except AttributeError:
                    username = None
                
                # Fallback: use email prefix if username not set, or user ID
                if not username:
                    if user.email:
                        username = user.email.split('@')[0]
                    else:
                        username = f"user_{user.id[:8]}"
                
                users_with_stats.append({
                    'id': user.id,
                    'username': username,
                    'email': user.email or None,
                    'avatar_url': user.profilePicture or None,
                    **stats
                })
            except Exception as e:
                print(f"ERROR processing user {user.id}: {e}")
                import traceback
                traceback.print_exc()
                continue
        
        print(f"DEBUG: Processed {len(users_with_stats)} users")
        
        # Keep all users (even with 0 solves) so friends and accounts are visible
        # users_with_stats = [u for u in users_with_stats if u['total_solved'] > 0]
        
        # Sort users using the compare function
        import functools
        sorted_users = sorted(users_with_stats, key=functools.cmp_to_key(compare_users))
        
        # Assign dense ranks
        ranked_users = assign_dense_ranks(sorted_users)
        
        # Find current user's rank
        current_user_rank = None
        if current_user_id:
            current_user = next((u for u in ranked_users if u['id'] == current_user_id), None)
            if current_user:
                current_user_rank = current_user['rank']
        
        # Paginate
        total_count = len(ranked_users)
        print(f"DEBUG: Total ranked users: {total_count}")
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        paginated_users = ranked_users[start_idx:end_idx]
        print(f"DEBUG: Paginated users: {len(paginated_users)} (page {page}, size {page_size})")
        
        # Convert to response models
        ranking_users = [
            RankingUser(
                id=u['id'],
                username=u['username'],
                avatar_url=u['avatar_url'],
                total_solved=u['total_solved'],
                easy_solved=u['easy_solved'],
                medium_solved=u['medium_solved'],
                hard_solved=u['hard_solved'],
                last_solved_at=u['last_solved_at'],
                rank=u['rank'],
                email=u['email']
            )
            for u in paginated_users
        ]
        
        print(f"DEBUG: Returning {len(ranking_users)} users")
        return RankingResponse(
            users=ranking_users,
            total_count=total_count,
            page=page,
            page_size=page_size,
            current_user_rank=current_user_rank
        )
    
    except Exception as e:
        import traceback
        error_detail = f"{str(e)}\n{traceback.format_exc()}"
        print(f"========== ERROR in get_global_ranking ==========")
        print(f"{error_detail}")
        print(f"================================================")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/friends/{user_id}", response_model=RankingResponse)
async def get_friends_ranking(
    user_id: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100)
):
    """
    Get friends leaderboard rankings
    Returns the user's friends ranked by total solved problems
    """
    try:
        # Get current user
        user = await prisma.user.find_unique(where={"id": user_id})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get friends - handle case where friends table might not exist yet
        try:
            # Get all friends for this user
            friends_relations = await prisma.friend.find_many(
                where={"userId": user_id}
            )
        except (AttributeError, Exception) as e:
            # Friend model doesn't exist or table not found - return empty
            error_msg = str(e).lower()
            if "attributeerror" in error_msg or ("relation" in error_msg and "does not exist" in error_msg):
                return RankingResponse(
                    users=[],
                    total_count=0,
                    page=page,
                    page_size=page_size,
                    current_user_rank=None
                )
            raise
        
        # If no friends, return empty list
        if not friends_relations:
            return RankingResponse(
                users=[],
                total_count=0,
                page=page,
                page_size=page_size,
                current_user_rank=None
            )
        
        # Calculate stats for each friend (and include current user)
        users_with_stats = []
        
        # Add current user first
        user_stats = await get_user_stats(user_id)
        # Get username from database field, fallback to email or ID
        try:
            username = user.username
        except AttributeError:
            username = None
        
        # Fallback: use email prefix if username not set, or user ID
        if not username:
            if user.email:
                username = user.email.split('@')[0]
            else:
                username = f"user_{user.id[:8]}"
        
        users_with_stats.append({
            'id': user.id,
            'username': username,
            'email': user.email,
            'avatar_url': user.profilePicture,
            **user_stats
        })
        
        # Add friends
        for relation in friends_relations:
            try:
                friend_user = await prisma.user.find_unique(where={"id": relation.friendId})
                if not friend_user:
                    continue
                
                friend_stats = await get_user_stats(relation.friendId)
                # Get username from database field, fallback to email or ID
                try:
                    friend_username = friend_user.username
                except AttributeError:
                    friend_username = None
                
                # Fallback: use email prefix if username not set, or user ID
                if not friend_username:
                    if friend_user.email:
                        friend_username = friend_user.email.split('@')[0]
                    else:
                        friend_username = f"user_{relation.friendId[:8]}"
                
                users_with_stats.append({
                    'id': friend_user.id,
                    'username': friend_username,
                    'email': friend_user.email,
                    'avatar_url': friend_user.profilePicture,
                    **friend_stats
                })
            except Exception as e:
                print(f"Error processing friend {relation.friendId}: {e}")
                continue
        
        # Sort users using the compare function
        import functools
        sorted_users = sorted(users_with_stats, key=functools.cmp_to_key(compare_users))
        
        # Assign dense ranks
        ranked_users = assign_dense_ranks(sorted_users)
        
        # Find current user's rank
        current_user_rank = None
        current_user = next((u for u in ranked_users if u['id'] == user_id), None)
        if current_user:
            current_user_rank = current_user['rank']
        
        # Paginate
        total_count = len(ranked_users)
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        paginated_users = ranked_users[start_idx:end_idx]
        
        # Convert to response models
        ranking_users = [
            RankingUser(
                id=u['id'],
                username=u['username'],
                avatar_url=u['avatar_url'],
                total_solved=u['total_solved'],
                easy_solved=u['easy_solved'],
                medium_solved=u['medium_solved'],
                hard_solved=u['hard_solved'],
                last_solved_at=u['last_solved_at'],
                rank=u['rank'],
                email=u['email']
            )
            for u in paginated_users
        ]
        
        return RankingResponse(
            users=ranking_users,
            total_count=total_count,
            page=page,
            page_size=page_size,
            current_user_rank=current_user_rank
        )
    
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_detail = f"{str(e)}\n{traceback.format_exc()}"
        print(f"Error in get_friends_ranking: {error_detail}")
        raise HTTPException(status_code=500, detail=str(e))
