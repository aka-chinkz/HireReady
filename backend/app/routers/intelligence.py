"""
Career intelligence endpoints
"""

from fastapi import APIRouter, HTTPException
from app.database import prisma
from app.services.intelligence import CareerIntelligence
from app.models import ReadinessAnalysis, SkillGap
from typing import List

router = APIRouter()
intelligence = CareerIntelligence()

@router.get("/user/{user_id}/readiness", response_model=ReadinessAnalysis)
async def get_readiness_analysis(user_id: str):
    """Get comprehensive readiness analysis for a user"""
    user = await prisma.user.find_unique(where={"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get all roles from target companies
    companies = await prisma.company.find_many(
        where={"tier": {"in": user.targetTiers}},
        include={"roles": True}
    )
    
    # Filter roles by year
    all_roles = []
    for company in companies:
        for role in company.roles:
            all_roles.append({
                "id": role.id,
                "name": role.name,
                "required_skills": role.requiredSkills,
                "min_year": role.minYear,
                "is_internship": role.isInternship,
                "company_name": company.name
            })
    
    filtered_roles = intelligence.filter_by_year(user.universityYear, all_roles)
    
    # Calculate average readiness score
    if filtered_roles:
        scores = []
        for role in filtered_roles:
            score = intelligence.calculate_readiness_score(
                user.skills,
                role["required_skills"],
                user.universityYear,
                role["min_year"]
            )
            scores.append(score)
        
        # Calculate weighted average (could also use median or other methods)
        if scores:
            avg_score = sum(scores) / len(scores)
            # Round to 2 decimal places
            avg_score = round(avg_score, 2)
        else:
            avg_score = 0.0
    else:
        avg_score = 0.0
    
    # Identify skill gaps (from all required skills)
    all_required_skills = set()
    for role in filtered_roles:
        all_required_skills.update(role["required_skills"])
    
    skill_gaps = intelligence.identify_skill_gaps(user.skills, list(all_required_skills))
    
    # Generate recommendations
    recommendations = intelligence.generate_recommendations(
        user.universityYear,
        avg_score,
        skill_gaps
    )
    
    # Get matched companies
    matched_companies = list(set(role["company_name"] for role in filtered_roles))
    
    # Update user's readiness score
    await prisma.user.update(
        where={"id": user_id},
        data={"readinessScore": avg_score}
    )
    
    return ReadinessAnalysis(
        score=round(avg_score, 2),
        skill_gaps=[
            SkillGap(
                skill=gap["skill"],
                required=gap["required"],
                priority=gap["priority"]
            )
            for gap in skill_gaps[:10]  # Top 10 gaps
        ],
        recommendations=recommendations,
        matched_companies=matched_companies[:20]  # Top 20 companies
    )

@router.post("/generate-applications/{user_id}")
async def generate_applications(user_id: str):
    """Generate application calendar for user based on their profile"""
    from app.services.calendar import CalendarGenerator
    from datetime import datetime
    
    user = await prisma.user.find_unique(where={"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get companies in target tiers
    companies = await prisma.company.find_many(
        where={"tier": {"in": user.targetTiers}},
        include={"roles": True}
    )
    
    # Filter roles by year and career stream
    filtered_roles = []
    for company in companies:
        for role in company.roles:
            if user.universityYear >= role.minYear or (role.isInternship and user.universityYear >= role.minYear - 1):
                filtered_roles.append({
                    "role": role,
                    "company": company
                })
    
    # Generate applications
    calendar_gen = CalendarGenerator()
    current_year = datetime.now().year
    created_apps = []
    
    for item in filtered_roles[:20]:  # Limit to 20 applications
        role = item["role"]
        company = item["company"]
        
        # Determine if internship or fulltime
        is_internship = role.isInternship and user.universityYear < 4
        is_fulltime = role.isFulltime and user.universityYear == 4
        
        if not (is_internship or is_fulltime):
            continue
        
        # Get application window
        open_month = company.internshipOpenMonth if is_internship else company.fulltimeOpenMonth
        if not open_month:
            continue
        
        app_start, app_end = calendar_gen.get_application_window(
            open_month,
            current_year,
            is_internship
        )
        
        # Generate phases
        phases = calendar_gen.generate_phases(app_start, app_end, company.tier)
        
        # Create application
        try:
            app = await prisma.application.create(
                data={
                    "userId": user_id,
                    "companyId": company.id,
                    "roleName": role.name,
                    "preparationStart": phases["preparation_start"],
                    "applicationStart": phases["application_start"],
                    "applicationEnd": phases["application_end"],
                    "interviewStart": phases["interview_start"],
                    "interviewEnd": phases["interview_end"],
                    "status": "planned"
                }
            )
            created_apps.append(app.id)
        except Exception as e:
            print(f"Error creating application: {e}")
            continue
    
    return {
        "message": f"Generated {len(created_apps)} applications",
        "application_ids": created_apps
    }





