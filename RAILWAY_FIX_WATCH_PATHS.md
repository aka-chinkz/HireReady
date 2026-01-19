# Fix Railway Watch Paths for Backend

## The Problem

Your Railway service has **Watch Paths** set to `/frontend/**`. This means:
- ✅ Changes in `frontend/` trigger deployments
- ❌ Changes in `backend/` do **NOT** trigger deployments

Since you're deploying the **backend**, you need to change this!

## Solution: Change Watch Paths to `/backend/**`

### Step 1: Update Watch Paths

1. In the **Watch Paths** section you're viewing:
2. **Remove** `/frontend/**` (click the X or delete it)
3. **Add** `/backend/**` (click "Add pattern" or use the suggestion)
4. Save the changes

### Step 2: What to Set

Change from:
```
/frontend/**
```

To:
```
/backend/**
```

This tells Railway: "Only redeploy when files in the `backend/` directory change"

## Why This Matters

- **Before:** Railway watches frontend → backend changes ignored → service doesn't redeploy
- **After:** Railway watches backend → backend changes detected → service redeploys automatically ✅

## Complete Configuration Checklist

Make sure you have:

1. ✅ **Root Directory:** `/backend`
2. ✅ **Build Command:** `pip install -r requirements.txt && prisma generate --schema=prisma/schema.prisma`
3. ✅ **Watch Paths:** `/backend/**` ← **Change this now!**
4. ✅ **Start Command:** Auto-detected from `railway.json` (already committed)

## Quick Fix Steps

1. Click on `/frontend/**` and remove it
2. Add pattern: `/backend/**`
3. Save
4. Railway will now watch backend changes!
