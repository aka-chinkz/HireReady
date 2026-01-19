# Debug Railway Backend Crash

## Step 1: Check Deployment Logs

To see why it's crashing:

1. In Railway, click on the **"Deployments"** tab
2. Click **"View logs"** on the crashed deployment
3. Scroll through the logs to find error messages

Common errors you might see:
- `DATABASE_URL` not set
- `ModuleNotFoundError` or missing dependencies
- Port binding issues
- Database connection errors

## Step 2: Check Environment Variables

The crash might be due to missing environment variables:

### Required Variables in Railway:

1. **DATABASE_URL** - Your Neon connection string
2. **GOOGLE_CLIENT_ID** - Your Google OAuth client ID
3. **ALLOWED_ORIGINS** - CORS allowed origins

**To check:**
1. Click **"Variables"** tab in Railway
2. Verify all three variables are set

## Step 3: Common Crash Causes

### Cause 1: Missing DATABASE_URL

**Error in logs:**
```
Error: DATABASE_URL is not set
```

**Fix:**
- Go to Variables tab
- Add `DATABASE_URL` with your Neon connection string

### Cause 2: Wrong DATABASE_URL Format

**Error in logs:**
```
Error: Invalid connection string
```

**Fix:**
- Make sure it starts with `postgresql://`
- Should end with `?sslmode=require`
- Should NOT be a shadow database (no `prisma_migrate_shadow_db`)

### Cause 3: Build Command Failed

**Error in logs:**
```
Error: pip install failed
```

**Fix:**
- Check Build Command in Settings → Build section
- Should be: `pip install -r requirements.txt && prisma generate --schema=prisma/schema.prisma`

### Cause 4: Start Command Failed

**Error in logs:**
```
Error: uvicorn not found
```

**Fix:**
- Make sure build completed successfully
- Check that uvicorn is in requirements.txt

### Cause 5: Port Issues

**Error in logs:**
```
Error: Address already in use
```

**Fix:**
- Make sure start command uses `$PORT` environment variable
- Should be: `uvicorn main:app --host 0.0.0.0 --port $PORT`

## Step 4: Quick Fix Checklist

Before checking logs, verify:

- [ ] **Variables tab** has `DATABASE_URL` set
- [ ] **Variables tab** has `GOOGLE_CLIENT_ID` set  
- [ ] **Variables tab** has `ALLOWED_ORIGINS` set
- [ ] **Build Command** is set correctly
- [ ] **Root Directory** is `/backend`

## Step 5: View Logs Now

**Click "View logs" on the crashed deployment to see the exact error!**

The logs will tell us exactly what's wrong.
