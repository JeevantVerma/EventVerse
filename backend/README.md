# EventVerse Backend API

Backend API for EventVerse - A centralized college event management platform.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based authentication
- **File Upload**: Multer for proposal PDFs

## Features

- Role-based authentication (STUDENT, SOCIETY_ADMIN, SUPER_ADMIN)
- Event management with approval workflow
- Room booking with clash detection
- XP system and leaderboard for student engagement
- Personalized event recommendations
- RESTful API design

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/eventverse
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

4. Start MongoDB (if running locally)

5. Run the server:
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register-student` - Register a student
- `POST /api/auth/register-admin` - Register admin (society/super)
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Events
- `POST /api/events` - Create event (SOCIETY_ADMIN)
- `GET /api/events` - List events with filters
- `GET /api/events/:id` - Get event details
- `PUT /api/events/:id` - Update event (owner)
- `DELETE /api/events/:id` - Delete event (owner)
- `POST /api/events/:id/register` - Register for event (STUDENT)
- `DELETE /api/events/:id/register` - Cancel registration (STUDENT)
- `POST /api/events/:id/conclude` - Mark event complete (owner)

### Approvals
- `GET /api/approvals/events` - Get pending events (SUPER_ADMIN)
- `POST /api/approvals/events/:id/approve` - Approve event (SUPER_ADMIN)
- `POST /api/approvals/events/:id/reject` - Reject event (SUPER_ADMIN)

### Rooms
- `GET /api/rooms` - List all rooms
- `POST /api/rooms` - Create room (SUPER_ADMIN)
- `PUT /api/rooms/:id` - Update room (SUPER_ADMIN)
- `DELETE /api/rooms/:id` - Delete room (SUPER_ADMIN)
- `GET /api/rooms/availability` - Get available rooms for time slot
- `POST /api/events/:id/book-room` - Book room for event (SOCIETY_ADMIN)
- `GET /api/events/:id/bookings` - Get event bookings
- `DELETE /api/bookings/:id` - Cancel booking (owner)

### Profile & Stats
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update profile
- `GET /api/leaderboard` - Get XP leaderboard
- `GET /api/stats/overview` - Get stats overview (SUPER_ADMIN)
- `GET /api/highlights` - Get personalized event highlights (STUDENT)

## Database Models

### User
- Student, Society Admin, or Super Admin
- XP and badges for students
- Society name for society admins

### Event
- Full event lifecycle from draft to completion
- Approval workflow
- Prizes and winners
- Participant registration

### Room
- Room details and capacity
- Resources available

### RoomBooking
- Links events to rooms
- Time slot tracking
- Clash prevention

## XP System

Students earn XP for event participation:
- Base participation: 10 XP
- Third prize: 20 XP
- Second prize: 30 XP
- First prize: 50 XP

Badges unlock at milestones:
- 50 XP: Newcomer
- 100 XP: Active Participant
- 250 XP: Event Enthusiast
- 500 XP: Campus Legend

## Security

- Password hashing with bcrypt
- JWT token authentication
- Role-based authorization middleware
- HTTP-only cookies option
- Input validation
