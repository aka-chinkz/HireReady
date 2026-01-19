# CareerPath Planner - Complete Setup Guide

This guide will walk you through setting up the CareerPath Planner application from scratch.

## Prerequisites

- **Node.js 18+** and npm
- **Python 3.10+** and pip
- **PostgreSQL 14+**
- **Git** (optional, for cloning)

## Step 1: Database Setup

1. **Install PostgreSQL** (if not already installed)
   - macOS: `brew install postgresql@14`
   - Ubuntu: `sudo apt-get install postgresql-14`
   - Windows: Download from [postgresql.org](https://www.postgresql.org/download/)

2. **Create Database**
   ```bash
   # Start PostgreSQL service
   # macOS/Linux:
   brew services start postgresql@14
   # or
   sudo service postgresql start
   
   # Create database
   createdb career_planner
   
   # Or using psql:
   psql -U postgres
   CREATE DATABASE career_planner;
   \q
   ```

## Step 2: Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Install Prisma**
   ```bash
   pip install prisma
   ```

5. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env and set your DATABASE_URL:
   # DATABASE_URL="postgresql://username:password@localhost:5432/career_planner"
   ```

6. **Generate Prisma Client**
   ```bash
   prisma generate --schema=prisma/schema.prisma
   ```

7. **Run migrations**
   ```bash
   prisma migrate dev --schema=prisma/schema.prisma --name init
   ```

8. **Seed database**
   ```bash
   python prisma/seed.py
   ```

9. **Start backend server**
   ```bash
   uvicorn main:app --reload
   ```
   
   Backend will run on http://localhost:8000
   API docs available at http://localhost:8000/docs

## Step 3: Frontend Setup

1. **Navigate to frontend directory** (in a new terminal)
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local if needed (default should work)
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   
   Frontend will run on http://localhost:3000

## Step 4: Verify Installation

1. **Check Backend Health**
   - Visit http://localhost:8000/health
   - Should return: `{"status":"healthy"}`

2. **Check API Docs**
   - Visit http://localhost:8000/docs
   - Should show Swagger UI

3. **Check Frontend**
   - Visit http://localhost:3000
   - Should show onboarding flow

## Troubleshooting

### Database Connection Issues

- Verify PostgreSQL is running: `pg_isready`
- Check DATABASE_URL format: `postgresql://user:password@host:port/database`
- Ensure database exists: `psql -l | grep career_planner`

### Prisma Issues

- Regenerate client: `prisma generate --schema=prisma/schema.prisma`
- Reset database: `prisma migrate reset --schema=prisma/schema.prisma`
- Check Prisma version: `prisma --version`

### Python Issues

- Ensure Python 3.10+: `python3 --version`
- Reinstall dependencies: `pip install -r requirements.txt --force-reinstall`
- Check virtual environment is activated

### Node.js Issues

- Clear cache: `rm -rf node_modules package-lock.json && npm install`
- Check Node version: `node --version` (should be 18+)

### Port Already in Use

- Backend (8000): Change in `uvicorn main:app --reload --port 8001`
- Frontend (3000): Change in `package.json` scripts or use `PORT=3001 npm run dev`

## Development Workflow

1. **Backend changes**: Server auto-reloads with `--reload` flag
2. **Frontend changes**: Next.js hot-reloads automatically
3. **Database changes**: 
   - Update `prisma/schema.prisma`
   - Run `prisma migrate dev --schema=prisma/schema.prisma`
   - Regenerate client: `prisma generate --schema=prisma/schema.prisma`

## Production Deployment

### Backend
- Use production ASGI server: `gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker`
- Set proper CORS origins
- Use environment variables for secrets

### Frontend
- Build: `npm run build`
- Start: `npm start`
- Or deploy to Vercel/Netlify

## Need Help?

- Check API docs at `/docs` endpoint
- Review error logs in terminal
- Verify all environment variables are set correctly





