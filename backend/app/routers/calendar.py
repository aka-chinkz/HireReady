"""
Calendar generation and export endpoints
"""

from fastapi import APIRouter, HTTPException, Response
from app.database import prisma
from app.services.calendar import CalendarGenerator
from app.models import CalendarEvent, CalendarResponse
from datetime import datetime
from typing import List, Optional

router = APIRouter()
calendar_gen = CalendarGenerator()

@router.get("/user/{user_id}", response_model=CalendarResponse)
async def get_user_calendar(
    user_id: str,
    month: Optional[int] = None,
    year: Optional[int] = None
):
    """Get calendar events for a user"""
    user = await prisma.user.find_unique(where={"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get all applications for user
    applications = await prisma.application.find_many(
        where={"userId": user_id},
        include={"company": True}
    )
    
    # Convert to dict format for calendar generator
    app_dicts = []
    for app in applications:
        app_dicts.append({
            "id": app.id,
            "company_name": app.company.name,
            "tier": app.company.tier,
            "role_name": app.roleName,
            "preparation_start": app.preparationStart,
            "preparation_end": app.preparationStart,  # Will be calculated
            "application_start": app.applicationStart,
            "application_end": app.applicationEnd,
            "interview_start": app.interviewStart,
            "interview_end": app.interviewEnd,
            "status": app.status
        })
    
    # Set date range
    if month and year:
        start_date = datetime(year, month, 1)
        end_date = datetime(year, month + 1, 1) if month < 12 else datetime(year + 1, 1, 1)
    else:
        start_date = datetime.now()
        end_date = datetime.now().replace(year=datetime.now().year + 1)
    
    events = calendar_gen.generate_calendar_events(app_dicts, start_date, end_date)
    
    return CalendarResponse(
        events=[
            CalendarEvent(
                id=e["id"],
                title=e["title"],
                company=e["company"],
                tier=e["tier"],
                start=e["start"],
                end=e["end"],
                phase=e["phase"],
                status=e["status"]
            )
            for e in events
        ],
        month=month or datetime.now().month,
        year=year or datetime.now().year
    )

@router.get("/user/{user_id}/export/ics")
async def export_calendar_ics(user_id: str):
    """Export user calendar as iCalendar file"""
    user = await prisma.user.find_unique(where={"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    applications = await prisma.application.find_many(
        where={"userId": user_id},
        include={"company": True}
    )
    
    app_dicts = []
    for app in applications:
        app_dicts.append({
            "id": app.id,
            "company_name": app.company.name,
            "tier": app.company.tier,
            "role_name": app.roleName,
            "preparation_start": app.preparationStart,
            "preparation_end": app.preparationStart,
            "application_start": app.applicationStart,
            "application_end": app.applicationEnd,
            "interview_start": app.interviewStart,
            "interview_end": app.interviewEnd,
            "status": app.status
        })
    
    events = calendar_gen.generate_calendar_events(app_dicts)
    ics_content = calendar_gen.export_to_ics(events)
    
    return Response(
        content=ics_content,
        media_type="text/calendar",
        headers={
            "Content-Disposition": f'attachment; filename="career_calendar_{user_id}.ics"'
        }
    )





