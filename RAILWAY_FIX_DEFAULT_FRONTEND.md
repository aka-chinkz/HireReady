# Fix Railway Defaulting to Frontend

## The Problem

Railway keeps defaulting to deploying your **frontend** instead of your **backend**. This happens because Railway detects the `frontend` folder first.

## Solution 1: Set Root Directory When Adding Service

### When Adding New Service:

1. Click **"+ New"** → **"GitHub Repo"**
2. Select: `aka-chinkz/HireReady`
3. **BEFORE deploying**, click **"Settings"** or look for configuration options
4. Find **"Root Directory"** field
5. Change it from `frontend` (or empty) to: `backend`
6. Click **"Deploy"**

### If You Already Added the Service:

1. Click on the service in Railway
2. Go to **Settings** tab
3. Scroll down to find **"Root Directory"** or **"Working Directory"**
4. Change it to: `backend`
5. Save - Railway will redeploy automatically

## Solution 2: Use Railway Config File (I Just Created This!)

I've created `backend/railway.json` in your project. This tells Railway explicitly that the backend folder is a Python service.

**After committing this file:**

1. Push to GitHub:
   ```bash
   git add backend/railway.json
   git commit -m "Add Railway config for backend"
   git push
   ```

2. In Railway, when adding service:
   - Select your repo
   - Set **Root Directory** to: `backend`
   - Railway will now use the `railway.json` config

## Solution 3: Delete Frontend Service (Recommended)

Since your frontend is already on Vercel, you don't need it on Railway:

1. In Railway dashboard
2. Find the **"career-path-planner-frontend"** service
3. Click **Settings** → Scroll to bottom
4. Click **"Delete Service"** or **"Remove"**
5. Then add a new service with Root Directory: `backend`

## Step-by-Step: Add Backend Service Correctly

1. **In Railway dashboard:**
   - Click **"+ New"** → **"GitHub Repo"**
   - Select: `aka-chinkz/HireReady`

2. **Configure BEFORE deploying:**
   - Look for **"Configure"** or **"Settings"** button
   - Set **Root Directory:** `backend`
   - Railway should now detect Python

3. **Verify it's correct:**
   - Build Command should show: `pip install` (not `npm`)
   - Start Command should show: `uvicorn` (not `npm start`)

4. **If it still shows npm commands:**
   - Cancel the deployment
   - Make sure Root Directory is set to `backend`
   - Try again

## Quick Checklist

- [ ] Set Root Directory to `backend` (not `frontend`)
- [ ] Verified build command is Python (`pip install`)
- [ ] Verified start command is Python (`uvicorn`)
- [ ] Committed `backend/railway.json` (if using that method)
- [ ] Deleted frontend service from Railway (optional but recommended)

## What Railway Should Show for Backend

**Correct (Backend):**
- Root Directory: `backend`
- Build Command: `pip install -r requirements.txt && prisma generate --schema=prisma/schema.prisma`
- Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Builder: `NIXPACKS` or `DOCKER`

**Wrong (Frontend):**
- Root Directory: `frontend` or empty
- Build Command: `npm run build`
- Start Command: `npm start`
- Builder: `RAILPACK`

## Still Having Issues?

If Railway still defaults to frontend:

1. **Delete all services** in Railway
2. **Start fresh** - Add new service
3. **Immediately set Root Directory** to `backend` before Railway auto-detects
4. Or use the `railway.json` file I created

The key is setting the Root Directory **before** Railway auto-detects the frontend!
