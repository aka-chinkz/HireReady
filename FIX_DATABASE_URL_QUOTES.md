# Fix DATABASE_URL Quotes Issue

## The Problem

Your `DATABASE_URL` in Railway has **single quotes** around it, which makes Prisma think it's invalid.

**Current (WRONG):**
```
'postgresql://neondb_owner:...@host/neondb?sslmode=require&channel_binding=require'
```

**Should be (CORRECT):**
```
postgresql://neondb_owner:...@host/neondb?sslmode=require&channel_binding=require
```

## Fix: Remove the Quotes

### Step 1: Edit DATABASE_URL in Railway

1. Go to Railway → **Variables** tab
2. Find `DATABASE_URL`
3. Click the **three dots (⋯)** on the right
4. Click **"Edit"** or click directly on the value

### Step 2: Remove Single Quotes

1. You'll see the value in an editor
2. **Remove the single quote `'` at the beginning**
3. **Remove the single quote `'` at the end**
4. The value should start with `postgresql://` (no quotes)

### Step 3: Save

1. Click **"Save"** or the value auto-saves
2. Railway will automatically redeploy

## What It Should Look Like

**Before (WRONG):**
```
'postgresql://neondb_owner:npg_9v6qUYKdeNGB@ep-wispy-sunset-a1uh9q67-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
```

**After (CORRECT):**
```
postgresql://neondb_owner:npg_9v6qUYKdeNGB@ep-wispy-sunset-a1uh9q67-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

## Quick Steps

1. ✅ Railway → Variables → Find `DATABASE_URL`
2. ✅ Click to edit it
3. ✅ Remove the `'` at the start
4. ✅ Remove the `'` at the end
5. ✅ Save → Railway redeploys automatically

## Why This Happens

Railway might have auto-added quotes when you pasted the connection string. Connection strings should **never have quotes** in environment variables - Railway will interpret the quotes as part of the value.

## Verify It's Fixed

After removing quotes, check:
- ✅ Connection string starts with `postgresql://` (no quote before it)
- ✅ Connection string ends with `...require` (no quote after it)
- ✅ Database name is `neondb` (not shadow database)
