# Setup Database for Google Login

## The Problem

The backend needs a `DATABASE_URL` to connect to a PostgreSQL database. Without it, Google login cannot work.

## Quick Solution: Use Free Cloud PostgreSQL

The easiest way is to use a free cloud PostgreSQL database. Here are free options:

### Option 1: Neon (Recommended - Easiest)

1. Go to: https://neon.tech
2. Sign up (free)
3. Create a new project
4. Copy the connection string (looks like: `postgresql://user:pass@host/dbname`)
5. Add to `backend/.env`:
   ```
   DATABASE_URL="postgresql://user:pass@host/dbname"
   ```

### Option 2: Supabase (Also Free)

1. Go to: https://supabase.com
2. Sign up (free)
3. Create a new project
4. Go to Settings → Database
5. Copy the connection string
6. Add to `backend/.env`

### Option 3: Railway (Free Tier)

1. Go to: https://railway.app
2. Sign up (free)
3. Create PostgreSQL database
4. Copy connection string
5. Add to `backend/.env`

## After Getting DATABASE_URL

1. **Add to backend/.env:**
   ```
   DATABASE_URL="your-connection-string-here"
   GOOGLE_CLIENT_ID=1093221971662-321cmip64r5bjlvh42hhjtmog1pprkv9.apps.googleusercontent.com
   ```

2. **Run migrations:**
   ```powershell
   cd backend
   .\venv\Scripts\Activate.ps1
   python -m prisma migrate dev --name init --schema=prisma/schema.prisma
   ```

3. **Start backend:**
   ```powershell
   python -m uvicorn main:app --reload
   ```

4. **Test Google login!**

## Quick Start Command

After adding DATABASE_URL to `.env`:

```powershell
cd backend
.\venv\Scripts\Activate.ps1
python -m prisma migrate dev --name init --schema=prisma/schema.prisma
python -m uvicorn main:app --reload
```

Then refresh browser and try Google login!