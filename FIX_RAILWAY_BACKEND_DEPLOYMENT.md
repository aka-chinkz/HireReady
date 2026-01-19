# Fix Railway: Deploy Backend (Not Frontend)

## The Problem

You've deployed the **frontend** to Railway, but you need to deploy the **backend** (FastAPI) instead. Your frontend is already on Vercel, so Railway should only have your backend.

## Solution: Add Backend Service to Railway

### Option 1: Add Backend as New Service (Recommended)

1. In your Railway project dashboard
2. Click **"+ New"** or **"Add Service"** button
3. Select **"GitHub Repo"**
4. Choose your repository: `aka-chinkz/HireReady`
5. **IMPORTANT:** When configuring, set:
   - **Root Directory:** `backend`
   - Railway should detect it's Python

### Option 2: If You Want to Keep Frontend on Railway Too

You can have both, but you need to:
1. Keep the frontend service (already deployed)
2. Add a **new service** for the backend
3. Configure each separately

## Configure Backend Service

Once you have a backend service in Railway:

### Step 1: Set Environment Variables

Go to your **backend service** → **Variables** tab → Add:

```
DATABASE_URL=your-neon-database-connection-string
GOOGLE_CLIENT_ID=239752066498-5n66f47qhr0c9kii5seof03k50b4qh5j.apps.googleusercontent.com
ALLOWED_ORIGINS=http://localhost:3000,https://hireready-ihdgsec07-kaushals-projects-a98125ae.vercel.app
```

### Step 2: Configure Build Settings

Go to **Settings** tab:

**Build Command:**
```
pip install -r requirements.txt && prisma generate --schema=prisma/schema.prisma
```

**Start Command:**
```
uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Step 3: Generate Public URL

1. Go to **Settings** → **Networking**
2. Click **"Generate Domain"** or **"Public"** button
3. This will create a public URL like: `https://your-backend.up.railway.app`
4. **Copy this URL** - you'll need it for Vercel!

### Step 4: Test Backend

1. Open the Railway backend URL in browser
2. Should see: `{"message": "CareerPath Planner API", "version": "1.0.0", "docs": "/docs"}`
3. Try: `https://your-backend.up.railway.app/health`
4. Should return: `{"status": "healthy"}`

## Update Vercel

1. Go to your **frontend** project in Vercel
2. **Settings** → **Environment Variables**
3. Add/Update:
   - **Name:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://your-backend.up.railway.app` (from Railway backend service)
   - **Environment:** Production, Preview, Development
4. Make sure `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set
5. **Redeploy** Vercel

## Quick Summary

- ✅ Frontend on Vercel (keep it there)
- ✅ Frontend on Railway (you can remove this or keep it)
- ❌ **Backend on Railway** (you need to add this!)
- ✅ Database on Neon (already set up)

## Architecture

```
Frontend (Vercel) → Backend (Railway) → Database (Neon)
```

Your Vercel frontend should call your Railway backend, which connects to your Neon database.

## Checklist

- [ ] Added backend service to Railway (Root Directory: `backend`)
- [ ] Set environment variables in backend service
- [ ] Configured build and start commands
- [ ] Generated public domain for backend service
- [ ] Tested backend URL works (`/health` endpoint)
- [ ] Set `NEXT_PUBLIC_API_URL` in Vercel to Railway backend URL
- [ ] Redeployed Vercel frontend
- [ ] Tested Google login
