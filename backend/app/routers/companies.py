"""
Company management endpoints
"""

from fastapi import APIRouter, HTTPException
from app.models import CompanyResponse
from app.database import prisma
from app.services.calendar import CalendarGenerator
from datetime import datetime
from typing import List, Optional

router = APIRouter()
calendar_gen = CalendarGenerator()

@router.get("/", response_model=List[CompanyResponse])
async def get_companies(tier: Optional[int] = None):
    """Get all companies, optionally filtered by tier"""
    if tier:
        companies = await prisma.company.find_many(
            where={"tier": tier},
            include={"roles": True}
        )
    else:
        companies = await prisma.company.find_many(include={"roles": True})
    
    return [
        CompanyResponse(
            id=c.id,
            name=c.name,
            tier=c.tier,
            description=c.description,
            website=c.website,
            logo_url=c.logoUrl,
            internship_open_month=c.internshipOpenMonth,
            fulltime_open_month=c.fulltimeOpenMonth
        )
        for c in companies
    ]

@router.get("/with-windows/", response_model=List[dict])
async def get_companies_with_windows(tier: Optional[int] = None):
    """Get companies with verified internship postings or calculated application windows"""
    if tier:
        companies = await prisma.company.find_many(
            where={"tier": tier},
            include={"roles": True, "internshipPostings": True}
        )
    else:
        companies = await prisma.company.find_many(
            include={"roles": True, "internshipPostings": True}
        )
    
    current_year = datetime.now().year
    result = []
    
    for company in companies:
        company_data = {
            "id": company.id,
            "name": company.name,
            "tier": company.tier,
            "description": company.description,
            "website": company.website,
            "logo_url": company.logoUrl,
            "internship_open_month": company.internshipOpenMonth,
            "fulltime_open_month": company.fulltimeOpenMonth,
            "internship_application_start": None,
            "internship_application_end": None,
            "internship_deadline": None,
            "verified_postings": [],
            "has_verified_data": False,
        }
        
        # Check for verified internship postings (prioritize these)
        verified_postings = [
            p for p in company.internshipPostings 
            if p.isVerified and p.applicationStatus == "Open"
        ]
        
        if verified_postings:
            # Use verified data
            company_data["has_verified_data"] = True
            company_data["verified_postings"] = [
                {
                    "id": p.id,
                    "role_name": p.roleName,
                    "location": p.location,
                    "term": p.term,
                    "application_status": p.applicationStatus,
                    "application_start": p.applicationStart.isoformat() if p.applicationStart else None,
                    "application_end": p.applicationEnd.isoformat() if p.applicationEnd else None,
                    "deadline": p.deadline,
                    "source_url": p.sourceUrl,
                    "last_verified_date": p.lastVerifiedDate.isoformat() if p.lastVerifiedDate else None,
                }
                for p in verified_postings
            ]
        elif company.internshipOpenMonth:
            # Fallback to calculated window (estimated, not verified)
            try:
                app_start, app_end = calendar_gen.get_application_window(
                    company.internshipOpenMonth,
                    current_year,
                    is_internship=True
                )
                company_data["internship_application_start"] = app_start.isoformat()
                company_data["internship_application_end"] = app_end.isoformat()
                company_data["internship_deadline"] = app_end.isoformat()
            except Exception as e:
                print(f"Error calculating window for {company.name}: {e}")
        
        result.append(company_data)
    
    return result

@router.get("/{company_id}", response_model=CompanyResponse)
async def get_company(company_id: str):
    """Get company by ID"""
    company = await prisma.company.find_unique(
        where={"id": company_id},
        include={"roles": True}
    )
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    return CompanyResponse(
        id=company.id,
        name=company.name,
        tier=company.tier,
        description=company.description,
        website=company.website,
        logo_url=company.logoUrl,
        internship_open_month=company.internshipOpenMonth,
        fulltime_open_month=company.fulltimeOpenMonth
    )





