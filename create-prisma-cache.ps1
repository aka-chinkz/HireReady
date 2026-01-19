# Script to create Prisma cache directory structure
# Run this as Administrator

Write-Host "Creating Prisma cache directory structure..." -ForegroundColor Cyan

$cachePath = "$env:USERPROFILE\.cache\prisma-python\binaries\5.4.2"

try {
    New-Item -ItemType Directory -Force -Path $cachePath -ErrorAction Stop | Out-Null
    Write-Host "✅ Successfully created cache directory: $cachePath" -ForegroundColor Green
    Write-Host ""
    Write-Host "You can now run: python -m prisma generate --schema=prisma/schema.prisma" -ForegroundColor Yellow
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Make sure you're running PowerShell as Administrator!" -ForegroundColor Yellow
    Write-Host "Right-click PowerShell → Run as Administrator" -ForegroundColor White
}
