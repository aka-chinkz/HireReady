# Fix CORS Error - New Vercel URL

## The Problem

You're seeing this CORS error:
```
Access to fetch at 'https://career-path-planner-backend-production.up.railway.app/api/auth/google' 
from origin 'https://hireready-bg2fz7pjr-kaushals-projects-a98125ae.vercel.app' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present
```

**What this means:**
- ✅ API URL is correct now (no more malformed URL!)
- ❌ Your **new Vercel URL** is not in Railway's `ALLOWED_ORIGINS`
- ❌ Railway is blocking requests from this Vercel URL

**Your current Vercel URL:**
```
https://hireready-bg2fz7pjr-kaushals-projects-a98125ae.vercel.app
```

---

## Solution: Add New Vercel URL to Railway

### Step 1: Go to Railway Variables

1. Go to **Railway Dashboard**
2. Go to your backend service → **"Variables"** tab
3. Find `ALLOWED_ORIGINS`

### Step 2: Update ALLOWED_ORIGINS

1. **Click to edit** `ALLOWED_ORIGINS`
2. **Add your new Vercel URL** to the list

**Current value might be:**
```
http://localhost:3000,https://hireready-ihdgsec07-kaushals-projects-a98125ae.vercel.app
```

**Update to include the new URL:**
```
http://localhost:3000,https://hireready-ihdgsec07-kaushals-projects-a98125ae.vercel.app,https://hireready-bg2fz7pjr-kaushals-projects-a98125ae.vercel.app
```

**OR use wildcard (easier):**
```
http://localhost:3000,https://*.vercel.app
```

The wildcard `https://*.vercel.app` will allow **all** Vercel URLs to work!

### Step 3: Save

1. **Save** the changes
2. Railway will automatically redeploy
3. Wait 1-2 minutes for redeployment

### Step 4: Test Again

1. Go back to your Vercel app
2. Try Google Login again
3. Should work now! ✅

---

## Better Solution: Use Wildcard

Instead of adding each Vercel URL individually, use a wildcard:

**In Railway `ALLOWED_ORIGINS`:**
```
http://localhost:3000,https://*.vercel.app
```

This allows **all** Vercel preview/production URLs to work, so you won't have this problem again!

---

## Quick Fix Steps

1. ✅ **Railway** → Variables → Edit `ALLOWED_ORIGINS`
2. ✅ **Add:** `https://hireready-bg2fz7pjr-kaushals-projects-a98125ae.vercel.app`
   OR use wildcard: `https://*.vercel.app`
3. ✅ **Save** → Railway redeploys automatically
4. ✅ **Wait 1-2 minutes**
5. ✅ **Test** Google Login

---

## Why This Happens

Vercel creates **different URLs** for different deployments:
- `hireready-ihdgsec07-kaushals-projects-a98125ae.vercel.app` (old one)
- `hireready-bg2fz7pjr-kaushals-projects-a98125ae.vercel.app` (new one)
- `hireready-kaushals-projects-a98125ae.vercel.app` (another variant)

Each unique URL needs to be in `ALLOWED_ORIGINS`, OR use the wildcard to cover all of them.

---

## Recommended Configuration

**In Railway `ALLOWED_ORIGINS`:**
```
http://localhost:3000,https://*.vercel.app
```

**If you have custom domain (once DNS is configured):**
```
http://localhost:3000,https://*.vercel.app,https://hireready.com,https://www.hireready.com
```

This covers:
- ✅ Local development
- ✅ All Vercel URLs (current and future)
- ✅ Custom domain (when ready)

---

## After Fixing

Once `ALLOWED_ORIGINS` includes your Vercel URL:
1. ✅ CORS error will disappear
2. ✅ Google Login will work
3. ✅ API calls will succeed

Update Railway `ALLOWED_ORIGINS` and you're good to go! 🚀
