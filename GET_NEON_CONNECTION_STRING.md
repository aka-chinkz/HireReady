# How to Get Your Neon Connection String

## Step-by-Step Instructions

### Step 1: Click "Connect" Button

1. On your Neon dashboard, find the **"Connect to your database"** card (upper-left)
2. Click the **"Connect"** button in that card

### Step 2: Copy Connection String

After clicking "Connect", you'll see:
- Connection string options
- Different connection methods (Pooled, Direct, etc.)

### Step 3: Use the Pooled Connection (Recommended)

For Railway deployment, use the **Pooled connection** string. It should look like:

```
postgresql://neondb_owner:YOUR_PASSWORD@ep-wispy-sunset-a1uh9q67-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

**Important:** The database name should be `neondb` (or your main database name), NOT `prisma_migrate_shadow_db_...`

### Step 4: Copy the Full Connection String

1. Click the **copy icon** next to the connection string
2. Make sure it includes:
   - Your username
   - Your password
   - The host (`ep-wispy-sunset-a1uh9q67-pooler.ap-southeast-1.aws.neon.tech`)
   - The database name (`neondb` or your main DB)
   - `?sslmode=require` at the end

### Step 5: Use in Railway

Paste this connection string as the `DATABASE_URL` value in Railway's Variables tab.

## What to Look For

✅ **Correct connection string:**
- Database name: `neondb` (or your custom name)
- Ends with: `?sslmode=require`
- Uses "pooler" in the hostname for pooled connections

❌ **Wrong (Shadow Database):**
- Database name contains: `prisma_migrate_shadow_db`
- This is temporary and shouldn't be used for your app

## Quick Action

**Click "Connect" → Select "Pooled" → Copy the connection string → Use in Railway!**
