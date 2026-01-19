# Railway Deployment - Next Steps

## ✅ What You've Done

- Connected Railway to your GitHub repository (`aka-chinkz/HireReady`)

## 🚀 Next Steps to Deploy Your Backend

### Step 1: Create New Project in Railway

1. Go to: https://railway.app/dashboard
2. Click **"New Project"** (or **"+"** button)
3. Select **"Deploy from GitHub repo"**
4. Choose your repository: `aka-chinkz/HireReady`

### Step 2: Configure the Service

Railway might auto-detect your backend, but you may need to configure it:

1. If Railway shows multiple services, select the one for your **backend**
2. Or if it asks for a **Root Directory**, set it to: `backend`
3. Railway should auto-detect it's Python

### Step 3: Set Environment Variables

**CRITICAL:** Go to your Railway service → **Variables** tab → Add these:

```
DATABASE_URL=your-neon-database-connection-string
GOOGLE_CLIENT_ID=239752066498-5n66f47qhr0c9kii5seof03k50b4qh5j.apps.googleusercontent.com
ALLOWED_ORIGINS=http://localhost:3000,https://hireready-ihdgsec07-kaushals-projects-a98125ae.vercel.app
```

**How to get your Neon DATABASE_URL:**
1. Go to your Neon dashboard
2. Find your project
3. Go to **Connection Details** or **Connection String**
4. Copy the PostgreSQL connection string (looks like: `postgresql://user:pass@host/dbname`)
5. Paste it as `DATABASE_URL` in Railway

### Step 4: Configure Build Settings (if needed)

Railway usually auto-detects, but if deployment fails:

1. Go to your service → **Settings** tab
2. **Build Command:** 
   ```
   pip install -r requirements.txt && prisma generate --schema=prisma/schema.prisma
   ```
3. **Start Command:**
   ```
   uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

### Step 5: Deploy

1. Railway will automatically start deploying
2. Watch the **Deployments** tab for progress
3. Wait for deployment to complete (usually 2-5 minutes)

### Step 6: Get Your Backend URL

1. After deployment succeeds, go to **Settings** tab
2. Under **Domains** or **Networking**, you'll see a URL like:
   - `https://your-service-name.up.railway.app`
3. **Copy this URL** - you'll need it for Vercel!

### Step 7: Test Your Backend

1. Open the Railway URL in your browser
2. You should see: `{"message": "CareerPath Planner API", "version": "1.0.0", "docs": "/docs"}`
3. Try `/health` endpoint: `https://your-backend.up.railway.app/health`
4. Should return: `{"status": "healthy"}`

### Step 8: Update Vercel with Backend URL

1. Go to your **frontend** project in Vercel
2. **Settings** → **Environment Variables**
3. Add/Update:
   - **Name:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://your-backend.up.railway.app` (from Railway Step 6)
   - **Environment:** Production, Preview, Development (select all)
4. Make sure `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is also set:
   - **Name:** `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
   - **Value:** `239752066498-5n66f47qhr0c9kii5seof03k50b4qh5j.apps.googleusercontent.com`
5. Click **Save**

### Step 9: Redeploy Vercel

1. Go to **Deployments** tab in Vercel
2. Click **three dots** (⋯) on latest deployment
3. Click **Redeploy**
4. Wait for deployment

### Step 10: Test Google Login

1. Go to: `https://hireready-ihdgsec07-kaushals-projects-a98125ae.vercel.app`
2. Try Google login
3. Should work now! 🎉

## Troubleshooting

### Railway deployment fails

**Check logs:**
1. Go to Railway → Your service → **Deployments** tab
2. Click on the failed deployment
3. Check the logs for errors

**Common issues:**
- Missing `requirements.txt` → Make sure it exists in `backend/` folder
- Prisma not found → Make sure `prisma generate` runs in build command
- Port issue → Make sure start command uses `$PORT` variable

### Backend URL not working

- Check Railway service is **Running** (not stopped)
- Verify environment variables are set correctly
- Check Railway logs for errors
- Make sure `/health` endpoint works

### Still getting "Failed to fetch"

- Verify `NEXT_PUBLIC_API_URL` in Vercel matches your Railway URL exactly
- Check browser console (F12) for the exact error
- Make sure Railway backend is running and accessible
- Verify CORS is configured (should be automatic with `ALLOWED_ORIGINS`)

## Quick Checklist

- [ ] Created new Railway project
- [ ] Connected to `aka-chinkz/HireReady` repository
- [ ] Set root directory to `backend` (if needed)
- [ ] Added `DATABASE_URL` (your Neon connection string)
- [ ] Added `GOOGLE_CLIENT_ID`
- [ ] Added `ALLOWED_ORIGINS` (with your Vercel URL)
- [ ] Deployment succeeded
- [ ] Got backend URL from Railway
- [ ] Set `NEXT_PUBLIC_API_URL` in Vercel
- [ ] Redeployed Vercel frontend
- [ ] Tested backend health endpoint
- [ ] Tested Google login on Vercel

## Need Help?

If you get stuck:
1. Check Railway deployment logs
2. Check Railway service status (should be "Running")
3. Test backend URL directly in browser
4. Check browser console (F12) for specific errors
