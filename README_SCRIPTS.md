# Run Scripts Guide

This project includes convenient run scripts for Windows to make development easier.

## Available Scripts

### Frontend Scripts

#### `run-frontend.bat` (Windows Batch)
Double-click or run from command prompt:
```cmd
run-frontend.bat
```

#### `run-frontend.ps1` (PowerShell)
Run from PowerShell:
```powershell
.\run-frontend.ps1
```

**What it does:**
- Navigates to frontend directory
- Runs `npm run dev`
- Starts Next.js development server on http://localhost:3000

---

### Backend Scripts

#### `run-backend.bat` (Windows Batch)
Double-click or run from command prompt:
```cmd
run-backend.bat
```

#### `run-backend.ps1` (PowerShell)
Run from PowerShell:
```powershell
.\run-backend.ps1
```

**What it does:**
- Navigates to backend directory
- Activates Python virtual environment
- Runs FastAPI server with `uvicorn main:app --reload`
- Starts backend on http://localhost:8000

**Note:** Requires backend to be set up first (see setup scripts below)

---

### Setup Scripts

#### `setup-backend.bat` (Windows Batch)
Double-click or run from command prompt:
```cmd
setup-backend.bat
```

#### `setup-backend.ps1` (PowerShell)
Run from PowerShell:
```powershell
.\setup-backend.ps1
```

**What it does:**
1. Creates Python virtual environment (if it doesn't exist)
2. Activates virtual environment
3. Installs all Python dependencies
4. Creates `.env` file from `.env.example`
5. Provides next steps instructions

---

## Quick Start

### For Frontend Only (Mock API Mode)

1. **Run frontend:**
   ```powershell
   .\run-frontend.ps1
   ```
   Or double-click `run-frontend.bat`

2. Open http://localhost:3000 in your browser

The app will use mock data automatically (no backend needed!)

---

### For Full Stack (Frontend + Backend)

1. **Setup backend (first time only):**
   ```powershell
   .\setup-backend.ps1
   ```
   Then follow the instructions to configure database

2. **Start backend:**
   ```powershell
   .\run-backend.ps1
   ```

3. **Start frontend (in a new terminal):**
   ```powershell
   .\run-frontend.ps1
   ```

4. Open http://localhost:3000 in your browser

---

## Alternative: Using npm scripts

You can also use npm scripts from the root:

```bash
# Frontend
npm run dev:frontend

# Backend (requires Python setup)
npm run dev:backend
```

---

## Troubleshooting

### PowerShell Execution Policy Error

If you get an execution policy error, run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Backend Script Fails

Make sure:
- Python 3.10+ is installed
- You've run `setup-backend.ps1` first
- Database is configured in `backend/.env`

### Frontend Script Fails

Make sure:
- Node.js 18+ is installed
- You've run `npm install` in the frontend directory

---

## Notes

- **Batch files (.bat)** work in Command Prompt
- **PowerShell scripts (.ps1)** work in PowerShell (recommended)
- Scripts are designed for Windows
- For Linux/Mac, use the shell scripts in `backend/` directory or npm scripts




