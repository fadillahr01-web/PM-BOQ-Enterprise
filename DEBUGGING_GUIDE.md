# 🔧 PM-BOQ ENTERPRISE - DEBUGGING & TROUBLESHOOTING GUIDE

---

## 🎯 QUICK DEBUG CHECKLIST

Before diving into detailed troubleshooting, verify:

```powershell
# 1. Is PostgreSQL running?
Get-Service postgresql*

# 2. Is Backend running on port 5000?
netstat -ano | findstr :5000

# 3. Is Frontend running on port 3000?
netstat -ano | findstr :3000

# 4. Can you reach health endpoint?
Invoke-WebRequest http://localhost:5000/health
```

---

## 🚨 COMMON ISSUES & SOLUTIONS

### ISSUE 1: "Failed to fetch" / CORS Error in Browser

**Symptoms:**
- Browser console shows: `Access to XMLHttpRequest at 'http://localhost:5000/api/...' blocked by CORS policy`
- Frontend can't load data from backend
- Network tab shows red/failed requests

**Root Causes:**
1. Backend not running
2. Frontend and backend on different ports than expected
3. CORS not properly configured
4. Frontend accessing from wrong URL

**Diagnostic Steps:**

```powershell
# Step 1: Check backend is running
curl http://localhost:5000/health
# Should return: {"status":"ok", ...}

# Step 2: Check CORS is configured
curl -H "Origin: http://localhost:3000" -H "Access-Control-Request-Method: GET" http://localhost:5000/api/projects
# Should return CORS headers in response

# Step 3: Verify frontend URL
# Open Browser DevTools → Application → LocalStorage
# Check if user_session exists
# If not, frontend was never loaded from localhost:3000
```

**Solution:**

1. **Ensure backend is running:**
   ```powershell
   cd Backend
   npm start
   # Should see: 🚀 PM-BOQ Enterprise Backend Server is running on port 5000
   ```

2. **Verify CORS middleware in Backend/server.js:**
   ```javascript
   app.use(cors({
     origin: 'http://localhost:3000',  // ← Must match frontend URL
     credentials: true
   }));
   ```

3. **Frontend must access from correct URL:**
   - ✓ `http://localhost:3000` (correct)
   - ✗ `http://127.0.0.1:3000` (will fail CORS)
   - ✗ `localhost:3000` (will fail CORS)

4. **Restart both servers:**
   ```powershell
   # Kill backend on port 5000
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   
   # Kill frontend on port 3000
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   
   # Restart both
   cd Backend && npm start
   # In new terminal: cd Frontend && npm run dev
   ```

---

### ISSUE 2: "Cannot GET /api/projects" (404 Error)

**Symptoms:**
- Browser shows: `404 Not Found`
- Endpoint returns `{"error": "Endpoint not found"}`
- Other endpoints might work

**Root Causes:**
1. Route not defined in Backend
2. Prisma Client not generated
3. Controller file missing
4. Typo in endpoint URL

**Diagnostic Steps:**

```powershell
# Step 1: Check if route is registered
cd Backend
cat routes/projectRoutes.js  # Should show routes defined

# Step 2: Verify controller exists
ls controllers/projectController.js  # Should exist

# Step 3: Check Prisma is initialized
npm run prisma:generate  # Re-generate Prisma Client

# Step 4: Test the exact endpoint
curl http://localhost:5000/api/projects
# Should return JSON array, not 404
```

**Solution:**

1. **Verify route definition in Backend/routes/projectRoutes.js:**
   ```javascript
   router.get('/', getAllProjects);          // GET /api/projects
   router.get('/:id', getProjectById);       // GET /api/projects/:id
   router.post('/', createProject);          // POST /api/projects
   router.put('/:id', updateProject);        // PUT /api/projects/:id
   router.delete('/:id', deleteProject);     // DELETE /api/projects/:id
   ```

2. **Verify route is mounted in Backend/server.js:**
   ```javascript
   app.use('/api/projects', projectRoutes);
   ```

3. **Regenerate Prisma Client:**
   ```powershell
   cd Backend
   npm run prisma:generate
   npm start  # Restart
   ```

4. **Check spelling of endpoint:**
   - ✓ `/api/projects` (correct)
   - ✗ `/api/project` (singular - wrong)
   - ✗ `/projects` (missing /api/)

---

### ISSUE 3: "Cannot connect to database" / Prisma Error

**Symptoms:**
- Backend shows: `Error: getaddrinfo ENOTFOUND localhost`
- `PrismaClientInitializationError`
- Fallback to memory data works, but no DB connection
- Seed script fails

**Root Causes:**
1. PostgreSQL not running
2. DATABASE_URL incorrect in .env
3. Database doesn't exist
4. Wrong credentials

**Diagnostic Steps:**

```powershell
# Step 1: Is PostgreSQL service running?
Get-Service postgresql*
# Should show: Status Running (if uppercase shows running)

# Step 2: Can you connect with psql?
psql -U postgres -h localhost
# If fails: PostgreSQL not running or not in PATH

# Step 3: Does database exist?
psql -U postgres -c "SELECT datname FROM pg_database WHERE datname='pm_boq';"
# Should return: pm_boq

# Step 4: Check DATABASE_URL syntax
cat Backend\.env | findstr DATABASE_URL
# Should be: postgresql://user:password@host:port/database?schema=public
```

