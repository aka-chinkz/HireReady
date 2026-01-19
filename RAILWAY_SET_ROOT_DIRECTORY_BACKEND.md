# Railway: Set Root Directory to Backend

## The Problem

Railway is auto-detecting and defaulting to your **frontend** directory. You need to tell it to use the **backend** directory instead.

## Solution: Change Root Directory to `backend`

### Step 1: Cancel Current Deployment (if needed)

If Railway is trying to deploy the frontend:
1. Click **"Cancel"** or **"X"** on the deployment popup
2. Or wait for it to finish, then we'll configure it properly

### Step 2: Add New Service with Backend Root Directory

**Method A: When Adding New Service**

1. In Railway dashboard, click **"+ New"** or **"Add Service"**
2. Select **"GitHub Repo"**
3. Choose: `aka-chinkz/HireReady`
4. **BEFORE clicking Deploy**, look for **"Settings"** or **"Configure"** button
5. Find **"Root Directory"** or **"Working Directory"** field
6. Change it from `frontend` to: `backend`
7. Click **"Deploy"** or **"Apply Changes"**

**Method B: Edit Existing Service**

1. Click on your service in Railway
2. Go to **Settings** tab
3. Find **"Root Directory"** or **"Working Directory"**
4. Change it to: `backend`
5. Save changes
6. Railway will redeploy automatically

### Step 3: Verify It's Using Backend

After setting Root Directory to `backend`, Railway should show:

- **Build Command:** Should be Python-related (not npm)
- **Start Command:** Should be `uvicorn` or Python command
- **Watch Patterns:** Should be `["/backend/**"]` or similar

If you still see `npm` commands, the Root Directory isn't set correctly.

### Step 4: Configure Build Settings

Once Root Directory is set to `backend`:

1. Go to **Settings** tab
2. **Build Command:**
   ```
   pip install -r requirements.txt && prisma generate --schema=prisma/schema.prisma
   ```
3. **Start Command:**
   ```
   uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

### Step 5: Set Environment Variables

Go to **Variables** tab → Add:

```
DATABASE_URL=your-neon-connection-string
GOOGLE_CLIENT_ID=239752066498-5n66f47qhr0c9kii5seof03k50b4qh5j.apps.googleusercontent.com
ALLOWED_ORIGINS=http://localhost:3000,https://hireready-ihdgsec07-kaushals-projects-a98125ae.vercel.app
```

## Alternative: Use Railway Configuration File

If Railway keeps defaulting to frontend, create a `railway.json` or `railway.toml` file in your `backend` folder:

**Create `backend/railway.json`:**
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pip install -r requirements.txt && prisma generate --schema=prisma/schema.prisma"
  },
  "deploy": {
    "startCommand": "uvicorn main:app --host 0.0.0.0 --port $PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

This tells Railway explicitly that this is a Python/FastAPI service.

## Quick Fix Checklist

- [ ] Canceled/stopped frontend deployment (if needed)
- [ ] Added new service OR edited existing service
- [ ] Set **Root Directory** to `backend` (not `frontend`)
- [ ] Verified build command is Python (not npm)
- [ ] Set environment variables
- [ ] Configured build and start commands
- [ ] Generated public domain
- [ ] Tested backend URL

## Still Defaulting to Frontend?

If Railway keeps defaulting to frontend:

1. **Delete the frontend service** from Railway (you don't need it - it's on Vercel)
2. **Add a fresh service** and immediately set Root Directory to `backend`
3. Or use the `railway.json` file method above

## Visual Guide

When adding service, look for:
- **Root Directory:** `backend` ← Set this!
- **Build Command:** Should show Python commands
- **Start Command:** Should show `uvicorn`

If you see:
- `npm run build` → Wrong! (This is frontend)
- `pip install` → Correct! (This is backend)
