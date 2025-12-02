# 🚀 EventVerse - Running Checklist

## Pre-Flight Checklist

### Before You Start

- [ ] Node.js installed (v16 or higher)
  ```powershell
  node --version
  ```

- [ ] MongoDB installed and running
  ```powershell
  # Check if MongoDB is running
  mongo --version
  # Or use MongoDB Atlas (cloud)
  ```

- [ ] Code editor ready (VS Code recommended)

- [ ] Terminal ready (PowerShell, Command Prompt, or Git Bash)

---

## Step 1: Backend Setup (5 minutes)

### 1.1 Navigate to Backend
```powershell
cd "C:\Users\Jeevant\Desktop\Projects\UIUX Project - Events Portal\New\backend"
```

### 1.2 Install Dependencies
```powershell
npm install
```
**Expected Output**: "added 181 packages" (approximately)

### 1.3 Create .env File
```powershell
# Create the file
New-Item .env -Force

# Add content (use notepad or VS Code)
notepad .env
```

**Add these lines to .env:**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/eventverse
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_change_in_production_12345
```

### 1.4 Start MongoDB (if local)
```powershell
# In a new terminal
mongod --dbpath="C:\data\db"
# Or start MongoDB service
net start MongoDB
```

### 1.5 Start Backend Server
```powershell
npm start
```

**Expected Output:**
```
Server running on port 5000
✓ MongoDB connected successfully
```

**✅ Backend is ready when you see:** "MongoDB connected successfully"

---

## Step 2: Frontend Setup (3 minutes)

### 2.1 Open New Terminal
Keep backend terminal running, open a new one

### 2.2 Navigate to Frontend
```powershell
cd "C:\Users\Jeevant\Desktop\Projects\UIUX Project - Events Portal\New\frontend"
```

### 2.3 Install Dependencies
```powershell
npm install
```
**Expected Output**: "added 27 packages" (approximately)

### 2.4 Start Development Server
```powershell
npm run dev
```

**Expected Output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**✅ Frontend is ready when you see:** "Local: http://localhost:5173/"

---

## Step 3: Verify Everything Works

### 3.1 Open Browser
- [ ] Navigate to: http://localhost:5173
- [ ] Should see EventVerse landing page
- [ ] No console errors in DevTools

### 3.2 Test Backend
- [ ] Navigate to: http://localhost:5000
- [ ] Should see: `{"message":"EventVerse API is running","status":"OK"}`

### 3.3 Check Console Logs
**Backend Terminal Should Show:**
```
Server running on port 5000
✓ MongoDB connected successfully
```

**Frontend Terminal Should Show:**
```
ready in xxx ms
Local: http://localhost:5173/
```

---

## Step 4: Create Test Accounts

### 4.1 Create Super Admin (MongoDB Required)

**Option A: Using MongoDB Compass**
1. Connect to `mongodb://localhost:27017`
2. Select database: `eventverse`
3. Select collection: `users`
4. Click "Insert Document"
5. Paste this JSON:
```json
{
  "name": "Super Admin",
  "email": "admin@college.edu",
  "password": "$2a$10$YourHashedPasswordHere",
  "role": "SUPER_ADMIN",
  "xp": 0,
  "badges": []
}
```

**Option B: Using MongoDB Shell**
```javascript
use eventverse
db.users.insertOne({
  name: "Super Admin",
  email: "admin@college.edu", 
  password: "$2a$10$YourHashedPasswordHere",
  role: "SUPER_ADMIN",
  xp: 0,
  badges: []
})
```

**To hash password "admin123":** Use online bcrypt tool or create temp script

### 4.2 Register Society Admin
1. Login as Super Admin
2. Use `/api/auth/register-admin` endpoint
3. Or manually add to MongoDB with role: "SOCIETY_ADMIN"

### 4.3 Register Student
1. Go to http://localhost:5173/register
2. Fill in details
3. Select role: STUDENT
4. Click Register

---

## Step 5: Test Complete Workflow

### 5.1 Student Flow
- [ ] Register as student
- [ ] Login successfully
- [ ] Browse events at /events
- [ ] View event details
- [ ] Register for an event
- [ ] Check dashboard shows XP
- [ ] View leaderboard

### 5.2 Society Admin Flow
- [ ] Login as Society Admin
- [ ] Go to /society/dashboard
- [ ] Click "Create Event"
- [ ] Fill event details
- [ ] Upload PDF proposal
- [ ] Add prizes
- [ ] Submit for approval
- [ ] See event in "Pending Approval" status

