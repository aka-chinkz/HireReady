# Fix PostgreSQL Connection Error in Railway

## The Problem

Your Railway backend is showing:
```
Error in PostgreSQL connection: Error { k... target: "quaint::connector::postgres"
```

**What this means:**
- ✅ Backend starts successfully
- ✅ Uvicorn is running
- ❌ **Cannot connect to PostgreSQL database**
- ❌ API endpoints fail because database is unreachable

This is why you see "Application failed to respond" and "Failed to fetch" errors!

---

## Solution: Fix DATABASE_URL in Railway

### Step 1: Check DATABASE_URL in Railway

1. Go to **Railway Dashboard**
2. Go to your backend service → **"Variables"** tab
3. Find `DATABASE_URL`
4. **Click to edit it** and check:
   - ❌ **NO quotes** around it (no `'` at start/end)
   - ✅ Starts with `postgresql://`
   - ✅ Database name is `neondb` (not `prisma_migrate_shadow_db_...`)
   - ✅ Ends with `?sslmode=require` (or `?sslmode=require&channel_binding=require`)

### Step 2: Get Correct DATABASE_URL from Neon

1. Go to **Neon Dashboard**: https://console.neon.tech
2. Select your project
3. Click **"Connect"** button (in the "Connect to your database" card)
4. **Select "Pooled" connection**
5. **Change Database dropdown to `neondb`** (not shadow database)
6. Copy the connection string (should look like):
   ```
   postgresql://neondb_owner:npg_9v6qUYKdeNGB@ep-wispy-sunset-a1uh9q67-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   ```

### Step 3: Update DATABASE_URL in Railway

1. **Railway** → Variables tab → Edit `DATABASE_URL`
2. **Remove the old value completely**
3. **Paste the NEW connection string** (with `neondb` as database)
4. **Make sure:**
   - ✅ NO quotes at the start or end
   - ✅ Starts with `postgresql://`
   - ✅ Database name is `neondb`
   - ✅ Ends with `?sslmode=require` (or includes `channel_binding=require`)
5. **Save** changes
6. Railway will automatically redeploy

### Step 4: Verify Database Connection

After Railway redeploys:

1. **Check Railway logs:**
   - Go to Deployments → View logs
   - Should see: "Application startup complete" WITHOUT database errors
   - Should NOT see: "Error in PostgreSQL connection"

2. **Test backend:**
   - Visit: `https://career-path-planner-backend-production.up.railway.app/health`
   - Should return: `{"status": "healthy"}`

3. **Test database endpoint:**
   - Try visiting: `https://career-path-planner-backend-production.up.railway.app/`
   - Should show API info (not crash)

---

## Common Issues

### Issue 1: Wrong Database Name (Shadow Database)

**Wrong:**
```
postgresql://...@host/prisma_migrate_shadow_db_3077b771-...?sslmode=require
```

**Correct:**
```
postgresql://...@host/neondb?sslmode=require
```

**Fix:** In Neon, change database dropdown to `neondb` and copy the connection string again.

### Issue 2: Quotes Around Connection String

**Wrong:**
```
'postgresql://neondb_owner:...@host/neondb?sslmode=require'
```

**Correct:**
```
postgresql://neondb_owner:...@host/neondb?sslmode=require
```

**Fix:** Remove the quotes `'` at the start and end.

### Issue 3: Missing sslmode

**Wrong:**
```
postgresql://...@host/neondb
```

**Correct:**
```
postgresql://...@host/neondb?sslmode=require
```

**Fix:** Make sure it ends with `?sslmode=require`

### Issue 4: Wrong Connection Type

Make sure you're using the **Pooled** connection string from Neon, not the Direct connection.

---

## Quick Checklist

- [ ] DATABASE_URL has NO quotes around it
- [ ] DATABASE_URL starts with `postgresql://`
- [ ] Database name is `neondb` (not shadow database)
- [ ] DATABASE_URL ends with `?sslmode=require`
- [ ] Using Pooled connection from Neon
- [ ] Saved changes in Railway
- [ ] Railway redeployed automatically
- [ ] Checked logs - no database errors
- [ ] Backend `/health` endpoint works

---

## Step-by-Step Fix

1. ✅ **Neon Dashboard** → Connect → Select Pooled → Change database to `neondb`
2. ✅ **Copy connection string** (no quotes)
3. ✅ **Railway** → Variables → Edit `DATABASE_URL`
4. ✅ **Remove old value** (with shadow database)
5. ✅ **Paste new value** (with `neondb`)
6. ✅ **Save** → Railway redeploys
7. ✅ **Wait 1-2 minutes** for redeployment
8. ✅ **Check logs** - should see no database errors
9. ✅ **Test backend** - `/health` should work
10. ✅ **Test frontend** - "Failed to fetch" should be gone!

---

## After Fixing

Once DATABASE_URL is correct:

1. **Backend will start properly** ✅
2. **Database connection will work** ✅
3. **API endpoints will respond** ✅
4. **Frontend "Failed to fetch" will disappear** ✅

The PostgreSQL connection error is the root cause of your "Failed to fetch" issue. Fix the DATABASE_URL and everything should work!

---

## Still Not Working?

If you still see errors after fixing DATABASE_URL:

1. **Check Railway logs** for the exact error message
2. **Verify database name** in Neon - make sure `neondb` exists
3. **Test connection string** - try connecting with a PostgreSQL client
4. **Check Neon database status** - make sure it's running
5. **Share the exact error** from Railway logs

Fix the DATABASE_URL and your backend should start working! 🚀
