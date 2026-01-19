"""
Seed script for sample data
Run with: python -m prisma.seed or python prisma/seed.py from backend directory
"""

import asyncio
import sys
import os

# Add backend directory to path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, backend_dir)

from prisma import Prisma

prisma = Prisma()

async def main():
    await prisma.connect()
    
    print("🌱 Seeding database...")
    
    # Clear existing data
    await prisma.application.delete_many()
    await prisma.role.delete_many()
    await prisma.company.delete_many()
    
    # Tier 1 Companies (FAANG)
    tier1_companies = [
        {
            "name": "Google",
            "tier": 1,
            "description": "Tech giant focusing on search, cloud, and AI",
            "website": "https://careers.google.com",
            "internshipOpenMonth": "August",
            "fulltimeOpenMonth": "September"
        },
        {
            "name": "Meta (Facebook)",
            "tier": 1,
            "description": "Social media and VR/AR technology",
            "website": "https://www.metacareers.com",
            "internshipOpenMonth": "August",
            "fulltimeOpenMonth": "September"
        },
        {
            "name": "Amazon",
            "tier": 1,
            "description": "E-commerce and cloud computing leader",
            "website": "https://www.amazon.jobs",
            "internshipOpenMonth": "September",
            "fulltimeOpenMonth": "October"
        },
        {
            "name": "Apple",
            "tier": 1,
            "description": "Consumer electronics and software",
            "website": "https://www.apple.com/careers",
            "internshipOpenMonth": "August",
            "fulltimeOpenMonth": "September"
        },
        {
            "name": "Microsoft",
            "tier": 1,
            "description": "Software, cloud, and enterprise solutions",
            "website": "https://careers.microsoft.com",
            "internshipOpenMonth": "September",
            "fulltimeOpenMonth": "October"
        },
        {
            "name": "Netflix",
            "tier": 1,
            "description": "Streaming entertainment platform",
            "website": "https://jobs.netflix.com",
            "internshipOpenMonth": "August",
            "fulltimeOpenMonth": "September"
        }
    ]
    
    # Tier 2 Companies (Unicorns)
    tier2_companies = [
        {
            "name": "Stripe",
            "tier": 2,
            "description": "Payment processing platform",
            "website": "https://stripe.com/jobs",
            "internshipOpenMonth": "September",
            "fulltimeOpenMonth": "October"
        },
        {
            "name": "Airbnb",
            "tier": 2,
            "description": "Hospitality and travel platform",
            "website": "https://careers.airbnb.com",
            "internshipOpenMonth": "September",
            "fulltimeOpenMonth": "October"
        },
        {
            "name": "Uber",
            "tier": 2,
            "description": "Ridesharing and mobility platform",
            "website": "https://www.uber.com/careers",
            "internshipOpenMonth": "September",
            "fulltimeOpenMonth": "October"
        },
        {
            "name": "Databricks",
            "tier": 2,
            "description": "Data and AI platform",
            "website": "https://www.databricks.com/company/careers",
            "internshipOpenMonth": "September",
            "fulltimeOpenMonth": "October"
        },
        {
            "name": "Snowflake",
            "tier": 2,
            "description": "Cloud data platform",
            "website": "https://careers.snowflake.com",
            "internshipOpenMonth": "September",
            "fulltimeOpenMonth": "October"
        }
    ]
    
    # Tier 3 Companies (Mid-size)
    tier3_companies = [
        {
            "name": "Shopify",
            "tier": 3,
            "description": "E-commerce platform",
            "website": "https://www.shopify.com/careers",
            "internshipOpenMonth": "October",
            "fulltimeOpenMonth": "November"
        },
        {
            "name": "Twilio",
            "tier": 3,
            "description": "Cloud communications platform",
            "website": "https://www.twilio.com/company/jobs",
            "internshipOpenMonth": "October",
            "fulltimeOpenMonth": "November"
        },
        {
            "name": "MongoDB",
            "tier": 3,
            "description": "Database and developer data platform",
            "website": "https://www.mongodb.com/careers",
            "internshipOpenMonth": "October",
            "fulltimeOpenMonth": "November"
        },
        {
            "name": "Atlassian",
            "tier": 3,
            "description": "Team collaboration software",
            "website": "https://www.atlassian.com/company/careers",
            "internshipOpenMonth": "October",
            "fulltimeOpenMonth": "November"
        }
    ]
    
    all_companies = tier1_companies + tier2_companies + tier3_companies
    
    # Create companies and roles
    for company_data in all_companies:
        company = await prisma.company.create(data=company_data)
        
        # Create roles based on company tier
        roles_data = []
        
        if company.tier == 1:
            # Tier 1 roles
            roles_data = [
                {
                    "name": "Software Engineer",
                    "requiredSkills": ["DSA", "OOP", "System Design", "Python", "Java", "JavaScript"],
                    "minYear": 3,
                    "isInternship": True,
                    "isFulltime": True,
                    "description": "Full-stack software engineering role"
                },
                {
                    "name": "Data Scientist",
                    "requiredSkills": ["Python", "Machine Learning", "Statistics", "SQL", "Pandas"],
                    "minYear": 3,
                    "isInternship": True,
                    "isFulltime": True,
                    "description": "Data science and ML role"
                },
                {
                    "name": "Product Manager",
                    "requiredSkills": ["Product Strategy", "Analytics", "Communication", "SQL"],
                    "minYear": 2,
                    "isInternship": True,
                    "isFulltime": True,
                    "description": "Product management role"
                }
            ]
        elif company.tier == 2:
            # Tier 2 roles
            roles_data = [
                {
                    "name": "Software Engineer",
                    "requiredSkills": ["DSA", "OOP", "Python", "JavaScript", "React"],
                    "minYear": 2,
                    "isInternship": True,
                    "isFulltime": True,
                    "description": "Software engineering role"
                },
                {
                    "name": "Data Engineer",
                    "requiredSkills": ["Python", "SQL", "ETL", "AWS", "Docker"],
                    "minYear": 2,
                    "isInternship": True,
                    "isFulltime": True,
                    "description": "Data engineering role"
                }
            ]
        else:
            # Tier 3 roles
            roles_data = [
                {
                    "name": "Software Engineer",
                    "requiredSkills": ["DSA", "OOP", "Python", "JavaScript"],
                    "minYear": 1,
                    "isInternship": True,
                    "isFulltime": True,
                    "description": "Software engineering role"
                },
                {
                    "name": "Frontend Engineer",
                    "requiredSkills": ["JavaScript", "React", "TypeScript", "CSS"],
                    "minYear": 1,
                    "isInternship": True,
                    "isFulltime": True,
                    "description": "Frontend development role"
                }
            ]
        
        for role_data in roles_data:
            await prisma.role.create(
                data={
                    **role_data,
                    "companyId": company.id
                }
            )
    
    print(f"✅ Created {len(all_companies)} companies with roles")
    await prisma.disconnect()

if __name__ == "__main__":
    asyncio.run(main())

