"""
Internship Posting Management Endpoints
For verified, role-specific, location-specific, term-specific internship data
"""

from fastapi import APIRouter, HTTPException
from app.models import InternshipPostingCreate, InternshipPostingResponse
from app.database import prisma
from datetime import datetime
from typing import List, Optional

router = APIRouter()

@router.post("/", response_model=InternshipPostingResponse)
async def create_internship_posting(posting_data: InternshipPostingCreate):
    """Create a new verified internship posting"""
    # Verify company exists
    company = await prisma.company.find_unique(where={"id": posting_data.company_id})
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    # Verify role exists if role_id provided
    if posting_data.role_id:
        role = await prisma.role.find_unique(where={"id": posting_data.role_id})
        if not role:
            raise HTTPException(status_code=404, detail="Role not found")
    
    # Check for duplicate
    existing = await prisma.internshipposting.find_first(
        where={
            "companyId": posting_data.company_id,
            "roleName": posting_data.role_name,
            "location": posting_data.location,
            "term": posting_data.term
        }
    )
    if existing:
        raise HTTPException(status_code=400, detail="Internship posting already exists")
    
    # Create posting
    posting = await prisma.internshipposting.create(
        data={
            "companyId": posting_data.company_id,
            "roleId": posting_data.role_id,
            "roleName": posting_data.role_name,
            "location": posting_data.location,
            "term": posting_data.term,
            "applicationStatus": posting_data.application_status,
            "applicationStart": posting_data.application_start,
            "applicationEnd": posting_data.application_end,
            "deadline": posting_data.deadline,
            "isVerified": posting_data.is_verified,
            "lastVerifiedDate": datetime.now() if posting_data.is_verified else None,
            "sourceUrl": posting_data.source_url,
            "verificationNotes": posting_data.verification_notes
        }
    )
    
    return InternshipPostingResponse(
        id=posting.id,
        company_id=posting.companyId,
        company_name=company.name,
        role_id=posting.roleId,
        role_name=posting.roleName,
        location=posting.location,
        term=posting.term,
        application_status=posting.applicationStatus,
        application_start=posting.applicationStart,
        application_end=posting.applicationEnd,
        deadline=posting.deadline,
        is_verified=posting.isVerified,
        last_verified_date=posting.lastVerifiedDate,
        source_url=posting.sourceUrl,
        verification_notes=posting.verificationNotes,
        created_at=posting.createdAt,
        updated_at=posting.updatedAt
    )

@router.get("/", response_model=List[InternshipPostingResponse])
async def get_internship_postings(
    company_id: Optional[str] = None,
    role_id: Optional[str] = None,
    location: Optional[str] = None,
    term: Optional[str] = None,
    application_status: Optional[str] = None,
    verified_only: bool = False
):
    """Get internship postings with filters"""
    where_clause = {}
    if company_id:
        where_clause["companyId"] = company_id
    if role_id:
        where_clause["roleId"] = role_id
    if location:
        where_clause["location"] = location
    if term:
        where_clause["term"] = term
    if application_status:
        where_clause["applicationStatus"] = application_status
    if verified_only:
        where_clause["isVerified"] = True
    
    postings = await prisma.internshipposting.find_many(
        where=where_clause,
        include={"company": True, "role": True},
        order_by={"updatedAt": "desc"}
    )
    
    return [
        InternshipPostingResponse(
            id=p.id,
            company_id=p.companyId,
            company_name=p.company.name,
            role_id=p.roleId,
            role_name=p.roleName,
            location=p.location,
            term=p.term,
            application_status=p.applicationStatus,
            application_start=p.applicationStart,
            application_end=p.applicationEnd,
            deadline=p.deadline,
            is_verified=p.isVerified,
            last_verified_date=p.lastVerifiedDate,
            source_url=p.sourceUrl,
            verification_notes=p.verificationNotes,
            created_at=p.createdAt,
            updated_at=p.updatedAt
        )
        for p in postings
    ]

@router.get("/{posting_id}", response_model=InternshipPostingResponse)
async def get_internship_posting(posting_id: str):
    """Get a specific internship posting"""
    posting = await prisma.internshipposting.find_unique(
        where={"id": posting_id},
        include={"company": True, "role": True}
    )
    if not posting:
        raise HTTPException(status_code=404, detail="Internship posting not found")
    
    return InternshipPostingResponse(
        id=posting.id,
        company_id=posting.companyId,
        company_name=posting.company.name,
        role_id=posting.roleId,
        role_name=posting.roleName,
        location=posting.location,
        term=posting.term,
        application_status=posting.applicationStatus,
        application_start=posting.applicationStart,
        application_end=posting.applicationEnd,
        deadline=posting.deadline,
        is_verified=posting.isVerified,
        last_verified_date=posting.lastVerifiedDate,
        source_url=posting.sourceUrl,
        verification_notes=posting.verificationNotes,
        created_at=posting.createdAt,
        updated_at=posting.updatedAt
    )

@router.put("/{posting_id}", response_model=InternshipPostingResponse)
async def update_internship_posting(
    posting_id: str,
    posting_data: InternshipPostingCreate
):
    """Update an internship posting"""
    posting = await prisma.internshipposting.find_unique(where={"id": posting_id})
    if not posting:
        raise HTTPException(status_code=404, detail="Internship posting not found")
    
    company = await prisma.company.find_unique(where={"id": posting_data.company_id})
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    # Update last verified date if verification status changed
    update_data = {
        "companyId": posting_data.company_id,
        "roleId": posting_data.role_id,
        "roleName": posting_data.role_name,
        "location": posting_data.location,
        "term": posting_data.term,
        "applicationStatus": posting_data.application_status,
        "applicationStart": posting_data.application_start,
        "applicationEnd": posting_data.application_end,
        "deadline": posting_data.deadline,
        "isVerified": posting_data.is_verified,
        "sourceUrl": posting_data.source_url,
        "verificationNotes": posting_data.verification_notes
    }
    
    if posting_data.is_verified and not posting.isVerified:
        update_data["lastVerifiedDate"] = datetime.now()
    elif posting_data.is_verified:
        update_data["lastVerifiedDate"] = posting.lastVerifiedDate or datetime.now()
    
    updated = await prisma.internshipposting.update(
        where={"id": posting_id},
        data=update_data
    )
    
    return InternshipPostingResponse(
        id=updated.id,
        company_id=updated.companyId,
        company_name=company.name,
        role_id=updated.roleId,
        role_name=updated.roleName,
        location=updated.location,
        term=updated.term,
        application_status=updated.applicationStatus,
        application_start=updated.applicationStart,
        application_end=updated.applicationEnd,
        deadline=updated.deadline,
        is_verified=updated.isVerified,
        last_verified_date=updated.lastVerifiedDate,
        source_url=updated.sourceUrl,
        verification_notes=updated.verificationNotes,
        created_at=updated.createdAt,
        updated_at=updated.updatedAt
    )

@router.delete("/{posting_id}")
async def delete_internship_posting(posting_id: str):
    """Delete an internship posting"""
    posting = await prisma.internshipposting.find_unique(where={"id": posting_id})
    if not posting:
        raise HTTPException(status_code=404, detail="Internship posting not found")
    
    await prisma.internshipposting.delete(where={"id": posting_id})
    return {"message": "Internship posting deleted successfully"}

