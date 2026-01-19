# Railway: Configure Backend After Deployment

## The Problem

Railway deploys immediately without showing configuration options. That's okay! You can configure it **after** deployment.

## Solution: Configure After Service is Created

### Step 1: Let Railway Deploy (Even if it's Frontend)

1. Click **"GitHub Repository"**
2. Select: `aka-chinkz/HireReady`
3. Let Railway deploy (it will default to frontend - that's fine for now)

### Step 2: Configure the Service After Deployment

Once the service is deployed:

1. **Go to Architecture tab** (if not already there)
2. **Click on your service** (the service card/box)
3. A panel opens on the right
4. Click **"Settings"** tab in that panel
5. Scroll down to find these sections:

**Look for:**
- **"Root Directory"** or **"Working Directory"** field
- **"Build Command"** field
- **"Start Command"** field

### Step 3: Change Root Directory

1. Find **"Root Directory"** field
2. Change it from `frontend` (or empty) to: `backend`
3. Click **"Save"** or the changes auto-save
4. Railway will automatically redeploy with the new settings

### Step 4: Update Build Commands

After changing Root Directory, update:

**Build Command:**
```
pip install -r requirements.txt && prisma generate --schema=prisma/schema.prisma
```

**Start Command:**
```
uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Step 5: Set Environment Variables

1. Click **"Variables"** tab (in the service panel)
2. Add:
   ```
   DATABASE_URL=your-neon-connection-string
   GOOGLE_CLIENT_ID=239752066498-5n66f47qhr0c9kii5seof03k50b4qh5j.apps.googleusercontent.com
   ALLOWED_ORIGINS=http://localhost:3000,https://hireready-ihdgsec07-kaushals-projects-a98125ae.vercel.app
   ```

## Alternative: Use railway.json File

I've created `backend/railway.json`. After you commit and push it:

1. **Commit the file:**
   ```bash
   git add backend/railway.json
   git commit -m "Add Railway config"
   git push
   ```

2. **In Railway:**
   - Go to your service → Settings
   - Change Root Directory to: `backend`
   - Railway will detect the `railway.json` file and use those settings

## Step-by-Step After Deployment

1. ✅ Service is deployed (even if it's frontend)
2. ✅ Click on the service in Architecture view
3. ✅ Click "Settings" tab in the service panel
4. ✅ Find "Root Directory" field
5. ✅ Change to: `backend`
6. ✅ Update Build Command and Start Command
7. ✅ Add environment variables
8. ✅ Railway redeploys automatically
9. ✅ Generate public domain in Settings → Networking

## Where to Find Settings After Deployment

```
Railway Dashboard
  → Architecture tab
    → Click on your SERVICE (the box/card)
      → Settings tab (opens in right panel)
        → Scroll down
          → Root Directory ← HERE!
          → Build Command
          → Start Command
```

## Quick Fix

1. Let Railway deploy (it will be frontend initially)
2. Click on the deployed service
3. Settings tab → Change Root Directory to `backend`
4. Save → Railway redeploys as backend automatically!

The key is: **Configure AFTER deployment, not before!**
