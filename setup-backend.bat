@echo off
echo Setting up Backend...
echo.

cd backend

echo Step 1: Creating virtual environment...
if not exist venv (
    python -m venv venv
    echo Virtual environment created!
) else (
    echo Virtual environment already exists.
)

echo.
echo Step 2: Activating virtual environment...
call venv\Scripts\activate.bat

echo.
echo Step 3: Installing dependencies...
pip install -r requirements.txt
pip install prisma

echo.
echo Step 4: Creating .env file (if it doesn't exist)...
if not exist .env (
    copy .env.example .env
    echo .env file created from .env.example
    echo Please edit backend\.env and set your DATABASE_URL
) else (
    echo .env file already exists.
)

echo.
echo Setup complete!
echo.
echo Next steps:
echo   1. Edit backend\.env and set DATABASE_URL
echo   2. Run: prisma generate --schema=prisma\schema.prisma
echo   3. Run: prisma migrate dev --schema=prisma\schema.prisma
echo   4. Run: python prisma\seed.py
echo   5. Run: run-backend.bat
echo.
pause




