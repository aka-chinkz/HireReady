# Fix 405 Error on /api/auth/google

## Problem
Backend starts successfully, but `/api/auth/google` endpoint returns 405 (Method Not Allowed) when frontend tries to POST to it.

## Debugging Steps Added

### 1. Route Registration Logging
- Added logging to show all registered routes on startup
- This will help verify the route is actually registered

### 2. Request Logging
- Added middleware to log all incoming API requests
- Shows method, path, and response status
- Helps identify if requests are reaching the backend

### 3. Test Endpoint
- Added `GET /api/auth/google/test` endpoint
- Use this to verify the route prefix is working

## Next Steps

1. **Commit and push the changes:**
   ```powershell
   git add backend/main.py backend/app/routers/auth.py
   git commit -m "Debug: Add route logging and test endpoint for 405 error"
   git push
   ```

2. **Check Railway logs after redeploy:**
   - Look for "📋 Registered Routes:" section
   - Verify you see: `POST       /api/auth/google`
   - Look for incoming request logs when you try to login

3. **Test the endpoint:**
   - Visit: `https://career-path-planner-backend-production.up.railway.app/api/auth/google/test`
   - Should return: `{"message": "Google auth endpoint is accessible", "path": "/api/auth/google"}`
   - This confirms the route prefix is working

4. **Check request logs:**
   - When you try Google login, look for: `📥 POST /api/auth/google`
   - This confirms the request is reaching the backend

## Possible Causes

1. **Route not registered** - Check logs for route list
2. **Path mismatch** - Frontend calling wrong path
3. **CORS preflight failing** - OPTIONS request might be failing
4. **Middleware blocking** - Something intercepting the request

## What to Look For in Logs

After redeploy, you should see:
```
📋 Registered Routes:
  POST       /api/auth/google
  GET        /api/auth/google/test
  ...
```

When you try to login, you should see:
```
📥 POST /api/auth/google
📤 POST /api/auth/google -> 200 (or error code)
```

If you see the request but still get 405, the route might not be matching correctly.
