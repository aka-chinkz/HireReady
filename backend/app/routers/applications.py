"""
Application management endpoints
"""

from fastapi import APIRouter, HTTPException
from app.models import ApplicationCreate, ApplicationResponse
from app.database import prisma
from typing import List

router = APIRouter()

@router.post("/", response_model=ApplicationResponse)
async def create_application(app_data: ApplicationCreate):
    """Create a new application"""
    try:
        application = await prisma.application.create(
            data={
                "userId": app_data.user_id,
                "companyId": app_data.company_id,
                "roleName": app_data.role_name,
                "preparationStart": app_data.preparation_start,
                "applicationStart": app_data.application_start,
                "applicationEnd": app_data.application_end,
                "interviewStart": app_data.interview_start,
                "interviewEnd": app_data.interview_end,
                "status": "planned"
            }
        )
        
        return ApplicationResponse(
            id=application.id,
            user_id=application.userId,
            company_id=application.companyId,
            role_name=application.roleName,
            preparation_start=application.preparationStart,
            application_start=application.applicationStart,
            application_end=application.applicationEnd,
            interview_start=application.interviewStart,
            interview_end=application.interviewEnd,
            status=application.status,
            created_at=application.createdAt,
            updated_at=application.updatedAt
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/user/{user_id}", response_model=List[ApplicationResponse])
async def get_user_applications(user_id: str):
    """Get all applications for a user"""
    applications = await prisma.application.find_many(
        where={"userId": user_id},
        include={"company": True}
    )
    
    return [
        ApplicationResponse(
            id=app.id,
            user_id=app.userId,
            company_id=app.companyId,
            role_name=app.roleName,
            preparation_start=app.preparationStart,
            application_start=app.applicationStart,
            application_end=app.applicationEnd,
            interview_start=app.interviewStart,
            interview_end=app.interviewEnd,
            status=app.status,
            created_at=app.createdAt,
            updated_at=app.updatedAt
        )
        for app in applications
    ]

@router.put("/{application_id}/status")
async def update_application_status(application_id: str, status: str):
    """Update application status"""
    valid_statuses = ["planned", "applied", "interview", "rejected", "offer"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Status must be one of {valid_statuses}")
    
    application = await prisma.application.find_unique(where={"id": application_id})
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    updated = await prisma.application.update(
        where={"id": application_id},
        data={"status": status}
    )
    
    return {"id": updated.id, "status": updated.status}





