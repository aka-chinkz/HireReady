# Fix "Failed to fetch" Error

## The Problem

You're seeing **"Failed to fetch"** error in your Vercel app.

This usually means:
- ❌ Frontend can't reach the backend API
- ❌ Backend URL is incorrect or not set
- ❌ CORS configuration issue
- ❌ Backend is not responding

---

## Quick Diagnosis

### Step 1: Check Vercel Environment Variables

1. Go to **Vercel Dashboard** → Your Project
2. Go to **Settings** → **Environment Variables**
3. Check `NEXT_PUBLIC_API_URL`:
   - Should be: `https://career-path-planner-backend-production.up.railway.app`
   - Make sure there's no typo
   - Make sure it starts with `https://`

### Step 2: Check Railway Backend is Running

1. Go to **Railway Dashboard**
2. Check your backend service status
3. Should show: **"Online"** ✅
4. Visit the backend URL directly:
   ```
   https://career-path-planner-backend-production.up.railway.app/health
   ```
   - Should return: `{"status": "healthy"}`

### Step 3: Check Browser Console

1. Open your Vercel app
2. Press **F12** to open DevTools
3. Go to **Console** tab
4. Look for error messages
5. Go to **Network** tab
6. Try to trigger the error again
7. Check what request failed and what the error is

---

## Common Fixes

### Fix 1: Verify Environment Variable

**Problem:** `NEXT_PUBLIC_API_URL` is wrong or missing

**Solution:**
1. **Vercel** → Settings → Environment Variables
2. Make sure `NEXT_PUBLIC_API_URL` is:
   ```
   https://career-path-planner-backend-production.up.railway.app
   ```
3. **Remove trailing slash** (no `/` at the end)
4. **Redeploy** Vercel after updating

### Fix 2: Check Railway Backend is Accessible

**Problem:** Backend is down or not accessible

**Solution:**
1. Test backend directly:
   - Visit: `https://career-path-planner-backend-production.up.railway.app/health`
   - Should see: `{"status": "healthy"}`
2. If backend is down:
   - Check Railway logs for errors
   - Make sure `DATABASE_URL` is set correctly
   - Verify all environment variables are set

### Fix 3: Verify CORS Configuration

**Problem:** Railway backend not allowing requests from Vercel

**Solution:**
1. **Railway** → Variables tab
2. Check `ALLOWED_ORIGINS` includes your Vercel URL:
   ```
   http://localhost:3000,https://hireready-kaushals-projects-a98125ae.vercel.app
   ```
   OR if using custom domain:
   ```
   http://localhost:3000,https://hireready.com
   ```
3. **Make sure URL matches exactly** (no trailing slash)
4. Railway will redeploy automatically after updating

### Fix 4: Check API Endpoint Paths

**Problem:** API endpoint paths might be wrong

**Solution:**
1. Check what endpoint the app is trying to call
2. Verify the endpoint exists in Railway backend
3. Check Network tab in browser DevTools to see the exact URL being called

---

## Step-by-Step Debugging

### Step 1: Verify Environment Variables

**In Vercel:**
```
NEXT_PUBLIC_API_URL=https://career-path-planner-backend-production.up.railway.app
NEXT_PUBLIC_GOOGLE_CLIENT_ID=239752066498-5n66f47qhr0c9kii5seof03k50b4qh5j.apps.googleusercontent.com
```

**In Railway:**
```
DATABASE_URL=postgresql://neondb_owner:...@host/neondb?sslmode=require
GOOGLE_CLIENT_ID=239752066498-5n66f47qhr0c9kii5seof03k50b4qh5j.apps.googleusercontent.com
ALLOWED_ORIGINS=http://localhost:3000,https://hireready-kaushals-projects-a98125ae.vercel.app
```

### Step 2: Test Backend Directly

1. Visit: `https://career-path-planner-backend-production.up.railway.app/health`
2. Should see: `{"status": "healthy"}`
3. If not working, check Railway logs

### Step 3: Check Browser Network Tab

1. Open DevTools (F12)
2. Go to **Network** tab
3. Try to trigger the error
4. Find the failed request (usually red)
5. Click on it to see:
   - **Request URL** - What URL is being called?
   - **Status Code** - What error code?
   - **Error Message** - What's the exact error?

### Step 4: Check CORS Headers

If the request shows a CORS error:
1. The backend is responding but CORS is blocking it
2. Check `ALLOWED_ORIGINS` in Railway includes your Vercel URL
3. Make sure URL matches exactly

---

## Common Error Messages

### "Failed to fetch"
- **Cause:** Can't reach backend
- **Fix:** Check backend URL and that backend is running

### "CORS error" or "Access-Control-Allow-Origin"
- **Cause:** CORS not configured correctly
- **Fix:** Update `ALLOWED_ORIGINS` in Railway

### "404 Not Found"
- **Cause:** Wrong API endpoint URL
- **Fix:** Check the endpoint path in your code

### "500 Internal Server Error"
- **Cause:** Backend error
- **Fix:** Check Railway logs for backend errors

---

## Quick Checklist

- [ ] Backend is "Online" in Railway
- [ ] Backend `/health` endpoint works
- [ ] `NEXT_PUBLIC_API_URL` is set correctly in Vercel
- [ ] `ALLOWED_ORIGINS` includes Vercel URL in Railway
- [ ] Vercel has been redeployed after updating environment variables
- [ ] No typos in URLs
- [ ] No trailing slashes in URLs

---

## Still Not Working?

1. **Check Railway logs:**
   - Railway → Deployments → View logs
   - Look for any errors or warnings

2. **Check Vercel logs:**
   - Vercel → Deployments → View function logs
   - Look for any errors

3. **Check browser console:**
   - F12 → Console tab
   - Look for any JavaScript errors

4. **Test backend directly:**
   - Visit backend URL in browser
   - Should see API information

5. **Share the exact error:**
   - What error message do you see?
   - What's in the Network tab?
   - What's the request URL that failed?

---

## Most Likely Causes

1. **Environment variable not set or wrong** - Check `NEXT_PUBLIC_API_URL` in Vercel
2. **Backend not accessible** - Test backend URL directly
3. **CORS issue** - Check `ALLOWED_ORIGINS` in Railway
4. **Backend crashed** - Check Railway logs

Check these in order and you should find the issue!
