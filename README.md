# EventVerse - College Event Management Platform

A centralized platform for managing college events with role-based access, XP system, and smart recommendations.

## 🎯 Features

### For Students
- **Browse & Register**: Discover and register for events across all college societies
- **XP System & Badges**: Earn XP by participating and unlock achievement badges
- **Leaderboard**: Compete with peers on the global leaderboard
- **Smart Recommendations**: Get personalized event suggestions based on interests
- **Participation History**: Track all your registered and attended events

### For Society Admins
- **Event Management**: Create, edit, and manage society events
- **Approval Workflow**: Submit events with proposal PDFs for approval
- **Prize Management**: Define prizes and assign winners after events conclude
- **Venue Booking**: Book rooms with automatic clash detection
- **Participant Tracking**: View registrations and manage participants

### For Super Admins
- **Event Approvals**: Review and approve/reject events from all societies
- **Room Management**: Add and manage campus venues
- **Analytics Dashboard**: View comprehensive statistics and reports
- **Oversight**: Monitor all events across the college

## 🚀 Tech Stack

### Frontend
- **React 18** with Vite
- **React Router** for navigation
- **Axios** for API calls
- **CSS Modules** for styling
- **Context API** for state management

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** authentication
- **Bcrypt** for password hashing
- **Multer** for file uploads

## 📁 Project Structure

```
EventVerse/
├── backend/
│   ├── config/          # Database and multer config
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── middleware/      # Auth and error handlers
│   ├── utils/           # Utilities (clash detection, XP system)
│   └── server.js        # Entry point
│
└── frontend/
    ├── src/
    │   ├── api/         # Axios configuration
    │   ├── components/  # Reusable components (Modal, Toast, Navbar, etc.)
    │   ├── context/     # React Context (Auth)
    │   ├── pages/       # Page components
    │   └── App.jsx      # Main app with routing
    └── public/
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd EventVerse/backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/eventverse
JWT_SECRET=your_super_secret_jwt_key_change_this
NODE_ENV=development
```

5. Start the server:
```bash
npm run dev
```

The backend will run on `http://localhost:3001`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd EventVerse/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## 🎮 User Roles & Access

### Student
- Default role for public registration
- Can browse, register, and participate in events
- Earns XP and badges
- Access to personalized dashboard

### Society Admin
- Manages specific society's events
- Creates events with proposal PDFs
- Books venues for their events
- Marks events as complete and assigns winners

### Super Admin
- Approves/rejects all event submissions
- Manages room inventory
- Views system-wide analytics
- Oversees all societies

## 🏆 XP System

Students earn XP through participation:
- **Participation**: 10 XP
- **Third Prize**: 20 XP
- **Second Prize**: 30 XP
- **First Prize**: 50 XP

### Badge Milestones
- **50 XP**: Newcomer 🥉
- **100 XP**: Active Participant 🥈
- **250 XP**: Event Enthusiast 🥇
- **500 XP**: Campus Legend 👑

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register-student` - Register student
- `POST /api/auth/register-admin` - Register admin
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Events
- `GET /api/events` - List events (with filters)
- `POST /api/events` - Create event (Society Admin)
- `GET /api/events/:id` - Get event details
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event
- `POST /api/events/:id/register` - Register for event (Student)
- `DELETE /api/events/:id/register` - Cancel registration
- `POST /api/events/:id/conclude` - Mark complete & assign winners

### Approvals (Super Admin)
- `GET /api/approvals/events` - Get pending events
- `POST /api/approvals/events/:id/approve` - Approve event
- `POST /api/approvals/events/:id/reject` - Reject event

### Rooms
- `GET /api/rooms` - List rooms
- `POST /api/rooms` - Create room (Super Admin)
- `PUT /api/rooms/:id` - Update room
- `DELETE /api/rooms/:id` - Delete room
- `GET /api/rooms/availability` - Check availability
- `POST /api/events/:id/book-room` - Book room for event

### Profile & Stats
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update profile
- `GET /api/leaderboard` - Get leaderboard
- `GET /api/stats/overview` - Get statistics (Super Admin)
- `GET /api/highlights` - Get personalized recommendations (Student)

## 🔒 Security Features

- Password hashing with bcrypt
- JWT-based authentication
- HTTP-only cookie support
- Role-based authorization
- Protected routes
- Input validation

## 🎨 UI/UX Highlights

- **No window.alert**: All feedback via modals and toasts
- **Responsive Design**: Mobile-friendly layouts
- **Role-Specific UIs**: Distinct dashboards for each role
- **Modern Styling**: Gradient accents, smooth transitions
- **Accessible**: Keyboard navigation, ARIA labels

## 📝 Development Notes

### Frontend
- Uses React Router for client-side routing
- AuthContext manages global authentication state
- Protected routes enforce role-based access
- Toast notifications for user feedback
- Modal dialogs for confirmations

### Backend
- RESTful API design
- Middleware for auth and error handling
- Clash detection for events and rooms
- XP calculation and badge awarding
- File upload for proposal PDFs

## 🚧 Future Enhancements

- Email notifications
- Event categories with icons
- Advanced search and filters
- Calendar view for events
- Social sharing
- Event feedback system
- Mobile app
- Payment integration for paid events

## 👥 Contributing

This is a college project. For improvements:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

MIT License - feel free to use this project for learning purposes.

## 🙏 Acknowledgments

Built as a comprehensive solution for college event management, combining modern web technologies with practical features for real-world use.

---

**EventVerse** - Making college events accessible, engaging, and rewarding! 🎉
