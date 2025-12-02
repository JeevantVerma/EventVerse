import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast/Toast';
import Sidebar from '../components/Sidebar/Sidebar';
import api from '../api/axios';
import './SuperAdminDashboard.css';

const SuperAdminDashboard = () => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    pendingApprovals: 0,
    totalEvents: 0,
    totalUsers: 0,
    totalRooms: 0,
    totalSocieties: 0,
    pendingRoomApprovals: 0,
  });
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [approvalResponse, eventsResponse, statsResponse, roomsResponse, roomApprovalsResponse] = await Promise.all([
        api.get('/approvals/events'),
        api.get('/events'),
        api.get('/stats/overview'),
        api.get('/rooms'),
        api.get('/rooms/bookings/pending')
      ]);

      const pendingApprovals = approvalResponse.data.events || [];
      const allEvents = eventsResponse.data.events || [];
      const statsData = statsResponse.data.stats || {};
      const roomsData = roomsResponse.data.rooms || [];
      const pendingRoomBookings = roomApprovalsResponse.data.bookings || [];

      setStats({
        pendingApprovals: pendingApprovals.length,
        totalEvents: allEvents.length,
        totalUsers: statsData.totalStudents || 0,
        totalRooms: roomsData.length,
        totalSocieties: statsData.totalSocieties || 0,
        pendingRoomApprovals: pendingRoomBookings.length,
      });

      // Get 5 most recent events
      const sortedEvents = allEvents.sort((a, b) => 
        new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
      setRecentEvents(sortedEvents.slice(0, 5));
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      DRAFT: '#6b7280',
      PENDING_APPROVAL: '#f59e0b',
      APPROVED: '#10b981',
      REJECTED: '#ef4444',
      COMPLETED: '#3b82f6',
    };
    return colors[status] || '#6b7280';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="super-admin-dashboard">
      <Sidebar />

      <div className="dashboard-content">
        <header className="dashboard-header">
          <div>
            <h1>Super Admin Dashboard</h1>
            <p>Welcome back, {user?.name}!</p>
          </div>
        </header>

        <div className="stats-grid">
          <div className="stat-card urgent" onClick={() => navigate('/admin/approvals')}>
            <div className="stat-icon" style={{ background: '#fef3c7' }}>⏳</div>
            <div className="stat-content">
              <h3>{stats.pendingApprovals}</h3>
              <p>Pending Approvals</p>
            </div>
            {stats.pendingApprovals > 0 && <span className="badge-urgent">{stats.pendingApprovals}</span>}
          </div>

          <div className="stat-card" onClick={() => navigate('/events')}>
            <div className="stat-icon" style={{ background: '#dbeafe' }}>📊</div>
            <div className="stat-content">
              <h3>{stats.totalEvents}</h3>
              <p>Total Events</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#d1fae5' }}>👥</div>
            <div className="stat-content">
              <h3>{stats.totalUsers}</h3>
              <p>Total Students</p>
            </div>
          </div>

          <div className="stat-card" onClick={() => navigate('/admin/rooms')}>
            <div className="stat-icon" style={{ background: '#e0e7ff' }}>🏛️</div>
            <div className="stat-content">
              <h3>{stats.totalRooms}</h3>
              <p>Available Rooms</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fce7f3' }}>🏢</div>
            <div className="stat-content">
              <h3>{stats.totalSocieties}</h3>
              <p>Total Societies</p>
            </div>
          </div>

          <div className="stat-card urgent" onClick={() => navigate('/admin/room-approvals')}>
            <div className="stat-icon" style={{ background: '#fed7aa' }}>🏛️</div>
            <div className="stat-content">
              <h3>{stats.pendingRoomApprovals}</h3>
              <p>Room Approvals</p>
            </div>
            {stats.pendingRoomApprovals > 0 && <span className="badge-urgent">{stats.pendingRoomApprovals}</span>}
          </div>
        </div>

        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <button
              onClick={() => navigate('/admin/approvals')}
              className="action-button"
              style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}
            >
              <span className="action-icon">✓</span>
              <span className="action-text">Review Approvals</span>
            </button>

            <button
              onClick={() => navigate('/admin/rooms')}
              className="action-button"
              style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
            >
              <span className="action-icon">🏛️</span>
              <span className="action-text">Manage Rooms</span>
            </button>

            <button
              onClick={() => navigate('/events')}
              className="action-button"
              style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
            >
              <span className="action-icon">📅</span>
              <span className="action-text">View All Events</span>
            </button>

            <button
              onClick={() => navigate('/leaderboard')}
              className="action-button"
              style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
            >
              <span className="action-icon">🏆</span>
              <span className="action-text">View Leaderboard</span>
            </button>
          </div>
        </div>

        <div className="recent-events-section">
          <h2>Recent Events</h2>
          {recentEvents.length === 0 ? (
            <p className="empty-message">No events created yet</p>
          ) : (
            <div className="events-table">
              <table>
                <thead>
                  <tr>
                    <th>Event Title</th>
                    <th>Society</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentEvents.map(event => (
                    <tr key={event._id}>
                      <td className="event-title-cell">{event.title}</td>
                      <td>{event.societyName}</td>
                      <td>
                        <span
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(event.status) }}
                        >
                          {event.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td>{new Date(event.startDateTime).toLocaleDateString()}</td>
                      <td>
                        <button
                          onClick={() => navigate(`/events/${event._id}`)}
                          className="btn-view-small"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
