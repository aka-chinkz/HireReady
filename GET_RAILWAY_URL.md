# How to Get Your Railway Backend URL

## Step-by-Step Instructions

### Step 1: Go to Settings Tab

1. In Railway, make sure you're viewing your **backend service** (`career-path-planner-backend`)
2. Click on the **"Settings"** tab (at the top, next to Deployments, Variables, Metrics)

### Step 2: Find Networking Section

In the Settings tab, scroll down to find the **"Networking"** section.

### Step 3: Generate Public Domain

1. In the Networking section, you'll see "Generate Domain" or "Public Domain" option
2. Click the **"Generate Domain"** button
3. Railway will automatically create a public URL for your service

### Step 4: Copy Your URL

After clicking "Generate Domain", you'll see a URL like:
```
https://career-path-planner-backend-production.up.railway.app
```

Or:
```
https://career-path-planner-backend.railway.app
```

**Copy this URL** - this is your backend API URL!

---

## Alternative: Check Service Card

If the domain is already generated, you might see it:
1. In the **Architecture** view (main dashboard)
2. Click on your service card
3. The public URL might be displayed at the top or in the service info

---

## Quick Check

After generating the domain:
1. Visit: `https://your-railway-url.railway.app/health`
2. You should see: `{"status": "healthy"}`
3. Visit: `https://your-railway-url.railway.app/`
4. You should see: API information with docs link

---

## Next Steps After Getting URL

Once you have your Railway URL:

1. **Update Vercel Environment Variables:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Update `NEXT_PUBLIC_API_URL` to your Railway URL
   - Example: `NEXT_PUBLIC_API_URL=https://career-path-planner-backend-production.up.railway.app`

2. **Update Railway ALLOWED_ORIGINS:**
   - In Railway → Variables tab
   - Make sure `ALLOWED_ORIGINS` includes your Vercel URL
   - Example: `ALLOWED_ORIGINS=http://localhost:3000,https://your-vercel-url.vercel.app`

3. **Redeploy Vercel:**
   - After updating environment variables, trigger a new deployment

---

## Summary

**Settings Tab → Networking Section → Generate Domain → Copy URL → Use in Vercel!**
