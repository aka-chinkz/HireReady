"""
Feedback collection endpoints
"""

from fastapi import APIRouter, HTTPException
from app.models import FeedbackCreate, FeedbackResponse
from app.database import prisma
from typing import List
import re
from html import escape

router = APIRouter()

# Constants for validation
MIN_MESSAGE_LENGTH = 5
MAX_MESSAGE_LENGTH = 5000
MIN_RATING = 1
MAX_RATING = 5
MAX_EMAIL_LENGTH = 255
MAX_PAGE_SOURCE_LENGTH = 255

# Email validation regex (basic pattern)
EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')

def sanitize_input(text: str, max_length: int) -> str:
    """
    Sanitize user input to prevent XSS attacks and enforce length limits.
    
    In production, consider using a library like bleach for more robust sanitization:
    from bleach import clean
    return clean(text, tags=[], strip=True)
    """
    if not text:
        return ""
    # Remove any HTML tags and escape special characters
    text = escape(text.strip())
    # Enforce length limit
    if len(text) > max_length:
        text = text[:max_length]
    return text

def validate_email(email: str) -> bool:
    """Validate email format"""
    if not email:
        return True  # Email is optional
    return bool(EMAIL_REGEX.match(email.strip()))

def validate_rating(rating: int) -> bool:
    """Validate rating is within valid range"""
    return MIN_RATING <= rating <= MAX_RATING

@router.post("/", response_model=FeedbackResponse)
async def create_feedback(feedback_data: FeedbackCreate):
    """
    Create a new feedback entry.
    
    Security considerations:
    - Input validation and sanitization
    - Rate limiting should be added (e.g., using slowapi or fastapi-limiter)
    - Consider adding CAPTCHA for production to prevent spam
    - Log suspicious patterns (e.g., repeated submissions)
    
    Rate limiting example:
    from slowapi import Limiter, _rate_limit_exceeded_handler
    from slowapi.util import get_remote_address
    
    limiter = Limiter(key_func=get_remote_address)
    app.state.limiter = limiter
    
    Then add decorator: @limiter.limit("5/minute")
    """
    try:
        # Validate and sanitize message (required)
        if not feedback_data.message or len(feedback_data.message.strip()) < MIN_MESSAGE_LENGTH:
            raise HTTPException(
                status_code=400,
                detail=f"Message is required and must be at least {MIN_MESSAGE_LENGTH} characters long"
            )
        
        sanitized_message = sanitize_input(feedback_data.message, MAX_MESSAGE_LENGTH)
        
        # Validate and sanitize email (optional)
        sanitized_email = None
        if feedback_data.user_email:
            email_trimmed = feedback_data.user_email.strip()
            if not validate_email(email_trimmed):
                raise HTTPException(
                    status_code=400,
                    detail="Invalid email format"
                )
            sanitized_email = sanitize_input(email_trimmed, MAX_EMAIL_LENGTH)
        
        # Validate rating (optional)
        if feedback_data.rating is not None:
            if not validate_rating(feedback_data.rating):
                raise HTTPException(
                    status_code=400,
                    detail=f"Rating must be between {MIN_RATING} and {MAX_RATING}"
                )
        
        # Get page source (optional, can be set by frontend)
        page_source = feedback_data.page_source
        if page_source:
            page_source = sanitize_input(page_source, MAX_PAGE_SOURCE_LENGTH)
        
        # Create feedback in database
        feedback = await prisma.feedback.create(
            data={
                "message": sanitized_message,
                "rating": feedback_data.rating,
                "userEmail": sanitized_email,
                "pageSource": page_source
            }
        )
        
        return FeedbackResponse(
            id=feedback.id,
            message=feedback.message,
            rating=feedback.rating,
            user_email=feedback.userEmail,
            page_source=feedback.pageSource,
            created_at=feedback.createdAt
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions (validation errors)
        raise
    except Exception as e:
        # Log the error in production (use proper logging library)
        # logger.error(f"Error creating feedback: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while saving feedback. Please try again later."
        )

@router.get("/", response_model=List[FeedbackResponse])
async def get_feedback_list(limit: int = 100, offset: int = 0):
    """
    Get list of feedback entries (for admin/internal use).
    
    In production, this should be protected with authentication:
    from fastapi import Depends
    from app.auth import get_current_admin_user
    
    @router.get("/", response_model=List[FeedbackResponse])
    async def get_feedback_list(
        limit: int = 100,
        offset: int = 0,
        current_user: User = Depends(get_current_admin_user)
    ):
    """
    try:
        feedback_list = await prisma.feedback.find_many(
            take=limit,
            skip=offset,
            order={"createdAt": "desc"}
        )
        
        return [
            FeedbackResponse(
                id=fb.id,
                message=fb.message,
                rating=fb.rating,
                user_email=fb.userEmail,
                page_source=fb.pageSource,
                created_at=fb.createdAt
            )
            for fb in feedback_list
        ]
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="An error occurred while fetching feedback"
        )

@router.get("/{feedback_id}", response_model=FeedbackResponse)
async def get_feedback(feedback_id: str):
    """
    Get a specific feedback entry by ID (for admin/internal use).
    
    In production, this should be protected with authentication.
    """
    try:
        feedback = await prisma.feedback.find_unique(
            where={"id": feedback_id}
        )
        
        if not feedback:
            raise HTTPException(
                status_code=404,
                detail="Feedback not found"
            )
        
        return FeedbackResponse(
            id=feedback.id,
            message=feedback.message,
            rating=feedback.rating,
            user_email=feedback.userEmail,
            page_source=feedback.pageSource,
            created_at=feedback.createdAt
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="An error occurred while fetching feedback"
        )