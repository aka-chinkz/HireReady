# Google OAuth Credentials Setup

## Quick Reference

Based on your existing setup, here are the credentials you need:

### Backend (`.env` file in `backend/` directory):
```env
GOOGLE_CLIENT_ID=239752066498-5n66f47qhr0c9kii5seof03k50b4qh5j.apps.googleusercontent.com
```

### Frontend (`.env.local` file in `frontend/` directory):
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=239752066498-5n66f47qhr0c9kii5seof03k50b4qh5j.apps.googleusercontent.com
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Important Notes

1. **GOOGLE_CLIENT_SECRET is NOT needed** - Your implementation uses Google ID tokens (not OAuth 2.0 authorization code flow), so you only need the Client ID.

2. **Same Client ID for both** - Use the same Google Client ID in both backend and frontend.

3. **Your Client ID** - Your current Client ID is: `239752066498-5n66f47qhr0c9kii5seof03k50b4qh5j.apps.googleusercontent.com`

## How to Get Your Own Google Client ID

If you need to create new credentials:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. Application type: **Web application**
6. Name: **HireReady Web Client**
7. **Authorized JavaScript origins:**
   - `http://localhost:3000` (for development)
   - `https://your-production-domain.com` (for production)
8. **Authorized redirect URIs:**
   - `http://localhost:3000` (for development)
   - `https://your-production-domain.com` (for production)
9. Click **Create**
10. Copy the **Client ID** (it looks like: `xxxxx-xxxxx.apps.googleusercontent.com`)

## Setup Steps

1. **Backend `.env` file** (`backend/.env`):
   ```env
   GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
   DATABASE_URL=your-database-url-here
   ```

2. **Frontend `.env.local` file** (`frontend/.env.local`):
   ```env
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

3. **Restart both servers** after adding environment variables.

## For Production (Vercel)

Add these environment variables in Vercel dashboard:
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` = your-client-id
- `NEXT_PUBLIC_API_URL` = your-backend-url

Make sure to also add your production domain to Google Cloud Console's authorized JavaScript origins.
