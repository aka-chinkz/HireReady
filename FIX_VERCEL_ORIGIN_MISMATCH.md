# Fix Vercel Origin Mismatch Error

## The Problem

You're seeing: **"Error 400: origin_mismatch"**

The origin in the error is:
```
https://hireready-kaushals-projects-a98125ae.vercel.app
```

This URL is **not** added to Google Cloud Console's authorized origins.

## Solution: Add This Exact URL to Google Cloud Console

### Step 1: Go to Google Cloud Console

1. Go to: https://console.cloud.google.com/
2. Select your project (with OAuth credentials)
3. Go to **"APIs & Services"** → **"Credentials"**

### Step 2: Edit Your OAuth Client

1. Find your OAuth 2.0 Client ID:
   - Client ID: `239752066498-5n66f47qhr0c9kii5seof03k50b4qh5j.apps.googleusercontent.com`
2. Click on it to edit

### Step 3: Add the Exact URL to Authorized JavaScript Origins

1. Scroll to **"Authorized JavaScript origins"** section
2. Click **"+ Add URI"**
3. Add this **exact** URL:
   ```
   https://hireready-kaushals-projects-a98125ae.vercel.app
   ```
   
   **Important:**
   - Must start with `https://`
   - Must NOT end with `/`
   - Must match exactly: `hireready-kaushals-projects-a98125ae.vercel.app`

### Step 4: Save Changes

1. Click **"Save"** at the bottom
2. Wait 2-5 minutes for changes to propagate

### Step 5: Test Again

1. Go back to your Vercel app
2. Clear browser cache (Ctrl+F5)
3. Try Google Login again

## Why This Happens

Vercel can create **multiple URLs** for your deployment:
- `hireready-kaushals-projects-a98125ae.vercel.app` (this one in the error)
- `hireready-ihdgsec07-kaushals-projects-a98125ae.vercel.app` (the one we added before)
- `hireready-git-main-kaushals-projects-a98125ae.vercel.app` (another variant)

**Each unique URL must be added to Google Cloud Console!**

## Better Solution: Use Wildcard (Optional)

Instead of adding each URL individually, you can use a wildcard:

1. In **"Authorized JavaScript origins"**, add:
   ```
   https://*.vercel.app
   ```
   
   This allows **all** Vercel preview/production URLs to work.

**Note:** Some developers prefer adding specific URLs for security, while others use wildcards for convenience.

## Current URLs You Should Have

### Authorized JavaScript Origins:
```
http://localhost:3000
https://hireready-kaushals-projects-a98125ae.vercel.app  ← ADD THIS!
https://hireready-ihdgsec07-kaushals-projects-a98125ae.vercel.app (if still using)
https://*.vercel.app  (optional - covers all Vercel URLs)
```

## Quick Fix Steps

1. ✅ Open Google Cloud Console
2. ✅ Go to APIs & Services → Credentials
3. ✅ Edit your OAuth Client ID
4. ✅ Add: `https://hireready-kaushals-projects-a98125ae.vercel.app`
5. ✅ Save changes
6. ✅ Wait 2-5 minutes
7. ✅ Test Google Login

## Verify All Your Vercel URLs

Check your Vercel dashboard to see all active URLs:
- Go to Vercel Dashboard → Your Project → Settings → Domains
- Add each production/preview URL to Google Cloud Console
- Or use the wildcard `https://*.vercel.app` to cover all of them

## Still Not Working?

1. **Double-check the URL:**
   - Make sure there are no typos
   - Make sure it's exactly as shown in the error

2. **Check if you saved:**
   - Changes must be saved in Google Cloud Console
   - Wait a few minutes after saving

3. **Clear cache:**
   - Hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
   - Or try incognito/private window

4. **Verify in Google Cloud Console:**
   - Make sure the URL appears in the list after saving
