@echo off
echo Starting Backend Development Server...
echo.
echo Note: Make sure you have:
echo   1. Python 3.10+ installed
echo   2. Virtual environment created (venv)
echo   3. Dependencies installed (pip install -r requirements.txt)
echo   4. Database configured in backend/.env
echo.
cd backend
if exist venv\Scripts\activate.bat (
    call venv\Scripts\activate.bat
    python -m uvicorn main:app --reload
) else (
    echo Virtual environment not found!
    echo Please run: python -m venv venv
    echo Then: venv\Scripts\activate
    echo Then: pip install -r requirements.txt
    pause
)




