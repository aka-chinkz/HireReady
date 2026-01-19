# Railway Start Command - Auto Detection

## Good News: Railway Auto-Detects Start Command!

Railway will **automatically detect** your start command in one of these ways:

### Method 1: From railway.json (Best)

The `railway.json` file I created has the start command. Railway will use it automatically once the file is committed.

**To use this:**
1. Commit and push the `railway.json` file:
   ```bash
   git add backend/railway.json
   git commit -m "Add Railway config with start command"
   git push
   ```

2. Railway will automatically detect and use:
   ```
   uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

### Method 2: Railway Auto-Detection

Railway can also auto-detect from:
- Your `requirements.txt` (sees `uvicorn`)
- Your project structure (sees `main.py`)

It will automatically use: `uvicorn main:app --host 0.0.0.0 --port $PORT`

## Why You Don't See "Start Command" Field

Railway's UI might not show a "Start Command" field if:
- It's auto-detecting successfully
- The field is in a different section (check "Deploy" tab)
- The UI only shows it when custom configuration is needed

## What to Do Now

### Step 1: Set Build Command

In the **Build** section, set:
```
pip install -r requirements.txt && prisma generate --schema=prisma/schema.prisma
```

### Step 2: Commit railway.json (Important!)

```bash
git add backend/railway.json
git commit -m "Add Railway config"
git push
```

### Step 3: Verify Auto-Detection

After pushing, Railway should:
- Redeploy automatically
- Use the start command from `railway.json`
- Or auto-detect it from your project

### Step 4: Check Deploy Section (Optional)

If you want to manually verify:
1. In Settings, look for **"Deploy"** section/tab
2. You might see "Start Command" there
3. Or Railway might just show it as "Auto-detected"

## Expected Result

Your backend should start with:
```
uvicorn main:app --host 0.0.0.0 --port $PORT
```

You don't need to manually enter it if Railway auto-detects it!

## If Start Command is Wrong

If Railway doesn't auto-detect correctly, you can:
1. Look for "Deploy" section in Settings
2. Or create a `Procfile` in `backend/` folder:
   ```
   web: uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

But the `railway.json` method should work fine!
