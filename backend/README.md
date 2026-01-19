# Backend - CareerPath Planner API

## ⚠️ Important: This is a Python Application

**The backend is NOT a Node.js application!**

- ❌ **Don't use:** `npm run dev`
- ✅ **Use:** `uvicorn main:app --reload` (Python command)

## Quick Start

### Option 1: Use Run Scripts (Windows)

```powershell
# Setup (first time only)
.\setup-backend.ps1

# Run backend
.\run-backend.ps1
```

### Option 2: Manual Setup

1. **Create virtual environment:**
   ```bash
   python -m venv venv
   ```

2. **Activate virtual environment:**
   ```bash
   # Windows
   venv\Scripts\activate
   
   # Linux/Mac
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   pip install prisma
   ```

4. **Configure database:**
   - Copy `.env.example` to `.env`
   - Set `DATABASE_URL` in `.env`

5. **Run migrations:**
   ```bash
   prisma generate --schema=prisma/schema.prisma
   prisma migrate dev --schema=prisma/schema.prisma
   python prisma/seed.py
   ```

6. **Start server:**
   ```bash
   uvicorn main:app --reload
   ```

## API Endpoints

- **Health Check:** http://localhost:8000/health
- **API Docs:** http://localhost:8000/docs
- **Base URL:** http://localhost:8000

## Note

If you just want to test the frontend, you don't need the backend! The frontend uses mock data automatically when the backend isn't available.