**Solution:**

1. **Start PostgreSQL:**
   ```powershell
   # Windows Service
   Start-Service postgresql-x64-15
   # Or use Services.msc to start manually
   ```

2. **Verify DATABASE_URL in Backend/.env:**
   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pm_boq?schema=public"
   ```

3. **Create database if not exists:**
   ```powershell
   psql -U postgres

   # Inside psql:
   CREATE DATABASE pm_boq;
   \q
   ```

4. **Test connection:**
   ```powershell
   psql -U postgres -d pm_boq -h localhost -c "SELECT NOW();"
   # Should return current timestamp
   ```

5. **Push schema and seed:**
   ```powershell
   cd Backend
   npm run prisma:db-push
   npm run prisma:seed
   npm start
   ```

---

### ISSUE 4: "Port Already in Use" (EADDRINUSE)

**Symptoms:**
- Backend shows: `Error: listen EADDRINUSE :::5000`
- Frontend shows: `Port 3000 is already in use`
- Can't start server

**Root Causes:**
1. Server already running from previous attempt
2. Process didn't close cleanly
3. Another app using same port

**Diagnostic Steps:**

```powershell
# Find process using port 5000
netstat -ano | findstr :5000
# Shows: TCP    127.0.0.1:5000    LISTENING    <PID>

# Find process using port 3000
netstat -ano | findstr :3000
```

**Solution:**

```powershell
# Kill process on port 5000
$process = Get-Process | Where-Object { $_.Id -eq 1234 }  # Replace 1234 with PID
Stop-Process -Id $process.Id -Force

# Or kill by port (Windows 10+)
netstat -ano | findstr :5000 | ForEach-Object { taskkill /PID $_.Split()[4] /F }

# Restart backend
cd Backend
npm start
```

---

### ISSUE 5: "Module not found" / Dependencies Missing

**Symptoms:**
- Backend shows: `Error: Cannot find module 'express'`
- Frontend shows: `Error: Cannot find module 'next'`
- `npm ERR! code MODULE_NOT_FOUND`

**Root Causes:**
1. Dependencies not installed
2. package-lock.json corrupted
3. Wrong Node version

**Diagnostic Steps:**

```powershell
# Check node version
node --version
# Should be v18 or higher

# Check if node_modules exists
ls Backend/node_modules  # Should list many packages
```

**Solution:**

```powershell
# Backend
cd Backend
rm -r node_modules package-lock.json  # Remove old deps
npm install  # Fresh install
npm run prisma:generate

# Frontend
cd Frontend
rm -r node_modules package-lock.json
npm install
```

---

### ISSUE 6: Frontend Shows Blank Page / Won't Load

**Symptoms:**
- Browser shows white/blank page
- No console errors
- Network requests look OK
- Redirects to /dashboard but nothing loads

**Root Causes:**
1. Frontend not compiled
2. .env.local missing API URL
3. Build cache corrupted
4. Session/auth issue

**Diagnostic Steps:**

```powershell
# Check if .env.local exists
cat Frontend\.env.local
# Should show: NEXT_PUBLIC_API_URL=http://localhost:5000

# Check frontend build
ls Frontend\.next\
# If doesn't exist or empty, Next.js hasn't built
```

**Solution:**

```powershell
cd Frontend

# Clear Next.js cache
rm -r .next node_modules\.cache

# Ensure .env.local exists
# If not: create it (see step earlier in guide)

# Rebuild
npm run build

# Or restart dev server
npm run dev
```

---

### ISSUE 7: Login Always Fails

**Symptoms:**
- Login form submits but nothing happens
- No error message
- Stays on login page
- Browser console shows fetch error

**Root Causes:**
1. Auth endpoint not working
2. Database has no users (seed not run)
3. Password hashing issue
4. Session not saved to localStorage

**Diagnostic Steps:**

```powershell
# Check if users exist in database
psql -U postgres -d pm_boq

# In psql:
SELECT email, name, role FROM "User";
# Should show: pm@project.com, admin@project.com, etc.

\q

# Check auth endpoint
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"pm@project.com","password":"PM123"}'
```

**Solution:**

1. **Ensure seed data exists:**
   ```powershell
   cd Backend
   npm run prisma:seed
   # Should create users: pm@project.com (PM123), admin@project.com (Admin123), etc.
   ```

2. **Check authController.js for POST /login endpoint:**
   ```javascript
   // Should query User table and compare passwords
   const user = await prisma.user.findUnique({
     where: { email }
   });
   if (user && user.password === password) {
     // Save to localStorage
   }
   ```

3. **Verify frontend saves session to localStorage:**
   ```javascript
   localStorage.setItem('user_session', JSON.stringify(user));
   ```

4. **Test login manually:**
   - Email: `pm@project.com`
   - Password: `PM123`

---

### ISSUE 8: Data Not Displaying on Dashboard

**Symptoms:**
- Login works, but Projects page is empty
- Network shows 200 OK from /api/projects
- But no data renders
- Console shows no errors

**Root Causes:**
1. Data not seeded to database
2. Frontend not fetching correctly
3. Data structure mismatch
4. localStorage session cleared

**Diagnostic Steps:**

```powershell
# Check database has projects
psql -U postgres -d pm_boq
SELECT COUNT(*) FROM "Project";
# Should be > 0

