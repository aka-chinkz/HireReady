"""
CareerPath Planner - FastAPI Backend
Main application entry point
"""

from fastapi import FastAPI, Request, status, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv
import traceback

from app.routers import users, companies, applications, calendar, intelligence, internship_postings, feedback, auth, practice, ats, ranking, friends
from app.database import connect_db, disconnect_db

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Startup
    print("🚀 CareerPath Planner API starting...")
    try:
        await connect_db()
        print("✅ Database connected successfully")
    except Exception as e:
        print(f"⚠️  Database connection failed: {e}")
        print("⚠️  App will start but database operations may fail")
        # Don't crash the app - allow it to start even if DB fails
        # Routes will handle database errors gracefully
    
    print("✅ CareerPath Planner API is ready!")
    print("✅ All routes registered successfully")
    print("✅ Server is ready to accept requests")
    yield
    # Shutdown
    try:
        await disconnect_db()
        print("✅ Database disconnected")
    except Exception as e:
        print(f"⚠️  Error disconnecting database: {e}")
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

# Add CORS middleware - must be added before routers
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",  # Allow all Vercel URLs
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],  # Explicitly include OPTIONS for preflight
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,  # Cache preflight requests for 1 hour
)

# Add middleware to catch and log all request errors
@app.middleware("http")
async def catch_exceptions_middleware(request: Request, call_next):
    """Catch all exceptions in request handling to prevent crashes"""
    # Log ALL incoming requests (including OPTIONS) for debugging
    print(f"📥 {request.method} {request.url.path} | Origin: {request.headers.get('origin', 'none')}")
    
    try:
        response = await call_next(request)
        # Log response status for all requests
        print(f"📤 {request.method} {request.url.path} -> {response.status_code}")
        return response
    except HTTPException:
        # Let FastAPI handle HTTPException (it's already a proper HTTP response)
        raise
    except Exception as exc:
        print(f"❌ Exception in request handler: {exc}")
        print(f"❌ Path: {request.url.path}")
        print(f"❌ Method: {request.method}")
        print(f"❌ Traceback: {traceback.format_exc()}")
        return JSONResponse(
            status_code=500,
            content={
                "detail": "Internal server error. Please try again later.",
                "error": str(exc) if os.getenv("DEBUG", "false").lower() == "true" else "An error occurred"
            }
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

# Log all registered routes for debugging
print("\n📋 Registered Routes:")
for route in app.routes:
    if hasattr(route, 'methods') and hasattr(route, 'path'):
        methods = ', '.join(route.methods) if route.methods else 'N/A'
        print(f"  {methods:10} {route.path}")
print()

@app.get("/")
async def root():
    return {
        "message": "CareerPath Planner API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health():
    """Health check endpoint - doesn't require database"""
    return {"status": "healthy"}

@app.get("/test-auth-route")
async def test_auth_route():
    """Test endpoint to verify auth routes are accessible"""
    # Check if auth routes are registered
    auth_routes = [r for r in app.routes if hasattr(r, 'path') and '/api/auth' in r.path]
    return {
        "message": "Auth routes check",
        "auth_routes_found": len(auth_routes),
        "routes": [{"path": r.path, "methods": list(r.methods) if hasattr(r, 'methods') else []} for r in auth_routes[:10]]
    }


# Global exception handler to prevent crashes
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catch all unhandled exceptions to prevent app crashes"""
    print(f"❌ Unhandled exception: {exc}")
    print(f"❌ Traceback: {traceback.format_exc()}")
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error. Please try again later.",
            "error": str(exc) if os.getenv("DEBUG", "false").lower() == "true" else "An error occurred"
        }
    )

