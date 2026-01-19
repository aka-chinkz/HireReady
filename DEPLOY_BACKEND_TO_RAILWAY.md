# Deploy Backend to Railway (Easiest Option)

## Quick Overview

Your **Neon database** is already set up. Now you need to deploy your **FastAPI backend** so your Vercel frontend can talk to it.

## Why Railway?

- ✅ Free tier available
- ✅ Easy Python/FastAPI deployment
- ✅ Automatic HTTPS
- ✅ Environment variables support
- ✅ Simple setup

## Step 1: Sign Up for Railway

1. Go to: https://railway.app
2. Sign up with GitHub
3. Click **"New Project"**

## Step 2: Deploy Backend

1. Click **"Deploy from GitHub repo"**
2. Select your repository
3. Select the **`backend`** folder (or root if backend is in root)
4. Railway will auto-detect it's Python

## Step 3: Set Environment Variables in Railway

Go to your Railway project → **Variables** tab → Add these:

```
DATABASE_URL=your-neon-database-url-here
GOOGLE_CLIENT_ID=239752066498-5n66f47qhr0c9kii5seof03k50b4qh5j.apps.googleusercontent.com
ALLOWED_ORIGINS=http://localhost:3000,https://hireready-ihdgsec07-kaushals-projects-a98125ae.vercel.app
```

**Important:**
- `DATABASE_URL` = Your Neon database connection string
- `ALLOWED_ORIGINS` = Comma-separated list of frontend URLs (no spaces)

## Step 4: Configure Railway Build

Railway should auto-detect, but if not:

1. Go to **Settings** → **Build Command**
2. Set to: `pip install -r requirements.txt && prisma generate --schema=prisma/schema.prisma`
3. **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`

## Step 5: Get Your Backend URL

1. After deployment, Railway will give you a URL like: `https://your-app.up.railway.app`
2. Copy this URL - you'll need it for Vercel

## Step 6: Update Vercel Environment Variables

1. Go to your **frontend** project in Vercel
2. **Settings** → **Environment Variables**
3. Add/Update:
   - **Name:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://your-app.up.railway.app` (your Railway backend URL)
   - **Environment:** Production, Preview, Development
4. Click **Save**

## Step 7: Redeploy Vercel

1. Go to **Deployments** tab
2. Click **three dots** (⋯) → **Redeploy**
3. Wait for deployment

## Step 8: Test

1. Go to your Vercel app
2. Try Google login
3. Should work now! 🎉

## Alternative: Deploy to Render

If Railway doesn't work, try Render:

1. Go to: https://render.com
2. Sign up
3. **New** → **Web Service**
4. Connect GitHub repo
5. Settings:
   - **Build Command:** `pip install -r requirements.txt && prisma generate --schema=prisma/schema.prisma`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add environment variables (same as Railway)
7. Deploy!

## Quick Checklist

- [ ] Deployed backend to Railway (or Render)
- [ ] Set `DATABASE_URL` in Railway (your Neon URL)
- [ ] Set `GOOGLE_CLIENT_ID` in Railway
- [ ] Set `ALLOWED_ORIGINS` in Railway (include your Vercel URL)
- [ ] Got backend URL from Railway
- [ ] Set `NEXT_PUBLIC_API_URL` in Vercel to Railway backend URL
- [ ] Redeployed Vercel frontend
- [ ] Tested Google login
