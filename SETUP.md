# Quick Setup Guide for EventVerse

## Prerequisites
- Node.js v16+ installed
- MongoDB installed and running (or MongoDB Atlas account)
- npm or yarn package manager

## Step-by-Step Setup

### 1. Backend Setup

```powershell
# Navigate to backend directory
cd backend

# Install all dependencies
npm install

# Create .env file
New-Item .env

# Add these lines to .env:
# PORT=3001
# MONGODB_URI=mongodb://localhost:27017/eventverse
# JWT_SECRET=your_super_secret_key_change_in_production

# Start MongoDB (if running locally)
# mongod --dbpath="C:\data\db"

# Start the backend server
npm start
# Server will run on http://localhost:3001
```

### 2. Frontend Setup

```powershell
# Open a new terminal
# Navigate to frontend directory
cd frontend

# Install all dependencies
npm install

# Start the development server
npm run dev
# App will run on http://localhost:5173
```

### 3. Testing the Application

#### Create Test Accounts

**Student Account**
- Go to http://localhost:5173/register
- Fill in details, select role: STUDENT
- Login and explore student features

**Society Admin Account**
- First, create a Super Admin to enable admin registration
- Use Postman or similar to POST to `/api/auth/register-admin` with JWT
- Or register as student, then manually update role in MongoDB
- Login and create events

**Super Admin Account**
- Manually create in MongoDB:
```javascript
{
  name: "Super Admin",
  email: "admin@college.edu",
  password: "$2a$10$hashed_password", // Use bcrypt to hash
  role: "SUPER_ADMIN",
  xp: 0,
  badges: []
}
```

#### Test Workflows

**Student Workflow:**
1. Browse events at `/events`
2. View event details
3. Register for an event
4. Check dashboard to see XP progress
5. View leaderboard

**Society Admin Workflow:**
1. Login as Society Admin
2. Go to dashboard
3. Click "Create Event"
4. Fill event details, upload PDF proposal
5. Submit for approval or save as draft
6. After approval, book a room
7. After event ends, conclude it and select winners

**Super Admin Workflow:**
1. Login as Super Admin
2. Go to approvals page
3. Review pending events
4. View proposal PDFs
5. Approve or reject with reasons
6. Monitor all events from dashboard

## Common Issues & Solutions

### MongoDB Connection Error
```
Error: MongoServerError: connect ECONNREFUSED
Solution: Ensure MongoDB is running. Check MONGODB_URI in .env
```

### CORS Errors
```
Solution: Backend CORS is configured for localhost:5173
If using different port, update in backend/server.js
```

### File Upload Errors
```
Solution: Ensure 'uploads' directory exists in backend/
Backend creates it automatically, but check permissions
```

### JWT Token Issues
```
Solution: Clear localStorage in browser DevTools
Or logout and login again
```

## Development Tips

### Hot Reload
- Frontend: Vite automatically reloads on file changes
- Backend: Use nodemon for auto-restart
  ```bash
  npm install -g nodemon
  nodemon server.js
  ```

### Testing API Endpoints
Use Postman, Thunder Client, or curl:
```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'

# Get events (with auth token)
curl http://localhost:3001/api/events \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Debugging
- Backend logs: Check terminal running `npm start`
- Frontend logs: Check browser DevTools console
- Network requests: Check DevTools Network tab
- MongoDB data: Use MongoDB Compass or Studio 3T

## Environment Variables

### Backend (.env)
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/eventverse
JWT_SECRET=your_secret_key_min_32_chars
NODE_ENV=development
```

### Frontend (Optional .env)
```env
VITE_API_URL=http://localhost:3001/api
```

## Database Seeding (Optional)

Create sample data for testing:

```javascript
// Run in MongoDB shell or create seed.js
db.users.insertMany([
  {
    name: "John Student",
    email: "student@test.com",
    password: "$2a$10$...", // bcrypt hash of "password123"
    role: "STUDENT",
    xp: 120,
    badges: ["🥉 Bronze", "🥈 Silver"]
  },
  {
    name: "Tech Society",
    email: "tech@college.edu",
    password: "$2a$10$...",
    role: "SOCIETY_ADMIN",
    xp: 0,
    badges: []
  }
]);
```

## Production Deployment

### Backend
1. Set NODE_ENV=production
2. Use strong JWT_SECRET
3. Configure MongoDB Atlas
4. Add rate limiting
5. Enable HTTPS
6. Deploy to Heroku, Railway, or similar

### Frontend
1. Update API URL in axios config
2. Build: `npm run build`
3. Deploy dist/ folder to Vercel, Netlify, or similar
4. Configure environment variables

## Next Steps

1. ✅ Test all three user roles
2. ✅ Create sample events
3. ✅ Test registration flow
4. ✅ Test approval workflow
5. ✅ Test XP awarding
6. ✅ Verify leaderboard updates
7. 🚧 Implement room booking UI
8. 🚧 Add email notifications
9. 🚧 Enhance analytics dashboard

## Support

For issues:
1. Check this guide
2. Review error messages in terminal/console
3. Check MongoDB connection
4. Verify .env configuration
5. Clear browser cache/localStorage

Happy coding! 🚀
