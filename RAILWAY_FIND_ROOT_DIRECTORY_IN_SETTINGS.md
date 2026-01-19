# Find Root Directory in Railway Settings

## You're in the Build Section - Root Directory is Elsewhere!

You're currently viewing the **"Build"** section. The **"Root Directory"** field is usually in a **different section** of the Settings.

## Where to Find Root Directory

### Method 1: Look in Different Sections

In the Settings tab, look for these sections (they might be tabs or expandable sections):

1. **"General"** section - Root Directory is often here
2. **"Deploy"** section - Sometimes here
3. **Scroll up/down** - It might be above or below the Build section

### Method 2: Check All Tabs/Sections

In the service Settings panel, look for:
- **General** tab/section
- **Build** tab/section (you're here)
- **Deploy** tab/section
- **Networking** tab/section

Click through each one to find "Root Directory"

### Method 3: Use the Search/Filter

Some Railway interfaces have a search box - try searching for "root" or "directory"

## Quick Fix: Change Build Command to Force Backend

Since you can see the **Build Command** field, you can force Railway to use backend by:

1. **Change the Build Command** to:
   ```
   cd backend && pip install -r requirements.txt && prisma generate --schema=prisma/schema.prisma
   ```

2. **Change the Start Command** (in Deploy section):
   ```
   cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

This tells Railway to work in the `backend` directory even if Root Directory isn't visible.

## Alternative: Delete and Use railway.json

1. **Delete this service** (you don't need frontend on Railway)
2. **Commit the railway.json file:**
   ```bash
   git add backend/railway.json
   git commit -m "Add Railway config for backend"
   git push
   ```
3. **Add new service** from GitHub
4. Railway should detect `backend/railway.json` and configure automatically

## What You Should See

When you find the right section, you should see:
- **Root Directory:** `frontend` or empty
- Change it to: `backend`

Or if Root Directory isn't available, use the `cd backend &&` prefix in your commands as shown above.

## Step-by-Step Right Now

1. **In the Settings panel, look for tabs or sections:**
   - Click "General" if you see it
   - Or scroll up/down to find other sections
   - Root Directory is usually near the top of Settings

2. **If you can't find it:**
   - Use the workaround: Add `cd backend &&` to your build/start commands
   - Or delete service and use the railway.json method
