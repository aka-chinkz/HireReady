# PowerShell script to run backend
Write-Host "Starting Backend Development Server..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Note: Make sure you have:" -ForegroundColor Yellow
Write-Host "  1. Python 3.10+ installed" -ForegroundColor Yellow
Write-Host "  2. Virtual environment created (venv)" -ForegroundColor Yellow
Write-Host "  3. Dependencies installed" -ForegroundColor Yellow
Write-Host "  4. Database configured in backend/.env" -ForegroundColor Yellow
Write-Host ""

Set-Location backend

if (Test-Path "venv\Scripts\Activate.ps1") {
    & .\venv\Scripts\Activate.ps1
    python -m uvicorn main:app --reload
} else {
    Write-Host "Virtual environment not found!" -ForegroundColor Red
    Write-Host "Please run:" -ForegroundColor Yellow
    Write-Host "  python -m venv venv" -ForegroundColor White
    Write-Host "  .\venv\Scripts\Activate.ps1" -ForegroundColor White
    Write-Host "  pip install -r requirements.txt" -ForegroundColor White
    Read-Host "Press Enter to exit"
}