### 5.3 Super Admin Flow
- [ ] Login as Super Admin
- [ ] Go to /admin/dashboard
- [ ] Click "Review Approvals"
- [ ] See pending event
- [ ] View PDF proposal
- [ ] Approve event
- [ ] Verify status changed to "Approved"

### 5.4 Complete Event Lifecycle
- [ ] Student registers for approved event
- [ ] Society Admin concludes event
- [ ] Select winners
- [ ] Verify XP awarded
- [ ] Check leaderboard updated

---

## Troubleshooting Checklist

### Backend Won't Start
- [ ] Is MongoDB running?
  ```powershell
  mongo --version
  ```
- [ ] Is .env file created?
  ```powershell
  Get-Content .env
  ```
- [ ] Is port 5000 already in use?
  ```powershell
  netstat -ano | findstr :5000
  ```
- [ ] Are dependencies installed?
  ```powershell
  ls node_modules
  ```

### Frontend Won't Start
- [ ] Is backend running?
- [ ] Are dependencies installed?
- [ ] Is port 5173 available?
  ```powershell
  netstat -ano | findstr :5173
  ```

### Can't Login
- [ ] Check credentials are correct
- [ ] Check user exists in MongoDB
- [ ] Check role is correct
- [ ] Clear browser localStorage
- [ ] Check console for errors

### CORS Errors
- [ ] Backend CORS configured for localhost:5173
- [ ] Frontend axios configured for localhost:5000
- [ ] Both servers running

### MongoDB Connection Failed
- [ ] MongoDB service running
- [ ] MONGODB_URI correct in .env
- [ ] Database name correct (eventverse)

### File Upload Fails
- [ ] 'uploads' folder exists in backend/
- [ ] File is PDF format
- [ ] File size < 5MB
- [ ] Multer middleware configured

---

## Quick Command Reference

### Start Everything
```powershell
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev

# Terminal 3 - MongoDB (if needed)
mongod --dbpath="C:\data\db"
```

### Stop Everything
```powershell
# In each terminal
Ctrl + C

# Or close terminals
```

### Reset Database
```powershell
# MongoDB Shell
mongo
use eventverse
db.dropDatabase()
```

### Clear Browser Cache
```
DevTools → Application → Clear storage → Clear site data
```

### Restart Servers
```powershell
# Stop with Ctrl+C
# Then run npm start again
```

---

## Success Indicators

### Backend Running ✅
```
✓ Server running on port 5000
✓ MongoDB connected successfully
```

### Frontend Running ✅
```
✓ VITE ready
✓ Local: http://localhost:5173/
```

### App Working ✅
```
✓ Landing page loads
✓ Can navigate between pages
✓ Can login
✓ API calls succeed
✓ No console errors
```

---

## Demo Preparation Checklist

### Before Presentation
- [ ] Both servers running
- [ ] Test accounts created
- [ ] Sample events created
- [ ] Students registered for events
- [ ] At least one approved event
- [ ] Leaderboard has data
- [ ] PDF proposal uploaded
- [ ] Browser tabs ready:
  - [ ] Student dashboard
  - [ ] Society admin dashboard
  - [ ] Super admin dashboard
  - [ ] Events list
  - [ ] Leaderboard

### During Demo
- [ ] Show landing page first
- [ ] Demonstrate student flow
- [ ] Show event creation
- [ ] Demonstrate approval workflow
- [ ] Show XP system working
- [ ] Display leaderboard
- [ ] Mention responsive design
- [ ] Highlight tech stack

---

## Emergency Fixes

### If Backend Crashes
```powershell
cd backend
npm start
```

### If Frontend Crashes
```powershell
cd frontend
npm run dev
```

### If Login Broken
```powershell
# Clear localStorage
# In browser console:
localStorage.clear()
location.reload()
```

### If Database Empty
```powershell
# Re-create Super Admin
# Use MongoDB Compass or Shell
```

---

## Final Pre-Demo Checklist

- [ ] All dependencies installed
- [ ] MongoDB running and connected
- [ ] Backend server running (port 5000)
- [ ] Frontend server running (port 5173)
- [ ] Test accounts created (all 3 roles)
- [ ] Sample data populated
- [ ] At least 3-5 events created
- [ ] Some events approved
- [ ] Students registered for events
- [ ] XP showing on dashboard
- [ ] Leaderboard populated
- [ ] PDF uploads working
- [ ] No console errors
- [ ] Responsive design tested
- [ ] Browser tabs prepared
- [ ] Demo script ready

---

## 🎉 You're Ready!

When all items above are checked, your EventVerse application is:
- ✅ Fully functional
- ✅ Ready for demonstration
- ✅ Ready for evaluation
- ✅ Ready for presentation

**Good luck with your demo!** 🚀
