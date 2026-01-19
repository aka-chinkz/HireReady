# Quick Fix: Backend Setup Required

## The Problem
The frontend is trying to connect to the backend API at `http://localhost:8000`, but the backend server is not running. This is why you're seeing "Failed to create profile."

## Quick Solution (If you have PostgreSQL installed)

### Step 1: Set up Backend Environment

```powershell
# Navigate to backend
cd "C:\Users\mayan\Desktop\career calender\backend"

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt
pip install prisma

# Create .env file
Copy-Item .env.example .env
```

### Step 2: Configure Database

Edit `backend\.env` and set your DATABASE_URL:
```
DATABASE_URL="postgresql://username:password@localhost:5432/career_planner"
```

### Step 3: Set up Database

```powershell
# Generate Prisma client
prisma generate --schema=prisma/schema.prisma

# Run migrations
prisma migrate dev --schema=prisma/schema.prisma --name init

# Seed database
python prisma/seed.py
```

### Step 4: Start Backend Server

```powershell
uvicorn main:app --reload
```

The backend should now be running on http://localhost:8000

## Alternative: Use Mock Data (For Testing Frontend Only)

If you just want to test the frontend UI without setting up the full backend, I can create a mock API layer. Let me know!




