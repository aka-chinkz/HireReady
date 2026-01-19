# Where to Find Root Directory in Railway

## Important: It's in SERVICE Settings, Not Project Settings!

The "Root Directory" setting is **NOT** in Project Settings. It's in the **individual SERVICE settings**.

## How to Find Root Directory

### Method 1: When Adding a New Service

1. Click **"+ New"** → **"GitHub Repo"**
2. Select your repository
3. **Before clicking "Deploy"**, look for:
   - A **"Configure"** button or link
   - Or scroll down to see configuration options
   - Or click **"Advanced"** or **"Settings"** button
4. You should see **"Root Directory"** field there
5. Set it to: `backend`

### Method 2: Edit Existing Service

1. **Go back to Architecture view** (not Project Settings)
2. Click on your **service** (the box showing "career-path-planner-frontend")
3. This opens the service details panel
4. Click on the **"Settings"** tab (in the service panel, not project settings)
5. Scroll down - you should see **"Root Directory"** or **"Working Directory"**

### Method 3: Use the Service Settings Directly

1. In Railway dashboard, go to **"Architecture"** tab (not Settings)
2. Click on the service card/box (e.g., "career-path-planner-frontend")
3. A panel opens on the right
4. Click **"Settings"** tab in that panel
5. Look for **"Root Directory"** field
6. Change it to: `backend`

## Visual Guide

**Wrong Place (Project Settings):**
- You're here: Project → Settings → General
- ❌ Root Directory is NOT here

**Correct Place (Service Settings):**
- Go to: Architecture → Click Service → Settings tab
- ✅ Root Directory is HERE

## Step-by-Step Navigation

1. **Leave Project Settings:**
   - Click **"Architecture"** tab (top navigation)

2. **Click on Your Service:**
   - Click the service box/card (e.g., "career-path-planner-frontend")
   - A panel opens on the right side

3. **Open Service Settings:**
   - In the right panel, click **"Settings"** tab
   - (This is different from Project Settings!)

4. **Find Root Directory:**
   - Scroll down in the service settings
   - Look for **"Root Directory"** or **"Working Directory"**
   - It might be under "Build" or "Deploy" section

## Alternative: Delete and Re-add with Config

If you still can't find it:

1. **Delete the frontend service:**
   - Click on service → Settings → Scroll to bottom → Delete

2. **Add new service:**
   - Click "+ New" → GitHub Repo
   - Select repository
   - **Look for "Configure" or "Advanced" button**
   - Set Root Directory to: `backend`

3. **Or use the railway.json file:**
   - I've already created `backend/railway.json`
   - Commit and push it to GitHub
   - When adding service, Railway will detect it

## Quick Navigation Path

```
Railway Dashboard
  → Architecture tab (NOT Settings!)
    → Click on your service
      → Settings tab (in service panel)
        → Scroll down
          → Root Directory field
```

## Still Can't Find It?

Try this:

1. **Delete the current service** (you don't need frontend on Railway)
2. **Add a completely new service**
3. When the configuration popup appears, look for:
   - "Configure" button
   - "Advanced" section
   - "Settings" link
   - Or scroll through all the fields shown

The Root Directory field should be visible when adding a new service, before you click "Deploy".
