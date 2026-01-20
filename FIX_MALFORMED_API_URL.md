# Fix Malformed API URL Error

## The Problem

Your error shows a malformed URL:
```
POST https://career-path-planner-backend-production.up.railway.app%20%20%20%20%20https//career-path-planner-backend-production.up.railway.app/api/auth/google
```

**Issues:**
- Extra spaces (`%20%20%20%20%20` = 5 spaces)
- Missing colon (`https//` instead of `https://`)
- URL appears duplicated

This means `NEXT_PUBLIC_API_URL` in Vercel has extra spaces or is malformed.

---

## Solution: Fix NEXT_PUBLIC_API_URL in Vercel

### Step 1: Go to Vercel Environment Variables

1. Go to **Vercel Dashboard**: https://vercel.com/dashboard
2. Click on your **"HireReady"** project
3. Go to **Settings** → **Environment Variables**

### Step 2: Edit NEXT_PUBLIC_API_URL

1. Find `NEXT_PUBLIC_API_URL` in the list
2. Click to **edit** it
3. **Delete the entire value**
4. **Type it fresh** (don't copy-paste):
   ```
   https://career-path-planner-backend-production.up.railway.app
   ```

**Important:**
- ✅ NO spaces before or after
- ✅ NO trailing slash (`/`)
- ✅ Starts with `https://` (with colon!)
- ✅ Exact URL: `career-path-planner-backend-production.up.railway.app`

### Step 3: Save and Redeploy

1. Click **"Save"**
2. **Redeploy** your Vercel app:
   - Go to **Deployments** tab
   - Click **"Redeploy"** on the latest deployment
   - OR make a small code change and push to trigger redeploy

---

## What the Correct Value Should Be

**Correct:**
```
https://career-path-planner-backend-production.up.railway.app
```

**Wrong (what you might have):**
```
https://career-path-planner-backend-production.up.railway.app     (extra spaces)
https://career-path-planner-backend-production.up.railway.app/   (trailing slash)
https://career-path-planner-backend-production.up.railway.app https://... (duplicated)
```

---

## Quick Fix Steps

1. ✅ **Vercel** → Settings → Environment Variables
2. ✅ **Edit** `NEXT_PUBLIC_API_URL`
3. ✅ **Delete** old value completely
4. ✅ **Type fresh:** `https://career-path-planner-backend-production.up.railway.app`
5. ✅ **Save**
6. ✅ **Redeploy** Vercel
7. ✅ **Test** Google Login again

---

## Verify It's Fixed

After redeploying:

1. **Check the Network tab** in browser DevTools (F12)
2. **Try Google Login** again
3. **Look at the request URL** - should be:
   ```
   https://career-path-planner-backend-production.up.railway.app/api/auth/google
   ```
4. **Should NOT have:**
   - Extra spaces
   - Missing colon
   - Duplicated URL

---

## Why This Happened

Common causes:
- Copy-pasted with extra spaces
- Accidentally added spaces when editing
- Multiple values concatenated together
- Trailing spaces not visible

**Solution:** Always type the URL fresh or copy it carefully without spaces.

---

## After Fixing

Once `NEXT_PUBLIC_API_URL` is correct:
1. ✅ Google Login should work
2. ✅ No more "Failed to fetch" errors
3. ✅ API calls should succeed

Fix the environment variable and redeploy - that should solve it! 🚀
