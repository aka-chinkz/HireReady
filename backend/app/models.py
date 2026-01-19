"""
Pydantic models for request/response validation
"""

from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# User Models
class UserCreate(BaseModel):
    career_stream: str
    skills: List[str]
    university_year: int
    graduation_year: int
    country: str
    target_tiers: List[int]

class UserResponse(BaseModel):
    id: str
    career_stream: Optional[str]
    skills: List[str]
    university_year: Optional[int]
    graduation_year: Optional[int]
    country: Optional[str]
    target_tiers: List[int]
    readiness_score: Optional[float]
    profile_picture: Optional[str]
    email: Optional[str]
    username: Optional[str]
    last_active_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

# Company Models
class CompanyResponse(BaseModel):
    id: str
    name: str
    tier: int
    description: Optional[str]
    website: Optional[str]
    logo_url: Optional[str]
    internship_open_month: Optional[str]
    fulltime_open_month: Optional[str]

# Role Models
class RoleResponse(BaseModel):
    id: str
    name: str
    company_id: str
    required_skills: List[str]
    min_year: int
    is_internship: bool
    is_fulltime: bool
    description: Optional[str]

# Application Models
class ApplicationCreate(BaseModel):
    user_id: str
    company_id: str
    role_name: str
    preparation_start: datetime
    application_start: datetime
    application_end: datetime
    interview_start: datetime
    interview_end: datetime

class ApplicationResponse(BaseModel):
    id: str
    user_id: str
    company_id: str
    role_name: str
    preparation_start: datetime
    application_start: datetime
    application_end: datetime
    interview_start: datetime
    interview_end: datetime
    status: str
    created_at: datetime
    updated_at: datetime

# Calendar Models
class CalendarEvent(BaseModel):
    id: str
    title: str
    company: str
    tier: int
    start: datetime
    end: datetime
    phase: str  # "preparation", "application", "interview"
    status: str

class CalendarResponse(BaseModel):
    events: List[CalendarEvent]
    month: int
    year: int

# Intelligence Models
class SkillGap(BaseModel):
    skill: str
    required: bool
    priority: str  # "high", "medium", "low"

class ReadinessAnalysis(BaseModel):
    score: float
    skill_gaps: List[SkillGap]
    recommendations: List[str]
    matched_companies: List[str]

# Internship Posting Models
class InternshipPostingCreate(BaseModel):
    company_id: str
    role_id: Optional[str] = None
    role_name: str
    location: Optional[str] = None
    term: Optional[str] = None
    application_status: str  # "Open", "Closed", "Rolling", "Not Yet Open"
    application_start: Optional[datetime] = None
    application_end: Optional[datetime] = None
    deadline: Optional[str] = None  # "Rolling — closes when filled", "No fixed deadline published", or ISO date string
    is_verified: bool = False
    source_url: Optional[str] = None
    verification_notes: Optional[str] = None

class InternshipPostingResponse(BaseModel):
    id: str
    company_id: str
    company_name: str
    role_id: Optional[str]
    role_name: str
    location: Optional[str]
    term: Optional[str]
    application_status: str
    application_start: Optional[datetime]
    application_end: Optional[datetime]
    deadline: Optional[str]
    is_verified: bool
    last_verified_date: Optional[datetime]
    source_url: Optional[str]
    verification_notes: Optional[str]
    created_at: datetime
    updated_at: datetime

# Feedback Models
class FeedbackCreate(BaseModel):
    message: str
    rating: Optional[int] = None  # Optional rating (1-5)
    user_email: Optional[str] = None  # Optional user email
    page_source: Optional[str] = None  # Page or source where feedback was submitted

class FeedbackResponse(BaseModel):
    id: str
    message: str
    rating: Optional[int]
    user_email: Optional[str]
    page_source: Optional[str]
    created_at: datetime





