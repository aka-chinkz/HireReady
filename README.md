# CareerPath Planner

A modern career-planning platform for university students that generates personalized internship & job application calendars based on career goals, skills, and university year.

## 🚀 Features

- **Multi-step Onboarding**: Beautiful animated flow for career stream, skills, year, and target tiers
- **Career Intelligence Engine**: Skill matching, readiness scoring, and year-based filtering
- **Application Calendar**: Timeline view with preparation, application, and interview phases
- **Company Tiering**: Organized by Tier 1 (FAANG), Tier 2 (Unicorns), Tier 3 (Mid-size)
- **Stunning Dashboard**: Readiness score, company cards, calendar visualization, skill gaps

## 🛠️ Tech Stack

### Frontend
- Next.js 14 (App Router)
- Tailwind CSS
- Framer Motion
- Recharts
- shadcn/ui
- Dark mode enabled

### Backend
- FastAPI (Python)
- PostgreSQL
- Prisma ORM

## 📦 Quick Start

### Option 1: Frontend Only (Recommended for Testing)

**No backend setup needed!** The app uses mock data automatically.

1. **Run frontend:**
   ```powershell
   # Windows PowerShell
   .\run-frontend.ps1
   
   # Or double-click run-frontend.bat
   ```

2. **Open browser:**
   - Frontend: http://localhost:3000

### Option 2: Full Stack Setup

For detailed setup instructions, see [SETUP.md](./SETUP.md)

**Windows Users (Easiest):**
1. Setup backend (first time):
   ```powershell
   .\setup-backend.ps1
   ```

2. Start backend:
   ```powershell
   .\run-backend.ps1
   ```

3. Start frontend (new terminal):
   ```powershell
   .\run-frontend.ps1
   ```

**Manual Setup:**
1. **Install dependencies:**
   ```bash
   # Backend
   cd backend
   python3 -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   pip install prisma
   
   # Frontend
   cd frontend
   npm install
   ```

2. **Set up database:**
   ```bash
   # Create PostgreSQL database
   createdb career_planner
   
   # Configure backend/.env
   DATABASE_URL="postgresql://user:password@localhost:5432/career_planner"
   
   # Run migrations and seed
   cd backend
   prisma generate --schema=prisma/schema.prisma
   prisma migrate dev --schema=prisma/schema.prisma
   python prisma/seed.py
   ```

3. **Start servers:**
   ```bash
   # Terminal 1 - Backend
   cd backend
   uvicorn main:app --reload
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

**See [README_SCRIPTS.md](./README_SCRIPTS.md) for all available run scripts.**

## 📁 Project Structure

```
career-path-planner/
├── frontend/          # Next.js application
├── backend/           # FastAPI application
├── database/          # Prisma schema and migrations
└── README.md
```

## 🎨 Design Philosophy

- **Minimalist**: Clean, uncluttered interfaces
- **Dark Mode**: Default dark theme with violet/cyan accents
- **Smooth Animations**: Meaningful micro-interactions
- **Mobile-First**: Responsive design
- **Glassmorphism**: Modern card designs

## 📝 License

MIT

