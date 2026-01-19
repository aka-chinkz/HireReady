# Troubleshooting Google Login

## Step 1: Check if Backend is Running

**Open Cursor Terminal and run:**
```powershell
# Check if backend is accessible
curl http://localhost:8000/health
# OR
Invoke-WebRequest http://localhost:8000/health
```

**Expected:** Should return `{"status":"healthy"}`

**If it fails:** Backend is not running. Go to Step 2.

---

## Step 2: Start the Backend (if not running)

```powershell
cd backend
.\venv\Scripts\Activate.ps1
python -m uvicorn main:app --reload
```

**Look for:**
- ✅ `INFO:     Uvicorn running on http://127.0.0.1:8000`
- ✅ `Started reloader process`
- ❌ Any error messages

**Common errors:**
1. **"No module named uvicorn"** → Virtual environment not activated
2. **"Prisma client not generated"** → Run `python -m prisma generate --schema=prisma/schema.prisma`
3. **Database connection errors** → Check DATABASE_URL in .env file

---

## Step 3: Check Database Connection

The backend needs a database to store users. Check if DATABASE_URL is set:

```powershell
cd backend
# Check if .env exists
Test-Path .env

# View DATABASE_URL (don't share this publicly!)
Get-Content .env | Select-String "DATABASE_URL"
```

**If DATABASE_URL is missing or incorrect:**
- Backend will fail to start
- Google login won't work (can't create users)

---

## Step 4: Check Browser Console

1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Try Google login
4. Look for error messages

**Common browser errors:**
- `Failed to fetch` → Backend not running or CORS issue
- `Network Error` → Backend not accessible
- `401 Unauthorized` → Google token verification failed
- `500 Internal Server Error` → Backend error (check backend terminal)

---

## Step 5: Check Backend Terminal Logs

When you try Google login, watch the backend terminal for:
- Request received: `POST /api/auth/google`
- Any error messages
- Stack traces

---

## Quick Diagnostic Checklist

- [ ] Backend terminal shows "Uvicorn running on http://127.0.0.1:8000"
- [ ] Virtual environment is activated (see `(venv)` in prompt)
- [ ] `.env` file exists in backend folder
- [ ] `DATABASE_URL` is set in `.env`
- [ ] `GOOGLE_CLIENT_ID` is set in `.env`
- [ ] Browser can access http://localhost:8000/health
- [ ] No error messages in backend terminal
- [ ] Browser console shows no network errors

---

## Still Not Working?

**Share these details:**
1. What error message appears in browser?
2. What appears in backend terminal when you start it?
3. What appears in backend terminal when you try to login?
4. What appears in browser console (F12)?
5. Can you access http://localhost:8000/health in browser?