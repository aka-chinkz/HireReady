# Install Python from python.org - The Only Real Solution

## Why Windows Store Python Doesn't Work

Windows Store Python has **severe permission restrictions** that prevent Prisma from working, even when:
- Running as Administrator
- Creating directories manually
- Using virtual environments

This is a **fundamental limitation** of Microsoft Store Python's sandboxed environment.

## The Only Working Solution

**Install Python from python.org** - This is what 99% of Python developers use.

### Step-by-Step Guide

#### 1. Download Python

- Go to: **https://www.python.org/downloads/**
- Click the big yellow "Download Python 3.12.x" button (or 3.11.x)
- Save the installer file

#### 2. Install Python

1. Run the installer you just downloaded
2. **IMPORTANT:** Check the box **"Add Python to PATH"** at the bottom
3. Click "Install Now"
4. Wait for installation to complete
5. Click "Close"

#### 3. Uninstall Microsoft Store Python (Recommended)

1. Press `Windows Key + I` to open Settings
2. Go to **Apps** → **Installed apps**
3. Search for "Python"
4. Find "Python 3.10" or "Python Software Foundation Python 3.10"
5. Click the three dots → **Uninstall**
6. This prevents conflicts

#### 4. Verify New Python Installation

Open a **new** PowerShell window and run:

```powershell
python --version
```

You should see something like: `Python 3.12.x` (from python.org, not Microsoft Store)

#### 5. Recreate Virtual Environment

```powershell
cd "C:\Users\mayan\Desktop\career calender\backend"

# Delete old venv (if it exists)
if (Test-Path venv) {
    Remove-Item -Recurse -Force venv
}

# Create new venv with python.org Python
python -m venv venv

# Activate it
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Generate Prisma (THIS WILL WORK NOW!)
python -m prisma generate --schema=prisma/schema.prisma
```

#### 6. Start Your Backend

```powershell
python -m uvicorn main:app --reload
```

## Why This Works

✅ **python.org Python** has full system permissions  
✅ No sandboxing restrictions  
✅ Can create directories and files normally  
✅ Standard Python installation used by professionals  
✅ Works with all Python tools and libraries  

## Time Investment

- **Download:** 2 minutes
- **Install:** 2 minutes  
- **Setup:** 5 minutes
- **Total:** ~10 minutes

**This is a ONE-TIME setup that fixes the issue permanently.**

## Alternative (Not Recommended)

You could continue struggling with Windows Store Python, but you'll face the same permission issues with many other Python tools in the future (not just Prisma).

## Summary

**Windows Store Python = Problem**  
**python.org Python = Solution**

This is not a workaround - this is the **standard way** Python developers install Python on Windows. The Microsoft Store version is limited and causes issues.