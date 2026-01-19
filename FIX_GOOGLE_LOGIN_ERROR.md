# Fix Google Login "origin_mismatch" Error

## The Problem

You're seeing this error:
- **Error 400: origin_mismatch**
- "You can't sign in to this app because it doesn't comply with Google's OAuth 2.0 policy"
- "Register the JavaScript origin in the Google Cloud Console"

This happens when the URL you're accessing the app from is NOT listed in Google Cloud Console's "Authorized JavaScript origins".

## Quick Fix Steps

### Step 1: Identify Your App URL

**If running locally:**
- Your app URL is: `http://localhost:3000` (or whatever port Next.js is using)

**If deployed on Vercel:**
- Your app URL is: `https://your-app-name.vercel.app` (check your Vercel deployment URL)

### Step 2: Add URL to Google Cloud Console

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/
   - Select your project

2. **Navigate to OAuth Credentials:**
   - Go to **APIs & Services** → **Credentials**
   - Find your OAuth 2.0 Client ID (the one ending in `.apps.googleusercontent.com`)
   - Click the **pencil icon** (Edit) next to it

3. **Add Authorized JavaScript Origins:**
   - Scroll to **Authorized JavaScript origins**
   - Click **+ ADD URI**
   - Add these URLs (one at a time):
     - `http://localhost:3000` (for local development)
     - `http://localhost:3001` (if you're using a different port)
     - `https://your-app-name.vercel.app` (your Vercel URL - replace with actual URL)
     - `https://your-custom-domain.com` (if you have a custom domain)

4. **Add Authorized Redirect URIs (if needed):**
   - Scroll to **Authorized redirect URIs**
   - Add the same URLs:
     - `http://localhost:3000`
     - `https://your-app-name.vercel.app`

5. **Save:**
   - Click **SAVE** at the bottom
   - Wait a few minutes for changes to propagate (can take up to 5 minutes)

### Step 3: Verify Your Environment Variables

**Check `frontend/.env.local`:**
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=1093221971662-321cmip64r5bjlvh42hhjtmog1pprkv9.apps.googleusercontent.com
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**For Vercel deployment, add in Vercel dashboard:**
- Go to your project → Settings → Environment Variables
- Add:
  - `NEXT_PUBLIC_GOOGLE_CLIENT_ID` = `1093221971662-321cmip64r5bjlvh42hhjtmog1pprkv9.apps.googleusercontent.com`
  - `NEXT_PUBLIC_API_URL` = your backend URL

### Step 4: Restart Your App

**If running locally:**
```bash
# Stop your frontend server (Ctrl+C)
# Then restart:
cd frontend
npm run dev
```

**If on Vercel:**
- The changes will apply automatically after you save in Google Cloud Console
- You may need to wait 2-5 minutes for Google's changes to propagate

## Common Issues

### Issue 1: Still getting error after adding URL
- **Wait 2-5 minutes** - Google's changes can take time to propagate
- **Clear browser cache** - Press Ctrl+Shift+Delete and clear cache
- **Try incognito/private window** - This ensures no cached OAuth data

### Issue 2: Different port locally
- If Next.js runs on port 3001 instead of 3000, add `http://localhost:3001` to Google Console
- Check what port your app is using in the terminal output

### Issue 3: Vercel URL not working
- Make sure you added the **exact** Vercel URL (including `https://`)
- Format: `https://your-app-name.vercel.app` (no trailing slash)
- Check your Vercel deployment URL in the Vercel dashboard

### Issue 4: Multiple Vercel URLs
- Vercel creates multiple URLs:
  - `https://your-app-name.vercel.app` (main)
  - `https://your-app-name-git-branch-username.vercel.app` (preview)
- Add **all** URLs you might use to Google Console

## Verification Checklist

- [ ] Added `http://localhost:3000` to Authorized JavaScript origins
- [ ] Added your Vercel URL to Authorized JavaScript origins (if deployed)
- [ ] Saved changes in Google Cloud Console
- [ ] Waited 2-5 minutes for changes to propagate
- [ ] Restarted your local dev server (if running locally)
- [ ] Cleared browser cache or tried incognito mode
- [ ] Verified `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set correctly in `.env.local` or Vercel

## Still Not Working?

1. **Check the exact error message** - Look for the specific URL that's being rejected
2. **Check browser console** - Open DevTools (F12) → Console tab → Look for OAuth errors
3. **Verify Client ID matches** - Make sure the Client ID in your `.env.local` matches the one in Google Console
4. **Check OAuth consent screen** - Go to APIs & Services → OAuth consent screen → Make sure it's configured

## Need Help?

If you're still stuck, share:
1. The exact URL you're accessing the app from
2. The error message from browser console (F12 → Console)
3. Screenshot of your Google Cloud Console "Authorized JavaScript origins" section
