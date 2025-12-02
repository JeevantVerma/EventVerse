# EventVerse - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Start MongoDB
Make sure MongoDB is running on your system:
```bash
# If using MongoDB locally
mongod

# Or if using MongoDB as a service, ensure it's started
```

### Step 2: Start the Backend
Open a terminal and run:
```bash
cd "New/backend"
npm start
```

You should see:
```
🚀 Server running on port 5000
📊 Environment: development
MongoDB connected successfully
```

### Step 3: Start the Frontend
Open a **new terminal** and run:
```bash
cd "New/frontend"
npm run dev
```

You should see:
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Step 4: Open the Application
Visit: **http://localhost:5173/**

---

## 👤 Test Accounts

### Create Your First Users

#### 1. Register a Student
1. Go to http://localhost:5173/register
2. Select "Student"
3. Fill in details:
   - Name: John Student
   - Email: john@student.com
   - Password: password123
   - Select some favorite categories
4. Click "Create Account"

#### 2. Register a Society Admin
1. Go to http://localhost:5173/register
2. Select "Society Admin"
3. Fill in details:
   - Name: Sarah Admin
   - Email: sarah@admin.com
   - Society Name: Coding Club
   - Password: password123
4. Click "Create Account"

#### 3. Register a Super Admin
1. Go to http://localhost:5173/register
2. Select "Super Admin"
3. Fill in details:
   - Name: Admin User
   - Email: admin@college.com
   - Password: password123
4. Click "Create Account"

---

## 🎯 Testing the Flow

### As Super Admin (admin@college.com):
1. **Add Rooms**:
   - Navigate to `/super/rooms` (coming soon - use API directly for now)
   - Or use Postman/curl to create rooms via API

2. **View Approvals**:
   - Check `/super/approvals` for pending event submissions

### As Society Admin (sarah@admin.com):
1. **Create an Event**:
   - Go to "Create Event"
   - Fill in event details
   - Add prizes (First, Second, Third)
   - Upload a proposal PDF
   - Submit for approval

2. **Book a Venue**:
   - Go to "Venue Booking"
   - Select your event
   - Choose available room

### As Student (john@student.com):
1. **Browse Events**:
   - Click "Events" in navbar
   - Filter by category

2. **Register for Events**:
   - Click on an approved event
   - Click "Register"

3. **Check Dashboard**:
   - View your XP and rank
   - See recommended events
   - Track your registrations

---

## 🛠️ API Testing with Postman/curl

### Create a Room (Super Admin)
```bash
curl -X POST http://localhost:5000/api/rooms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  -d '{
    "name": "Auditorium Hall",
    "location": "Main Building, Ground Floor",
    "capacity": 200,
    "resources": ["Projector", "Sound System", "AC"]
  }'
```

### Create an Event (Society Admin)
```bash
curl -X POST http://localhost:5000/api/events \
  -H "Authorization: Bearer YOUR_SOCIETY_ADMIN_TOKEN" \
  -F "title=Hackathon 2024" \
  -F "category=Technical" \
  -F "description=24-hour coding competition" \
  -F "startDateTime=2024-12-15T09:00:00Z" \
  -F "endDateTime=2024-12-16T09:00:00Z" \
  -F "maxParticipants=100" \
  -F "prizes=[{\"position\":\"First\",\"title\":\"₹10,000\",\"description\":\"Cash prize\"}]" \
  -F "submitForApproval=true" \
  -F "proposalPdf=@path/to/proposal.pdf"
```

### Get Leaderboard
```bash
curl http://localhost:5000/api/leaderboard
```

---

## 🐛 Troubleshooting

### Backend won't start
- **Check MongoDB**: Ensure MongoDB is running
- **Port in use**: Change PORT in `.env` if 5000 is occupied
- **Dependencies**: Run `npm install` again

### Frontend won't start
- **Port in use**: Vite will automatically try 5174 if 5173 is busy
- **Dependencies**: Run `npm install` again
- **API URL**: Check `.env` has correct VITE_API_URL

### Can't login
- **Check network tab**: Look for API errors
- **CORS issues**: Backend CORS is configured for localhost:5173
- **Token storage**: Clear localStorage and try again

### Events not showing
- **Check event status**: Only APPROVED events show for students
- **Check filters**: Reset search/category filters
- **Database**: Verify events exist in MongoDB

---

## 📚 Next Steps

### Recommended Development Order:
1. ✅ Test basic auth flow (login/register)
2. ✅ Create test rooms via API
3. ✅ Create and approve test events
4. ✅ Register for events as student
5. ⏳ Conclude events and verify XP system
6. ⏳ Build remaining admin dashboards
7. ⏳ Add event detail page with registration
8. ⏳ Complete venue booking UI
9. ⏳ Add profile edit functionality
10. ⏳ Implement About and Contact pages

### Current Implementation Status:
- ✅ Complete backend API
- ✅ Authentication system
- ✅ Home, Login, Register pages
- ✅ Events list page
- ✅ Leaderboard page
- ✅ Student dashboard
- ✅ Basic UI components (Modal, Toast, Navbar, Sidebar)
- ⏳ Event detail page (needs creation)
- ⏳ Society admin dashboard (needs creation)
- ⏳ Super admin dashboard (needs creation)
- ⏳ Event creation/edit forms (needs creation)
- ⏳ Venue booking interface (needs creation)
- ⏳ Approval interface (needs creation)

---

## 🎨 UI Features Implemented
- Gradient theme (Purple: #667eea to #764ba2)
- Responsive design
- Modal popups for confirmations
- Toast notifications for feedback
- No window.alert anywhere
- Loading states
- Empty states
- Error handling

---

## 🔐 Security Notes
- Passwords are hashed with bcrypt
- JWT tokens for authentication
- Role-based access control
- Protected API routes
- HTTP-only cookie option available

---

**Happy Coding! 🎉**

Need help? Check the main README.md for detailed documentation.
