# Fix 405 Method Not Allowed Error

## The Problem

You're seeing:
- **405 error** on `/api/auth/google` endpoint
- **"Failed to execute 'json' on 'Response': Unexpected end of JSON input"**

**What 405 means:**
- The backend is running and responding
- But the HTTP method (POST) is not allowed for that route
- OR the backend crashed during startup and routes aren't registered

---

## Root Cause: Database Connection Failing During Requests

Based on your Railway logs, the backend **starts successfully**, but then encounters **PostgreSQL connection errors** when handling requests (like `/api/auth/google`). This causes:
- 405 errors (backend crashes mid-request)
- "Unexpected end of JSON input" (backend returns error HTML instead of JSON)

The error occurs ~5 minutes after startup, suggesting connection pool or timeout issues.

---

## Step-by-Step Fix

### Step 1: Check Railway Logs

1. Go to **Railway** → Your backend service → **Deployments** → **View logs**
2. Look for these messages:

   **✅ Good signs:**
   - "🚀 CareerPath Planner API starting..."
   - "✅ Database connected successfully"
   - "Application startup complete"

   **❌ Bad signs:**
   - "Error validating datasource db: the URL must start with the protocol postgresql://"
   - "Could not connect to the query engine"
   - "All connection attempts failed"
   - "Application startup failed. Exiting."

### Step 2: Fix DATABASE_URL (Critical!)

Your logs show PostgreSQL connection errors. This MUST be fixed:

1. **Railway** → Your backend service → **Variables** tab
2. Find `DATABASE_URL`
3. **Verify it's correct:**
   - ✅ Starts with `postgresql://` (NOT `'postgresql://'` with quotes)
   - ✅ Uses **"Pooled"** connection (has `-pooler` in hostname)
   - ✅ Database name is `neondb` (NOT `prisma_migrate_shadow_db_...`)
   - ✅ No quotes around the entire value
   - ✅ Ends with `?sslmode=require`

4. **Get correct connection string:**
   - Go to **Neon Dashboard** → Your database → **Connection Details**
   - Copy the **"Pooled"** connection string (NOT "Direct" or "Shadow")
   - It should look like:
     ```
     postgresql://user:password@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require
     ```
   - **Important:** Use "Pooled" for Railway deployments (better connection management)

5. **Update in Railway:**
   - Paste the connection string (no quotes)
   - Save
   - Wait 1-2 minutes for redeploy

### Step 3: Test Backend Health

After fixing DATABASE_URL, test if backend is running:

1. **Visit:** `https://career-path-planner-backend-production.up.railway.app/health`
   - Should return: `{"status": "healthy"}` ✅
   - If this fails, backend is still down ❌

2. **Visit:** `https://career-path-planner-backend-production.up.railway.app/docs`
   - Should show FastAPI Swagger docs
   - Look for `/api/auth/google` endpoint
   - Should show it accepts POST ✅

### Step 4: Commit and Push Changes

I've updated the backend to handle database connection errors gracefully. Commit these changes:

```powershell
git add backend/main.py frontend/components/GoogleLogin.tsx
git commit -m "Fix: Improve error handling for database connection and API responses"
git push
```

Wait for Railway to redeploy (1-2 minutes).

---

## What I Fixed

1. **Backend Database Connection (`backend/app/database.py`):**
   - Added retry logic (3 attempts with 2-second delays) for initial connection
   - Added `ensure_connected()` function to check and reconnect if connection is lost
   - Better error logging for connection issues

2. **Backend Auth Route (`backend/app/routers/auth.py`):**
   - Calls `ensure_connected()` before database operations
   - Catches connection errors and returns proper HTTP 503 errors
   - Better error messages for connection failures

3. **Backend Startup (`backend/main.py`):**
   - Added error handling so backend starts even if database connection fails initially
   - Backend will log warnings but continue running
   - Routes will be registered even if DB is temporarily down

4. **Frontend (`frontend/components/GoogleLogin.tsx`):**
   - Better error handling for non-JSON responses
   - More helpful error messages when backend crashes or returns errors

---

## Next Steps

1. ✅ **Check Railway logs** for database errors
2. ✅ **Fix DATABASE_URL** if needed (remove quotes, use correct database)
3. ✅ **Test `/health` endpoint** to verify backend is running
4. ✅ **Commit and push** the error handling improvements
5. ✅ **Try Google login again** after Railway redeploys

The 405 error should be resolved once the backend starts successfully!