# Check API returns data
curl http://localhost:5000/api/projects

# Check browser Network tab
# → Projects page → Network → XHR → /api/projects
# → Response tab should show JSON array
```

**Solution:**

1. **Ensure seed ran successfully:**
   ```powershell
   cd Backend
   npm run prisma:seed
   # Output should show: Project created, Tasks created, etc.
   ```

2. **Verify data structure in response matches frontend:**
   Frontend expects:
   ```javascript
   {
     id: string,
     name: string,
     clientName: string,
     location: string,
     status: string,
     actualProgress: number
   }
   ```

3. **Clear browser cache:**
   ```
   F12 → Application → Clear all site data → Reload
   ```

4. **Restart entire stack:**
   - Kill both servers
   - Restart: Backend (port 5000), then Frontend (port 3000)
   - Reload browser

---

## 🔍 DEBUGGING TOOLS & COMMANDS

### Browser DevTools (F12)
1. **Console** - Check for errors
2. **Network** - Monitor API calls
   - Method (GET, POST, etc)
   - Status code (200, 404, 500)
   - Response body (JSON data or error)
3. **Application** - Check localStorage
   - `user_session` - should contain logged-in user
4. **Inspect** - Check HTML/CSS

### PowerShell Network Commands
```powershell
# Test endpoint
Invoke-WebRequest http://localhost:5000/api/projects

# With headers
Invoke-WebRequest http://localhost:5000/api/projects -Headers @{
  'Accept' = 'application/json'
}

# POST request
Invoke-WebRequest -Method POST http://localhost:5000/api/projects `
  -Headers @{'Content-Type' = 'application/json'} `
  -Body '{"name":"Test Project"}'

# Check ports in use
netstat -ano | findstr :5000
```

### PostgreSQL Commands
```powershell
psql -U postgres -d pm_boq

# List tables
\dt

# Describe table structure
\d "Project"

# Query data
SELECT * FROM "User";
SELECT COUNT(*) FROM "Project";

# Check foreign keys
\d "Task"  # Will show constraints

# Quit
\q
```

### Backend Logs
```powershell
# Terminal where backend is running shows:
# - [Database Offline] - falling back to memory data
# - Error stacks for debugging
# - Console.log() outputs from controllers
```

### Frontend Logs
```
Browser Console (F12):
- Component mount/unmount
- API fetch requests
- State changes
- Local storage writes
```

---

## 📋 STEP-BY-STEP DEBUGGING WORKFLOW

When something breaks, follow this order:

1. **Check if services are running**
   ```powershell
   Get-Service postgresql* | Select Status
   netstat -ano | findstr :5000  # Backend
   netstat -ano | findstr :3000  # Frontend
   ```

2. **Test backend health**
   ```powershell
   Invoke-WebRequest http://localhost:5000/health
   ```

3. **Test API endpoints**
   ```powershell
   Invoke-WebRequest http://localhost:5000/api/projects
   ```

4. **Check database**
   ```powershell
   psql -U postgres -d pm_boq -c "SELECT COUNT(*) FROM \"User\";"
   ```

5. **Open browser DevTools (F12)**
   - Console tab
   - Network tab
   - Application tab (localStorage)

6. **Reproduce the issue**
   - Perform action that fails
   - Check console for errors
   - Check network requests

7. **Check logs**
   - Backend terminal output
   - Frontend console
   - Browser console

8. **Check environment**
   - .env files
   - DATABASE_URL
   - API_URL

9. **Clear cache & restart**
   - Browser: F12 → Application → Clear all
   - Backend: Kill & npm start
   - Frontend: Kill & npm run dev

---

## 🆘 WHEN NOTHING WORKS

### Nuclear Option - Full Reset

```powershell
# 1. Kill all Node processes
taskkill /F /IM node.exe

# 2. Kill PostgreSQL
Stop-Service postgresql-x64-15 -Force
Start-Service postgresql-x64-15

# 3. Clear all caches
cd Backend
rm -r node_modules .next
cd ..

cd Frontend
rm -r node_modules .next
cd ..

# 4. Fresh install
cd Backend
npm install
npm run prisma:generate
npm run prisma:db-push
npm run prisma:seed

cd ..
cd Frontend
npm install

# 5. Restart fresh
# Terminal 1:
cd Backend && npm start

# Terminal 2:
cd Frontend && npm run dev

# 3. Open browser
Start-Process "http://localhost:3000"
```

### Get Help
1. Check logs in both terminals
2. Run: `Invoke-WebRequest http://localhost:5000/health`
3. Check: Database has data (SELECT COUNT(*) FROM "User")
4. Check: .env files have correct values
5. If still stuck: Screenshot errors and check SETUP_GUIDE_ID.md again

---

Last Updated: May 27, 2026
