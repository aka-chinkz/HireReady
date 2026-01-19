# Fix "Failed to fetch" Error on Vercel

## The Problem

You're seeing **"Failed to fetch"** error on your Vercel deployment. This means:
1. Your frontend can't reach your backend API
2. The `NEXT_PUBLIC_API_URL` environment variable is missing or incorrect in Vercel

## Your Vercel URL

Based on the error, your Vercel URL is:
**`https://hireready-ihdgsec07-kaushals-projects-a98125ae.vercel.app`**

## Step 1: Add Vercel URL to Google Cloud Console

**IMPORTANT:** Remove the trailing slash!

1. Go to: https://console.cloud.google.com/apis/credentials
2. Find your OAuth client: `239752066498-5n66f47qhr0c9kii5seof03k50b4qh5j`
3. Click **Edit** (pencil icon)
4. Under **Authorized JavaScript origins**, add:
   - `https://hireready-ihdgsec07-kaushals-projects-a98125ae.vercel.app` (NO trailing slash!)
5. Under **Authorized redirect URIs**, add:
   - `https://hireready-ihdgsec07-kaushals-projects-a98125ae.vercel.app` (NO trailing slash!)
6. Click **SAVE**
7. Wait 2-5 minutes

## Step 2: Set Backend API URL in Vercel

The "Failed to fetch" error means your frontend can't find your backend. You need to set `NEXT_PUBLIC_API_URL` in Vercel.

### Option A: If Your Backend is on Vercel Too

1. Go to your Vercel dashboard
2. Find your **backend** project
3. Copy the deployment URL (e.g., `https://your-backend.vercel.app`)
4. Go to your **frontend** project in Vercel
5. Settings → Environment Variables
6. Add:
   - **Name:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://your-backend.vercel.app` (your actual backend URL)
   - **Environment:** Production, Preview, Development
   - Click **Save**

### Option B: If Your Backend is on a Different Platform

1. Go to your frontend project in Vercel
2. Settings → Environment Variables
3. Add:
   - **Name:** `NEXT_PUBLIC_API_URL`
   - **Value:** Your backend URL (e.g., `https://api.yourdomain.com` or your backend service URL)
   - **Environment:** Production, Preview, Development
   - Click **Save**

### Option C: If Your Backend is Local/Not Deployed

You need to deploy your backend first! Options:
- Deploy backend to Vercel (create a separate Vercel project for backend)
- Use a service like Railway, Render, or Fly.io for your backend
- Use a cloud database and deploy backend separately

## Step 3: Add Google Client ID to Vercel

1. Go to your frontend project in Vercel
2. Settings → Environment Variables
3. Add:
   - **Name:** `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
   - **Value:** `239752066498-5n66f47qhr0c9kii5seof03k50b4qh5j.apps.googleusercontent.com`
   - **Environment:** Production, Preview, Development
   - Click **Save**

## Step 4: Redeploy

After adding environment variables:
1. Go to your Vercel project → **Deployments** tab
2. Click the **three dots** (⋯) on the latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete

## Step 5: Test

1. Go to: `https://hireready-ihdgsec07-kaushals-projects-a98125ae.vercel.app`
2. Try Google login
3. If you still see "Failed to fetch", check browser console (F12 → Console) for the exact error

## Vercel Environment Variables Checklist

Make sure these are set in Vercel (frontend project):

- [ ] `NEXT_PUBLIC_GOOGLE_CLIENT_ID` = `239752066498-5n66f47qhr0c9kii5seof03k50b4qh5j.apps.googleusercontent.com`
- [ ] `NEXT_PUBLIC_API_URL` = Your backend URL (e.g., `https://your-backend.vercel.app`)

## Google Cloud Console Checklist

- [ ] Added `https://hireready-ihdgsec07-kaushals-projects-a98125ae.vercel.app` to Authorized JavaScript origins (NO trailing slash)
- [ ] Added `https://hireready-ihdgsec07-kaushals-projects-a98125ae.vercel.app` to Authorized redirect URIs (NO trailing slash)
- [ ] Saved changes
- [ ] Waited 2-5 minutes

## Common Issues

### "Failed to fetch" still appears
- Check that `NEXT_PUBLIC_API_URL` is set correctly in Vercel
- Make sure your backend is actually running and accessible
- Check browser console (F12) for the exact error message
- Verify CORS is configured on your backend to allow requests from your Vercel domain

### Backend not deployed
- You MUST have a backend running somewhere
- It can't be `http://localhost:8000` - that only works locally
- Deploy your backend to Vercel, Railway, Render, or another service

### CORS errors
- Your backend needs to allow requests from `https://hireready-ihdgsec07-kaushals-projects-a98125ae.vercel.app`
- Check your backend CORS configuration

## Quick Summary

1. ✅ Add Vercel URL to Google Cloud Console (without trailing slash)
2. ✅ Set `NEXT_PUBLIC_API_URL` in Vercel to your backend URL
3. ✅ Set `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in Vercel
4. ✅ Redeploy your Vercel app
5. ✅ Wait 2-5 minutes for Google changes to propagate
6. ✅ Test login
