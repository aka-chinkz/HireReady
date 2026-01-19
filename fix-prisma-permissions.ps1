# Fix Prisma Cache Permissions
# Run this script as Administrator

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "ERROR: This script must run as Administrator!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "HOW TO RUN AS ADMINISTRATOR:" -ForegroundColor Yellow
    Write-Host "1. Press Windows Key, type 'PowerShell'" -ForegroundColor White
    Write-Host "2. Right-click 'Windows PowerShell'" -ForegroundColor White
    Write-Host "3. Select 'Run as Administrator'" -ForegroundColor White
    Write-Host "4. Click 'Yes' when prompted" -ForegroundColor White
    Write-Host "5. Navigate here and run this script again:" -ForegroundColor White
    Write-Host '   cd "C:\Users\mayan\Desktop\career calender"' -ForegroundColor Cyan
    Write-Host '   .\fix-prisma-permissions.ps1' -ForegroundColor Cyan
    Write-Host ""
    Write-Host "OR copy-paste commands from RUN_AS_ADMIN_COMMANDS.txt" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Prisma Cache Permission Fix" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$cachePath = "$env:USERPROFILE\.cache\prisma-python\binaries\5.4.2"

Write-Host "Attempting to create: $cachePath" -ForegroundColor Cyan
Write-Host ""

try {
    # Remove if exists (with wrong permissions)
    if (Test-Path "$env:USERPROFILE\.cache\prisma-python") {
        Write-Host "Removing old cache directory..." -ForegroundColor Yellow
        Remove-Item -Recurse -Force "$env:USERPROFILE\.cache\prisma-python" -ErrorAction SilentlyContinue
    }
    
    # Create fresh directory structure
    New-Item -ItemType Directory -Force -Path $cachePath -ErrorAction Stop | Out-Null
    
    Write-Host "✅ Successfully created cache directory!" -ForegroundColor Green
    Write-Host ""
    
    # Set permissions
    $acl = Get-Acl $cachePath
    $permission = "$env:USERNAME","FullControl","ContainerInherit,ObjectInherit","None","Allow"
    $accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule $permission
    $acl.SetAccessRule($accessRule)
    Set-Acl $cachePath $acl
    
    Write-Host "✅ Permissions set correctly!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Close this Admin PowerShell window" -ForegroundColor White
    Write-Host "2. Open normal PowerShell" -ForegroundColor White
    Write-Host "3. Run: cd backend && .\venv\Scripts\Activate.ps1" -ForegroundColor Cyan
    Write-Host "4. Run: python -m prisma generate --schema=prisma/schema.prisma" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Make sure you're running this script as Administrator!" -ForegroundColor Yellow
    Write-Host "Right-click PowerShell → Run as Administrator" -ForegroundColor White
}
