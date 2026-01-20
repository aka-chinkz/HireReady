"""
CareerPath Planner - FastAPI Backend
Main application entry point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

from app.routers import users, companies, applications, calendar, intelligence, internship_postings, feedback, auth, practice, ats, ranking, friends
from app.database import connect_db, disconnect_db

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Startup
    print("🚀 CareerPath Planner API starting...")
    await connect_db()
    yield
    # Shutdown
    await disconnect_db()
    print("👋 CareerPath Planner API shutting down...")

app = FastAPI(
    title="CareerPath Planner API",
    description="Career planning platform for university students",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
# Get allowed origins from environment variable or use defaults
allowed_origins_str = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000"
)

# Split and strip whitespace from origins
allowed_origins = [origin.strip() for origin in allowed_origins_str.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",  # Allow all Vercel URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(companies.router, prefix="/api/companies", tags=["companies"])
app.include_router(applications.router, prefix="/api/applications", tags=["applications"])
app.include_router(calendar.router, prefix="/api/calendar", tags=["calendar"])
app.include_router(intelligence.router, prefix="/api/intelligence", tags=["intelligence"])
app.include_router(internship_postings.router, prefix="/api/internship-postings", tags=["internship-postings"])
app.include_router(feedback.router, prefix="/api/feedback", tags=["feedback"])
app.include_router(practice.router, prefix="/api/practice", tags=["practice"])
app.include_router(ats.router, prefix="/api/ats", tags=["ats"])
app.include_router(ranking.router, prefix="/api/ranking", tags=["ranking"])
app.include_router(friends.router, prefix="/api/friends", tags=["friends"])

@app.get("/")
async def root():
    return {
        "message": "CareerPath Planner API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}

