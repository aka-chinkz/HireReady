# Deploy Your Backend - Quick Start

## The Situation

- ✅ **Frontend:** Deployed on Vercel
- ✅ **Database:** Neon (PostgreSQL)
- ❌ **Backend:** Not deployed yet (this is the problem!)

## The Problem

Your frontend on Vercel is trying to call `http://localhost:8000` which doesn't exist in production. You need to deploy your FastAPI backend.

## Solution: Deploy Backend to Railway (Recommended)

### Step 1: Sign Up & Deploy

1. Go to: https://railway.app
2. Sign up with GitHub
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Select your repository
5. Railway will auto-detect Python

### Step 2: Set Environment Variables

In Railway project → **Variables** tab:

```
DATABASE_URL=your-neon-connection-string
GOOGLE_CLIENT_ID=239752066498-5n66f47qhr0c9kii5seof03k50b4qh5j.apps.googleusercontent.com
ALLOWED_ORIGINS=http://localhost:3000,https://hireready-ihdgsec07-kaushals-projects-a98125ae.vercel.app
```

### Step 3: Get Backend URL

After deployment, Railway gives you a URL like:
`https://your-backend.up.railway.app`

### Step 4: Update Vercel

In your **frontend** Vercel project:
1. **Settings** → **Environment Variables**
2. Add:
   - `NEXT_PUBLIC_API_URL` = `https://your-backend.up.railway.app`
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID` = `239752066498-5n66f47qhr0c9kii5seof03k50b4qh5j.apps.googleusercontent.com`
3. **Redeploy** your Vercel app

## That's It!

Your frontend will now be able to reach your backend, and Google login should work!

## Need Help?

If Railway doesn't work, try:
- **Render.com** (similar to Railway)
- **Fly.io** (good for Python apps)
- **Vercel** (can deploy Python, but more complex)

See `DEPLOY_BACKEND_TO_RAILWAY.md` for detailed instructions.
