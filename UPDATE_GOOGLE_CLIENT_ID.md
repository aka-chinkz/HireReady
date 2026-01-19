# Update Google Client ID - Quick Guide

## Your New Client ID

**Client ID:** `239752066498-5n66f47qhr0c9kii5seof03k50b4qh5j.apps.googleusercontent.com`

**Important:** You do NOT need a Client Secret for this implementation. Your app uses Google ID tokens, which only require the Client ID.

## Step 1: Update Backend `.env` File

Edit `backend/.env` and update:
```env
GOOGLE_CLIENT_ID=239752066498-5n66f47qhr0c9kii5seof03k50b4qh5j.apps.googleusercontent.com
```

## Step 2: Update Frontend `.env.local` File

Edit `frontend/.env.local` and update:
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=239752066498-5n66f47qhr0c9kii5seof03k50b4qh5j.apps.googleusercontent.com
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Step 3: Configure Google Cloud Console

**CRITICAL:** Make sure you've added these URLs to your OAuth client in Google Cloud Console:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your OAuth 2.0 Client ID (the one ending in `.apps.googleusercontent.com`)
4. Under **Authorized JavaScript origins**, add:
   - `http://localhost:3000` (for local development)
   - `https://your-vercel-app.vercel.app` (your Vercel deployment URL - replace with actual URL)
5. Under **Authorized redirect URIs**, add:
   - `http://localhost:3000`
   - `https://your-vercel-app.vercel.app`
6. Click **SAVE**

## Step 4: Restart Your Servers

**Backend:**
```bash
cd backend
# Stop the server (Ctrl+C if running)
# Then restart:
python -m uvicorn main:app --reload
```

**Frontend:**
```bash
cd frontend
# Stop the server (Ctrl+C if running)
# Then restart:
npm run dev
```

## Step 5: For Vercel Deployment

If you're deploying to Vercel, add this environment variable in Vercel dashboard:

1. Go to your Vercel project → **Settings** → **Environment Variables**
2. Add:
   - **Name:** `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
   - **Value:** `239752066498-5n66f47qhr0c9kii5seof03k50b4qh5j.apps.googleusercontent.com`
   - **Environment:** Production, Preview, Development (select all)
3. Click **Save**
4. Redeploy your app

**Also make sure to add your Vercel URL to Google Cloud Console's Authorized JavaScript origins!**

## Verification Checklist

- [ ] Updated `backend/.env` with new Client ID
- [ ] Updated `frontend/.env.local` with new Client ID
- [ ] Added `http://localhost:3000` to Google Cloud Console
- [ ] Added your Vercel URL to Google Cloud Console (if deployed)
- [ ] Restarted backend server
- [ ] Restarted frontend server
- [ ] Added environment variable to Vercel (if deployed)
- [ ] Cleared browser cache or tried incognito mode

## Testing

1. Open your app in browser
2. Try to sign in with Google
3. If you get "origin_mismatch" error, make sure you added the correct URL to Google Cloud Console
4. Wait 2-5 minutes after saving in Google Console for changes to propagate

## Troubleshooting

**Still getting "origin_mismatch" error?**
- Double-check the exact URL you're accessing the app from
- Make sure it's added to Google Cloud Console (including `http://` or `https://`)
- Wait 2-5 minutes after saving
- Clear browser cache or use incognito mode

**Client Secret Note:**
- You mentioned a "client secret" but it's the same as your Client ID
- This is fine - you don't need a Client Secret for this implementation
- Your app uses Google ID tokens, which only require the Client ID
