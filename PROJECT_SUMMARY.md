# CareerPath Planner - Project Summary

## 🎯 Project Overview

CareerPath Planner is a modern, production-ready career planning platform designed for university students. It provides personalized internship and job application calendars based on career goals, skills, and academic year.

## ✨ Key Features Implemented

### 1. Multi-Step Onboarding Flow
- **Step 1**: Career stream selection (Software Dev, Data Science, AI/ML, Product, Finance)
- **Step 2**: Skill input with tag-based interface and auto-suggestions
- **Step 3**: University year, graduation year, and country selection
- **Step 4**: Target company tier selection (Tier 1, 2, 3)
- Beautiful animations using Framer Motion
- Progress indicators and smooth transitions

### 2. Career Intelligence Engine
- **Skill Matching**: Calculates readiness score (0-100) based on skill overlap
- **Year-Based Filtering**: Filters roles based on university year
  - 1st year → Skill prep + micro-internships
  - 2nd year → Internship heavy
  - 3rd year → Tier 1 internships
  - Final year → Full-time roles
- **Company Tiering**: Organizes companies into 3 tiers
  - Tier 1: FAANG & Big Tech
  - Tier 2: Unicorns & Strong Startups
  - Tier 3: Mid-size Companies
- **Skill Gap Analysis**: Identifies missing skills with priority levels
- **Personalized Recommendations**: Year and readiness-based suggestions

### 3. Application Calendar Generator
- **Three-Phase Timeline**:
  - Preparation phase (4-6 weeks before application)
  - Application window
  - Interview phase (2-4 weeks after application closes)
- **Multiple Views**:
  - Monthly calendar view with day-by-day events
  - Timeline view with chronological list
- **Export Functionality**:
  - Export to iCalendar (.ics) format
  - Downloadable calendar file

### 4. Stunning Dashboard UI
- **Readiness Score**: Animated circular progress indicator
- **Target Companies**: Tier-segmented cards with filtering
- **Application Calendar**: Interactive monthly/timeline views
- **Skill Gaps & Recommendations**: Visual display of improvement areas
- **Glassmorphism Design**: Modern, translucent card effects
- **Dark Mode**: Default dark theme with violet/cyan accents
- **Responsive Design**: Mobile-first, works on all screen sizes

## 🏗️ Architecture

### Frontend (Next.js 14)
- **Framework**: Next.js with App Router
- **Styling**: Tailwind CSS with custom dark theme
- **Animations**: Framer Motion for smooth transitions
- **Charts**: Recharts (ready for future enhancements)
- **Icons**: Lucide React
- **State Management**: React hooks (useState, useEffect)
- **API Client**: Axios with typed interfaces

### Backend (FastAPI)
- **Framework**: FastAPI with async/await
- **Database ORM**: Prisma (Python client)
- **Database**: PostgreSQL
- **API Design**: RESTful with clear separation of concerns
- **Services**: Modular architecture with intelligence and calendar services

### Database Schema
- **User**: Stores onboarding data and calculated readiness score
- **Company**: Company information with tier and application windows
- **Role**: Job roles with required skills and year requirements
- **Application**: Calendar events with preparation/application/interview phases

## 📁 Project Structure

```
career-path-planner/
├── frontend/
│   ├── app/                 # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── onboarding/      # Onboarding flow components
│   │   └── dashboard/       # Dashboard components
│   ├── lib/
│   │   ├── api.ts          # API client
│   │   └── utils.ts        # Utility functions
│   └── package.json
├── backend/
│   ├── app/
│   │   ├── routers/        # API route handlers
│   │   ├── services/       # Business logic
│   │   ├── models.py       # Pydantic models
│   │   └── database.py     # Prisma client
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── seed.py         # Seed script
│   ├── main.py             # FastAPI app
│   └── requirements.txt
├── README.md
├── SETUP.md
└── PROJECT_SUMMARY.md
```

## 🎨 Design Philosophy

- **Minimalist**: Clean, uncluttered interfaces
- **Dark Mode First**: Default dark theme optimized for focus
- **Smooth Animations**: Meaningful micro-interactions
- **Glassmorphism**: Modern translucent card designs
- **High Contrast**: Excellent readability
- **Mobile-First**: Responsive design from the ground up

## 🔧 Technical Highlights

1. **Deterministic Intelligence**: Not AI-dependent, uses rule-based matching
2. **Type Safety**: Full TypeScript on frontend, Pydantic models on backend
3. **Async Architecture**: FastAPI async/await for performance
4. **Modular Services**: Separated intelligence and calendar logic
5. **Real Data**: No placeholder content, real company and role data
6. **Production Ready**: Error handling, loading states, proper API structure

## 📊 Sample Data

The seed script includes:
- **15 Companies** across 3 tiers
- **Multiple Roles** per company with realistic skill requirements
- **Realistic Application Windows** based on industry standards

## 🚀 Future Enhancements (Bonus Features)

- AI-powered skill gap suggestions
- Resume checklist per company tier
- Weekly goal breakdown
- Progress tracking and analytics
- Social features (sharing calendars)
- Integration with job boards
- Email notifications for application deadlines

## 📝 Notes

- All code follows best practices with meaningful comments
- No placeholder/lorem ipsum content
- Real mock data for companies and roles
- Complete setup instructions provided
- Error handling throughout
- Loading states for better UX

## 🎓 Learning Outcomes

This project demonstrates:
- Full-stack development (Next.js + FastAPI)
- Modern UI/UX design principles
- Database design and ORM usage
- RESTful API design
- TypeScript and Python type safety
- Animation and interaction design
- Production-ready code structure

---

Built with ❤️ for university students planning their careers.





