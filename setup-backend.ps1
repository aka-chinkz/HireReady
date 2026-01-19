# PowerShell script to setup backend
Write-Host "Setting up Backend..." -ForegroundColor Cyan
Write-Host ""

Set-Location backend

# Step 1: Create virtual environment
Write-Host "Step 1: Creating virtual environment..." -ForegroundColor Yellow
if (-not (Test-Path "venv")) {
    python -m venv venv
    Write-Host "Virtual environment created!" -ForegroundColor Green
} else {
    Write-Host "Virtual environment already exists." -ForegroundColor Gray
}

Write-Host ""

# Step 2: Activate virtual environment
Write-Host "Step 2: Activating virtual environment..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1

Write-Host ""

# Step 3: Install dependencies
Write-Host "Step 3: Installing dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt
pip install prisma

Write-Host ""

# Step 4: Create .env file
Write-Host "Step 4: Creating .env file..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Copy-Item .env.example .env
    Write-Host ".env file created from .env.example" -ForegroundColor Green
    Write-Host "Please edit backend\.env and set your DATABASE_URL" -ForegroundColor Yellow
} else {
    Write-Host ".env file already exists." -ForegroundColor Gray
}

Write-Host ""
Write-Host "Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Edit backend\.env and set DATABASE_URL" -ForegroundColor White
Write-Host "  2. Run: prisma generate --schema=prisma\schema.prisma" -ForegroundColor White
Write-Host "  3. Run: prisma migrate dev --schema=prisma\schema.prisma" -ForegroundColor White
Write-Host "  4. Run: python prisma\seed.py" -ForegroundColor White
Write-Host "  5. Run: .\run-backend.ps1" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter to exit"




