import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer, useToast } from './components/Toast/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import EventsList from './pages/EventsList';
import EventDetail from './pages/EventDetail';
import Leaderboard from './pages/Leaderboard';
import About from './pages/About';
import Contact from './pages/Contact';

// Student Pages
import StudentDashboard from './pages/StudentDashboard';
import MyEvents from './pages/MyEvents';

// Society Admin Pages
import SocietyAdminDashboard from './pages/SocietyAdminDashboard';
import CreateEvent from './pages/CreateEvent';
import ConcludeEvent from './pages/ConcludeEvent';
import RoomBooking from './pages/RoomBooking';

// Super Admin Pages
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import Approvals from './pages/Approvals';
import RoomApprovals from './pages/RoomApprovals';

import './App.css';

function AppContent() {
  const toast = useToast();

  return (
    <>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<EventsList />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          {/* Student Routes */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/my-events"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <MyEvents />
              </ProtectedRoute>
            }
          />

          {/* Society Admin Routes */}
          <Route
            path="/society/dashboard"
            element={
              <ProtectedRoute allowedRoles={['SOCIETY_ADMIN']}>
                <SocietyAdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/society/events/create"
            element={
              <ProtectedRoute allowedRoles={['SOCIETY_ADMIN']}>
                <CreateEvent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/society/events/edit/:id"
            element={
              <ProtectedRoute allowedRoles={['SOCIETY_ADMIN']}>
                <CreateEvent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/society/events/conclude/:id"
            element={
              <ProtectedRoute allowedRoles={['SOCIETY_ADMIN']}>
                <ConcludeEvent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/society/rooms"
            element={
              <ProtectedRoute allowedRoles={['SOCIETY_ADMIN']}>
                <RoomBooking />
              </ProtectedRoute>
            }
          />

          {/* Super Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/approvals"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                <Approvals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/room-approvals"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                <RoomApprovals />
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>

      <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
