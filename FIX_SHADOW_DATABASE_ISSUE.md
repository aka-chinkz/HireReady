# Fix Shadow Database Connection String Issue

## The Problem

Your `DATABASE_URL` in Railway is pointing to a **shadow database** instead of your main database.

**Current (WRONG):**
```
postgresql://...@host/prisma_migrate_shadow_db_3077b771-7221-476f-9772-681631e9cedd?...
```

**Should be (CORRECT):**
```
postgresql://...@host/neondb?sslmode=require
```

## Solution: Get the Correct Connection String

### Step 1: Change Database Selection in Neon

1. In Neon's "Connect to your database" modal, look for the **"Database"** dropdown
2. Currently it shows: `prisma_migrate_shadow_db_3077b771-...`
3. **Change it to:** `neondb` (or your main database name)

### Step 2: Copy the Correct Connection String

After changing the database to `neondb`:

1. The connection string will update automatically
2. Look for the connection string (should show `psql` but that's fine - ignore that part)
3. Copy **only the part inside the quotes**:
   ```
   postgresql://neondb_owner:npg_9v6qUYKdeNGB@ep-wispy-sunset-a1uh9q67-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   ```

### Step 3: Update Railway DATABASE_URL

1. Go to Railway → Variables tab
2. Find `DATABASE_URL`
3. Click to edit it
4. Replace the entire value with the NEW connection string (with `neondb` as database)
5. Save

**Important:** 
- Copy everything EXCEPT the `psql` command part
- Just copy: `postgresql://...@host/neondb?...`
- Make sure the database name is `neondb` (not `prisma_migrate_shadow_db_...`)

## What to Copy

From the Neon connection string, copy **ONLY** this part:

```
postgresql://neondb_owner:npg_9v6qUYKdeNGB@ep-wispy-sunset-a1uh9q67-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

**DO NOT copy:**
- The `psql` command at the beginning
- Any quotes around it
- Just the connection string itself

## Quick Fix Steps

1. ✅ In Neon modal, change **Database** dropdown from shadow DB to `neondb`
2. ✅ Copy the connection string (the `postgresql://...` part only)
3. ✅ Go to Railway → Variables → Edit `DATABASE_URL`
4. ✅ Paste the NEW connection string (with `neondb`)
5. ✅ Save → Railway will redeploy automatically

## About `psql`

- `psql` is just a command-line tool name shown in Neon's UI
- You **don't need** to install it or add it anywhere
- Just ignore the `psql` part and copy the connection string itself
