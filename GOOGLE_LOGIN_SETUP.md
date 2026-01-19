# Google Login Setup Guide

This guide explains how to set up Google OAuth authentication for HireReady.

## Overview

The application now uses Google OAuth for user authentication. Users must sign in with their Google account before accessing the application.

## Prerequisites

1. A Google Cloud Platform (GCP) account
2. A GCP project
3. OAuth 2.0 credentials (Client ID)

## Step 1: Create Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. Create OAuth 2.0 credentials:
   - Navigate to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - If prompted, configure the OAuth consent screen first:
     - User Type: External (for public use) or Internal (for workspace users)
     - App name: HireReady
     - User support email: your email
     - Developer contact: your email
     - Click "Save and Continue"
     - Scopes: Add `email`, `profile`, `openid`
     - Test users: Add your email if using "Testing" mode
     - Click "Save and Continue"

5. Create OAuth Client ID:
   - Application type: Web application
   - Name: HireReady Web Client
   - Authorized JavaScript origins:
     - `http://localhost:3000` (for development)
     - `https://yourdomain.com` (for production)
   - Authorized redirect URIs:
     - `http://localhost:3000` (for development)
     - `https://yourdomain.com` (for production)
   - Click "Create"
   - **Copy the Client ID** - you'll need this for configuration

## Step 2: Backend Configuration

1. Add the Google Client ID to your backend `.env` file:

```env
GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
```

2. Install backend dependencies (if not already installed):

```bash
cd backend
pip install -r requirements.txt
```

The following packages are required:
- `google-auth==2.23.4`
- `pyjwt==2.8.0`

3. Run database migration to update the User model:

```bash
cd backend
npx prisma migrate dev --name add_google_auth
npx prisma generate
```

This will add the following fields to the User model:
- `googleId` (unique, optional)
- `email` (optional)
- Made onboarding fields optional (since users log in first)

## Step 3: Frontend Configuration

1. Create a `.env.local` file in the `frontend` directory (if it doesn't exist):

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Important**: The `NEXT_PUBLIC_` prefix is required for Next.js to expose the variable to the browser.

2. Restart your frontend development server after adding environment variables:

```bash
cd frontend
npm run dev
```

## Step 4: Testing

1. Start the backend server:

```bash
cd backend
uvicorn main:app --reload
```

2. Start the frontend server:

```bash
cd frontend
npm run dev
```

3. Navigate to `http://localhost:3000`
4. You should see the Google login page
5. Click "Sign in with Google"
6. Select your Google account
7. After authentication, you'll be redirected to onboarding (if new user) or dashboard (if returning user)

## Architecture

### Backend

**Endpoint: POST `/api/auth/google`**

- Receives Google ID token from frontend
- Verifies token with Google's servers
- Creates or finds user in database
- Returns user ID, email, and onboarding status

**Endpoint: GET `/api/auth/verify/{user_id}`**

- Verifies that a user exists and is authenticated
- Returns user info and onboarding status

### Frontend

**GoogleLogin Component**

- Loads Google Identity Services script
- Renders Google Sign-In button
- Handles authentication callback
- Sends token to backend
- Stores user ID in localStorage

**Home Page Flow**

1. Check if user is authenticated (localStorage)
2. If not authenticated → Show GoogleLogin component
3. If authenticated but no onboarding → Show OnboardingFlow
4. If authenticated and onboarded → Show Dashboard

### Database Changes

The User model has been updated:

```prisma
model User {
  // Authentication
  googleId        String?   @unique
  email           String?
  
  // Onboarding (now optional)
  careerStream    String?
  universityYear  Int?
  graduationYear  Int?
  country         String?
  // ... other fields
}
```

## Security Considerations

1. **Token Verification**: All Google tokens are verified server-side with Google's servers
2. **Environment Variables**: Never commit `.env` files to version control
3. **HTTPS in Production**: Always use HTTPS in production
4. **Client ID Exposure**: The Google Client ID can be public (it's exposed in the frontend), but ensure your OAuth consent screen is properly configured

## Troubleshooting

### "Invalid token" error

- Check that `GOOGLE_CLIENT_ID` in backend `.env` matches your Google Cloud Console Client ID
- Ensure the token hasn't expired (tokens expire after 1 hour)
- Verify that the authorized JavaScript origins include your domain

### "Failed to load Google Sign-In"

- Check that `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set in `frontend/.env.local`
- Ensure the Google Identity Services script can load (check browser console for network errors)
- Verify your domain is added to authorized JavaScript origins

### User not found after login

- Check database connection
- Verify Prisma migrations have been run
- Check backend logs for errors

### Onboarding fields are null

- This is expected for new users
- Users will complete onboarding after Google login
- Onboarding fields are now optional to support this flow

## Production Deployment

1. Update authorized JavaScript origins in Google Cloud Console:
   - Add your production domain (e.g., `https://hireready.com`)

2. Update environment variables:
   - Backend: Set `GOOGLE_CLIENT_ID` in production environment
   - Frontend: Set `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in production build

3. Ensure HTTPS is enabled (required for OAuth in production)

4. Update OAuth consent screen:
   - Submit for verification if using external user type
   - Add production domain to authorized domains

## Migration from Old System

If you have existing users using the old authentication system:

1. The old system stored user IDs in localStorage
2. New system requires Google authentication
3. Existing users will need to sign in with Google
4. You may want to implement a migration script to link old accounts to Google accounts (optional)

## Additional Resources

- [Google Identity Services Documentation](https://developers.google.com/identity/gsi/web)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [FastAPI Authentication Guide](https://fastapi.tiangolo.com/tutorial/security/)