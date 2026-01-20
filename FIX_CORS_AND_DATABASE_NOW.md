# Fix CORS Error - Step by Step

## Current Issues

1. **CORS Error:** Backend not allowing requests from Vercel
2. **PostgreSQL Error:** Database connection failing (might be causing backend to crash)

---

## Step 1: Update Railway ALLOWED_ORIGINS (Do This First!)

1. **Railway Dashboard** → Your Backend Service
2. **Variables** tab → Find `ALLOWED_ORIGINS`
3. **Click to edit**
4. **Current value might be:**
   ```
   https://hireready-ihdgsec07-kaushals-projects-a98125ae.vercel.app
   ```
5. **Update to include the new URL:**
   ```
   http://localhost:3000,https://hireready-ihdgsec07-kaushals-projects-a98125ae.vercel.app,https://hireready-bg2fz7pjr-kaushals-projects-a98125ae.vercel.app
   ```
6. **Save** → Railway redeploys automatically

---

## Step 2: Verify Backend Code Was Deployed

The backend code with regex support should already be deployed (we committed it). But let's verify:

1. **Railway** → Deployments tab
2. **Check latest deployment** - should show commit: "Add CORS regex support for all Vercel URLs"
3. **Status should be:** "Active" ✅

---

## Step 3: Check PostgreSQL Connection

Your logs show a PostgreSQL connection error. This might be causing the backend to fail:

1. **Railway** → Variables tab
2. **Check `DATABASE_URL`:**
   - Should start with `postgresql://`
   - Should have `neondb` as database name (not shadow database)
   - Should have NO quotes around it
   - Should end with `?sslmode=require`

If `DATABASE_URL` is wrong, fix it:
- Get correct connection string from Neon (Pooled, database: `neondb`)
- Update in Railway
- Railway will redeploy

---

## Step 4: Wait and Test

After updating `ALLOWED_ORIGINS`:

1. **Wait 1-2 minutes** for Railway to redeploy
2. **Check Railway logs** - should see "Application startup complete" WITHOUT database errors
3. **Test backend directly:**
   - Visit: `https://career-path-planner-backend-production.up.railway.app/health`
   - Should return: `{"status": "healthy"}`
4. **Test Google Login** on Vercel

---

## Quick Checklist

- [ ] Updated Railway `ALLOWED_ORIGINS` with new Vercel URL
- [ ] Verified `DATABASE_URL` is correct (no quotes, `neondb` database)
- [ ] Railway redeployed successfully
- [ ] Backend `/health` endpoint works
- [ ] No PostgreSQL errors in Railway logs
- [ ] Tested Google Login

---

## If Still Not Working

1. **Check Railway logs** for exact errors
2. **Verify backend is online** - Status should be "Online" not "Crashed"
3. **Test backend directly** - `/health` endpoint should work
4. **Check browser Network tab** - See exact request/response

Update `ALLOWED_ORIGINS` first, then check the database connection issue!
