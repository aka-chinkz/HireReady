# Railway Backend: Next Steps After Successful Deployment

## ✅ Current Status

Your backend is deployed and **online**! Now you need to:

1. **Get a public URL** (expose the service)
2. **Set environment variables**
3. **Update Vercel frontend** with the new backend URL

---

## Step 1: Generate Public Domain

Your service shows "Unexposed service" - you need to expose it:

1. In Railway, click on **"Settings"** tab
2. Look for **"Networking"** section
3. Click **"Generate Domain"** button
4. Railway will create a URL like: `career-path-planner-backend-production.up.railway.app`
5. **Copy this URL** - you'll need it!

---

## Step 2: Set Environment Variables

Click on **"Variables"** tab and add these:

### Required Variables:

```
DATABASE_URL=your-neon-postgres-connection-string
GOOGLE_CLIENT_ID=239752066498-5n66f47qhr0c9kii5seof03k50b4qh5j.apps.googleusercontent.com
ALLOWED_ORIGINS=http://localhost:3000,https://hireready-ihdgsec07-kaushals-projects-a98125ae.vercel.app
```

**Notes:**
- **DATABASE_URL**: Get this from your Neon dashboard (it should look like `postgresql://user:password@host/dbname?sslmode=require`)
- **GOOGLE_CLIENT_ID**: Already have this
- **ALLOWED_ORIGINS**: Include localhost for local testing and your Vercel URL

**How to add:**
1. Click **"+ New Variable"**
2. Enter variable name (e.g., `DATABASE_URL`)
3. Enter variable value
4. Click **"Add"**
5. Repeat for each variable

---

## Step 3: Update Vercel Frontend

Once you have your Railway backend URL:

1. Go to **Vercel Dashboard** → Your project
2. Go to **Settings** → **Environment Variables**
3. Update `NEXT_PUBLIC_API_URL` to your Railway URL:
   ```
   NEXT_PUBLIC_API_URL=https://career-path-planner-backend-production.up.railway.app
   ```
4. **Redeploy** the Vercel frontend

---

## Step 4: Test Your Backend

Visit your Railway URL:
- `https://your-railway-url.railway.app/` - Should show API info
- `https://your-railway-url.railway.app/health` - Should show `{"status": "healthy"}`
- `https://your-railway-url.railway.app/docs` - FastAPI docs (if enabled)

---

## Step 5: Update Google OAuth (If Needed)

If your Vercel URL has changed, update Google Cloud Console:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. APIs & Services → Credentials
3. Edit your OAuth 2.0 Client ID
4. Add your Railway backend URL to "Authorized JavaScript origins" if needed
5. Add callback URLs if needed

---

## Checklist

- [ ] Generated public domain in Railway
- [ ] Copied Railway backend URL
- [ ] Added `DATABASE_URL` environment variable
- [ ] Added `GOOGLE_CLIENT_ID` environment variable
- [ ] Added `ALLOWED_ORIGINS` environment variable
- [ ] Updated `NEXT_PUBLIC_API_URL` in Vercel
- [ ] Redeployed Vercel frontend
- [ ] Tested backend URL in browser (`/health` endpoint)
- [ ] Tested Google Login on Vercel deployment

---

## Troubleshooting

**If backend isn't responding:**
- Check Railway logs: Click "View logs" on the deployment
- Verify environment variables are set correctly
- Make sure the service shows "Online"

**If CORS errors:**
- Verify `ALLOWED_ORIGINS` includes your exact Vercel URL
- Check that the URL format is correct (no trailing slashes)

**If database connection fails:**
- Verify `DATABASE_URL` is correct from Neon dashboard
- Check that the connection string includes `?sslmode=require`

---

## Success!

Once done:
- ✅ Backend accessible at Railway URL
- ✅ Frontend on Vercel can communicate with backend
- ✅ Google Login should work
- ✅ No more "Failed to fetch" errors!
