# Fix Google OAuth Origin Mismatch Error

## The Problem

You're seeing: **"Error 400: origin_mismatch"**

This means your **Vercel deployment URL** is not added to Google Cloud Console's authorized origins.

## Solution: Add Your Vercel URL to Google Cloud Console

### Step 1: Find Your Vercel Deployment URL

1. Go to **Vercel Dashboard**: https://vercel.com/dashboard
2. Click on your project
3. Look at the **"Deployments"** tab
4. Find the **production deployment** (usually at the top)
5. Copy the deployment URL (should look like):
   ```
   https://your-project-name.vercel.app
   ```
   OR if you have a custom domain:
   ```
   https://your-custom-domain.com
   ```

**Note:** If you see multiple URLs, use the **production/main** deployment URL.

### Step 2: Go to Google Cloud Console

1. Go to: https://console.cloud.google.com/
2. Sign in with your Google account
3. Select your project (the one with your OAuth credentials)

### Step 3: Navigate to OAuth Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Find your OAuth 2.0 Client ID:
   - Client ID: `239752066498-5n66f47qhr0c9kii5seof03k50b4qh5j.apps.googleusercontent.com`
3. Click on it to edit

### Step 4: Add Authorized JavaScript Origins

In the OAuth client settings, find **"Authorized JavaScript origins"** section:

1. Click **"+ Add URI"** button
2. Add your Vercel URL (exactly as shown, with `https://`):
   ```
   https://your-vercel-project.vercel.app
   ```
   
   **Important:** 
   - Must start with `https://`
   - Must NOT end with `/`
   - Use the exact URL from Vercel

3. **If you have multiple Vercel preview URLs**, you might also want to add:
   ```
   https://*.vercel.app
   ```
   (This wildcard allows all Vercel preview deployments)

### Step 5: Add Authorized Redirect URIs (if needed)

Check if you also need to add redirect URIs:

1. In the same OAuth client settings
2. Find **"Authorized redirect URIs"** section
3. Add your Vercel URL + callback path:
   ```
   https://your-vercel-project.vercel.app/api/auth/callback
   ```
   OR if your callback is different:
   ```
   https://your-vercel-project.vercel.app/callback
   ```

### Step 6: Save Changes

1. Click **"Save"** at the bottom
2. Wait 1-2 minutes for changes to propagate

### Step 7: Test Again

1. Go back to your Vercel app
2. Try Google Login again
3. It should work now!

## Current URLs You Might Need to Add

Based on your setup, you might need these:

### Authorized JavaScript Origins:
```
https://hireready-ihdgsec07-kaushals-projects-a98125ae.vercel.app
```

If you have a custom domain or different production URL, add that too.

### Also Keep:
```
http://localhost:3000
```

(For local development)

## Common Issues

### Issue 1: Changes Not Applied Immediately

**Solution:** Wait 1-2 minutes after saving in Google Cloud Console. Changes can take a moment to propagate.

### Issue 2: Wrong URL Format

**Wrong:**
```
your-vercel-project.vercel.app  ❌ (missing https://)
https://your-vercel-project.vercel.app/  ❌ (trailing slash)
```

**Correct:**
```
https://your-vercel-project.vercel.app  ✅
```

### Issue 3: Multiple Vercel URLs

If Vercel creates preview deployments with different URLs:
- Add each specific URL you need
- OR use wildcard: `https://*.vercel.app`

## Quick Checklist

- [ ] Found your Vercel deployment URL
- [ ] Opened Google Cloud Console → APIs & Services → Credentials
- [ ] Edited OAuth Client ID
- [ ] Added Vercel URL to "Authorized JavaScript origins"
- [ ] Added redirect URI if needed
- [ ] Saved changes in Google Cloud Console
- [ ] Waited 1-2 minutes
- [ ] Tested Google Login on Vercel deployment

## Still Not Working?

1. **Double-check the URL:**
   - Make sure it matches exactly (no typos)
   - Must be `https://` not `http://`
   - No trailing slash

2. **Check browser console:**
   - Open browser DevTools (F12)
   - Look for any errors in Console tab
   - Share any errors you see

3. **Verify Vercel environment variables:**
   - Make sure `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set correctly
   - Make sure `NEXT_PUBLIC_API_URL` points to Railway backend

4. **Clear browser cache:**
   - Hard refresh (Ctrl+F5)
   - Or try incognito window
