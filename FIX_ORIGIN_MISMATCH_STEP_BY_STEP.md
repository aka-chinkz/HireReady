# Fix Origin Mismatch Error - Step by Step

## The Problem

**Error 400: origin_mismatch** means the URL you're accessing your app from is NOT in Google Cloud Console's "Authorized JavaScript origins" list.

## Step 1: Find Your Exact URL

Look at your browser's address bar. What URL are you using?

**Common scenarios:**
- Local: `http://localhost:3000` or `http://localhost:3001`
- Vercel: `https://your-app-name.vercel.app` or `https://your-app-name-git-main-username.vercel.app`

**Write down the EXACT URL here:** _______________________

## Step 2: Go to Google Cloud Console

1. Open: https://console.cloud.google.com/
2. Make sure you're in the **correct project** (the one with your OAuth client)
3. Click the **hamburger menu** (☰) in the top left
4. Go to **APIs & Services** → **Credentials**

## Step 3: Find Your OAuth Client

1. Look for **OAuth 2.0 Client IDs** section
2. Find the client with ID: `239752066498-5n66f47qhr0c9kii5seof03k50b4qh5j`
3. Click the **pencil icon** (✏️) or **edit icon** to edit it

## Step 4: Add Your URL to Authorized JavaScript Origins

1. Scroll down to **Authorized JavaScript origins**
2. Click **+ ADD URI** button
3. Enter your EXACT URL:
   - If local: `http://localhost:3000` (no trailing slash!)
   - If Vercel: `https://your-exact-vercel-url.vercel.app` (no trailing slash!)
4. Click **SAVE** (the checkmark or save button)

**IMPORTANT:**
- Must include `http://` or `https://`
- NO trailing slash (don't add `/` at the end)
- Must match EXACTLY what's in your browser address bar

## Step 5: Add to Authorized Redirect URIs (if shown)

1. Scroll to **Authorized redirect URIs**
2. Click **+ ADD URI**
3. Add the SAME URL you added above
4. Click **SAVE**

## Step 6: Save Everything

1. Scroll to the bottom of the page
2. Click **SAVE** button
3. Wait for confirmation message

## Step 7: Wait 2-5 Minutes

Google's changes can take 2-5 minutes to propagate. Be patient!

## Step 8: Clear Browser Cache

**Option A: Hard Refresh**
- Windows/Linux: `Ctrl + Shift + R` or `Ctrl + F5`
- Mac: `Cmd + Shift + R`

**Option B: Clear Cache**
- Press `Ctrl + Shift + Delete` (Windows) or `Cmd + Shift + Delete` (Mac)
- Select "Cached images and files"
- Click "Clear data"

**Option C: Use Incognito/Private Window**
- This bypasses cache completely
- Press `Ctrl + Shift + N` (Chrome) or `Ctrl + Shift + P` (Firefox)

## Step 9: Try Again

1. Close all browser tabs with your app
2. Open a new tab (or incognito window)
3. Go to your app URL
4. Try Google login again

## Common Mistakes to Avoid

❌ **Wrong:** `localhost:3000` (missing http://)
❌ **Wrong:** `http://localhost:3000/` (has trailing slash)
❌ **Wrong:** `https://localhost:3000` (wrong protocol for local)
✅ **Correct:** `http://localhost:3000`

❌ **Wrong:** `your-app.vercel.app` (missing https://)
❌ **Wrong:** `https://your-app.vercel.app/` (has trailing slash)
✅ **Correct:** `https://your-app.vercel.app`

## If You're Using Vercel

**You need to add ALL possible Vercel URLs:**

1. Main URL: `https://your-app-name.vercel.app`
2. Preview URLs: `https://your-app-name-git-main-username.vercel.app`
3. Any custom domain: `https://your-custom-domain.com`

Add each one separately in Google Cloud Console!

## Still Not Working?

### Check 1: Verify the URL in Google Console
1. Go back to Google Cloud Console
2. Edit your OAuth client
3. Check "Authorized JavaScript origins"
4. Make sure your URL is EXACTLY there (copy-paste from browser address bar)

### Check 2: Check Browser Console
1. Press `F12` to open Developer Tools
2. Go to **Console** tab
3. Look for any error messages
4. Share the exact error if you see one

### Check 3: Verify Client ID
1. Check your `frontend/.env.local` file
2. Make sure `NEXT_PUBLIC_GOOGLE_CLIENT_ID` matches: `239752066498-5n66f47qhr0c9kii5seof03k50b4qh5j.apps.googleusercontent.com`
3. Restart your frontend server after checking

### Check 4: Multiple OAuth Clients?
- Make sure you're editing the RIGHT OAuth client
- The one with Client ID ending in: `...5n66f47qhr0c9kii5seof03k50b4qh5j.apps.googleusercontent.com`

## Quick Checklist

- [ ] Found the EXACT URL from browser address bar
- [ ] Went to Google Cloud Console → APIs & Services → Credentials
- [ ] Found and clicked edit on the correct OAuth client
- [ ] Added URL to "Authorized JavaScript origins" (with http:// or https://, no trailing slash)
- [ ] Added URL to "Authorized redirect URIs" (same URL)
- [ ] Clicked SAVE
- [ ] Waited 2-5 minutes
- [ ] Cleared browser cache or used incognito mode
- [ ] Tried logging in again

## Need Help?

If it's still not working, please share:
1. The EXACT URL from your browser address bar
2. A screenshot of your Google Cloud Console "Authorized JavaScript origins" section
3. Any error messages from browser console (F12 → Console tab)
