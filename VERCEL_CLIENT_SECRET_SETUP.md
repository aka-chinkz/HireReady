# Adding Google Client Secret to Vercel

## Important Note

**Your current implementation does NOT use Client Secret** - it uses Google ID tokens which only require the Client ID. However, if you want to add it to Vercel for future use or other purposes, here's how:

## Step 1: Get Your Actual Client Secret

The value you mentioned earlier (`239752066498-5n66f47qhr0c9kii5seof03k50b4qh5j.apps.googleusercontent.com`) is actually your **Client ID**, not the Client Secret.

To get your **actual Client Secret**:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Find your OAuth 2.0 Client ID (the one you just created)
4. Click on it to view details
5. Look for **Client secret** - it will be a different value (usually starts with `GOCSPX-` or similar)
6. If you don't see it, click **Reset secret** or **Download JSON** to get it

**Note:** Client secrets typically look like: `GOCSPX-xxxxxxxxxxxxxxxxxxxxx` (not like the Client ID)

## Step 2: Add to Vercel Environment Variables

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Click **Add New**
4. Add the following variables:

### For Client ID (Required):
- **Name:** `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- **Value:** `239752066498-5n66f47qhr0c9kii5seof03k50b4qh5j.apps.googleusercontent.com`
- **Environment:** Production, Preview, Development (select all)
- Click **Save**

### For Client Secret (Optional - not currently used):
- **Name:** `GOOGLE_CLIENT_SECRET`
- **Value:** `your-actual-client-secret-here` (get this from Google Cloud Console)
- **Environment:** Production, Preview, Development (select all)
- Click **Save**

**Important:** 
- Client Secret should NOT have `NEXT_PUBLIC_` prefix (it's server-side only)
- Client ID needs `NEXT_PUBLIC_` prefix (it's used in the browser)

## Step 3: Update Backend (If You Want to Use Client Secret)

Currently, your backend (`backend/app/routers/auth.py`) only uses `GOOGLE_CLIENT_ID`. If you want to use the Client Secret in the future, you would need to:

1. Add to `backend/.env`:
   ```env
   GOOGLE_CLIENT_ID=239752066498-5n66f47qhr0c9kii5seof03k50b4qh5j.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-actual-client-secret-here
   ```

2. Update your backend code to use it (if needed for a different OAuth flow)

## Current Implementation

Your current setup uses **Google ID tokens** which:
- ✅ Only require Client ID
- ✅ Are verified server-side
- ✅ Don't need Client Secret
- ✅ Are more secure for web apps

## Vercel Environment Variables Summary

**Required for your app:**
```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=239752066498-5n66f47qhr0c9kii5seof03k50b4qh5j.apps.googleusercontent.com
NEXT_PUBLIC_API_URL=your-backend-url
```

**Optional (not currently used):**
```
GOOGLE_CLIENT_SECRET=your-actual-client-secret-here
```

## After Adding to Vercel

1. **Redeploy your app** - Vercel will automatically use the new environment variables
2. **Verify it works** - Test Google login on your Vercel deployment
3. **Make sure Google Cloud Console has your Vercel URL** - Add it to Authorized JavaScript origins

## Troubleshooting

**Can't find Client Secret?**
- It's only shown once when you create the OAuth client
- If you lost it, you can reset it in Google Cloud Console
- Go to your OAuth client → Click "Reset secret" → Copy the new secret

**Client Secret not working?**
- Remember: Your current code doesn't use it
- It's only needed if you switch to OAuth 2.0 authorization code flow
- For ID tokens (current implementation), only Client ID is needed
