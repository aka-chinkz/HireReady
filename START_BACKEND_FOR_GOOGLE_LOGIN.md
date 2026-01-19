# Google Login Not Working - Backend Not Running

## The Problem

You're seeing "Failed to fetch" error because **the backend is not running**.

Google login requires the backend to be running because:
- Google authentication needs to verify tokens on the server
- The backend handles Google OAuth verification
- Frontend sends credentials to backend API

## Solution: Start the Backend

### Steps:

1. **Open Cursor Terminal** (bottom panel in Cursor)

2. **Navigate to backend folder:**
   ```powershell
   cd backend
   ```

3. **Activate virtual environment:**
   ```powershell
   .\venv\Scripts\Activate.ps1
   ```
   You should see `(venv)` at the start of your prompt.

4. **Start the backend server:**
   ```powershell
   python -m uvicorn main:app --reload
   ```

5. **Wait for this message:**
   ```
   INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
   INFO:     Started reloader process
   ```

6. **Keep the terminal open** - the backend needs to keep running

7. **Refresh your browser** and try Google login again

## Verify Backend is Running

After starting, you should see:
- ✅ Server running on http://127.0.0.1:8000
- ✅ No error messages
- ✅ Terminal shows "Started reloader process"

## If You Still Get Errors

- Make sure virtual environment is activated (`(venv)` in prompt)
- Check for any error messages in the terminal
- Make sure port 8000 is not being used by another application
- Try accessing http://localhost:8000/health in your browser (should show response)

## Keep Backend Running

**Important:** The backend must stay running while you use the application. Don't close the terminal or stop the server (CTRL+C stops it).

To run both frontend and backend:
- **Terminal 1:** Backend (uvicorn)
- **Terminal 2:** Frontend (npm run dev)

Or use the npm scripts from the project root:
- `npm run dev:backend` (in one terminal)
- `npm run dev:frontend` (in another terminal)