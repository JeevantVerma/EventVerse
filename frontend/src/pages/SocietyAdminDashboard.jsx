import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast/Toast';
import Sidebar from '../components/Sidebar/Sidebar';
import Modal from '../components/Modal/Modal';
import api from '../api/axios';
import './SocietyAdminDashboard.css';

const SocietyAdminDashboard = () => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    approvedEvents: 0,
    pendingEvents: 0,
    completedEvents: 0,
  });
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, eventId: null, eventTitle: '' });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch events created by this society admin
      const response = await api.get('/events', {
        params: {
          societyName: user.societyName
        }
      });
      const myEvents = response.data.events || [];
      setEvents(myEvents);

      // Calculate stats
      setStats({
        totalEvents: myEvents.length,
        approvedEvents: myEvents.filter(e => e.status === 'APPROVED').length,
        pendingEvents: myEvents.filter(e => e.status === 'PENDING_APPROVAL').length,
        completedEvents: myEvents.filter(e => e.status === 'COMPLETED').length,
      });
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      await api.delete(`/events/${eventId}`);
      toast.success('Event deleted successfully!');
      setDeleteModal({ isOpen: false, eventId: null, eventTitle: '' });
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete event');
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
    <div className="society-admin-dashboard">
      <Sidebar />
      
      <div className="dashboard-content">
        <header className="dashboard-header">
          <div>
            <h1>Society Dashboard</h1>
            <p>Welcome back, {user?.name}!</p>
          </div>
          <button
            onClick={() => navigate('/society/events/create')}
            className="btn-create-event"
          >
            + Create Event
          </button>
        </header>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#dbeafe' }}>📊</div>
            <div className="stat-content">
              <h3>{stats.totalEvents}</h3>
              <p>Total Events</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#d1fae5' }}>✓</div>
            <div className="stat-content">
              <h3>{stats.approvedEvents}</h3>
              <p>Approved</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fef3c7' }}>⏳</div>
            <div className="stat-content">
              <h3>{stats.pendingEvents}</h3>
              <p>Pending Approval</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#e0e7ff' }}>🎉</div>
            <div className="stat-content">
              <h3>{stats.completedEvents}</h3>
              <p>Completed</p>
            </div>
          </div>
        </div>

        <div className="events-section">
          <h2>My Events</h2>
          {events.length === 0 ? (
            <div className="empty-state">
              <p>You haven't created any events yet.</p>
              <button
                onClick={() => navigate('/society/events/create')}
                className="btn-primary"
              >
                Create Your First Event
              </button>
            </div>
          ) : (
            <div className="events-list">
              {events.map(event => (
                <div key={event._id} className="event-card">
                  {event.imageUrl && (
                    <div className="event-card-image">
                      <img src={event.imageUrl} alt={event.title} style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '8px 8px 0 0' }} />
                    </div>
                  )}
                  <div className="event-card-header">
                    <h3>{event.title}</h3>
                    <span
                      className="event-status-badge"
                      style={{ backgroundColor: getStatusColor(event.status) }}
                    >
                      {event.status.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="event-description-preview">
                    {event.description?.substring(0, 120)}
                    {event.description?.length > 120 ? '...' : ''}
                  </p>

                  <div className="event-meta">
                    <span>📅 {new Date(event.startDateTime).toLocaleDateString()}</span>
                    <span>👥 {event.registeredParticipants?.length || 0}/{event.maxParticipants}</span>
                    <span>📂 {event.category}</span>
                  </div>

                  <div className="event-actions">
                    <button
                      onClick={() => navigate(`/events/${event._id}`)}
                      className="btn-action btn-view"
                    >
                      View
                    </button>

                    {(event.status === 'DRAFT' || event.status === 'REJECTED') && (
                      <button
                        onClick={() => navigate(`/society/events/edit/${event._id}`)}
                        className="btn-action btn-edit"
                      >
                        Edit
                      </button>
                    )}

                    {event.status === 'APPROVED' && new Date() < new Date(event.startDateTime) && (
                      <button
                        onClick={() => navigate('/society/rooms')}
                        className="btn-action btn-book"
                      >
                        Book Room
                      </button>
                    )}

                    {event.status === 'APPROVED' && new Date() > new Date(event.endDateTime) && (!event.winners || Object.keys(event.winners).length === 0) && (
                      <button
                        onClick={() => navigate(`/society/events/conclude/${event._id}`)}
                        className="btn-action btn-conclude"
                      >
                        Conclude
                      </button>
                    )}

                    {(event.status === 'DRAFT' || event.status === 'REJECTED') && (
                      <button
                        onClick={() => setDeleteModal({ isOpen: true, eventId: event._id, eventTitle: event.title })}
                        className="btn-action btn-delete"
                      >
                        Delete
                      </button>
                    )}
                  </div>

                  {event.status === 'REJECTED' && event.approvalRemarks && (
                    <div className="rejection-reason">
                      <strong>Rejection Reason:</strong> {event.approvalRemarks}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, eventId: null, eventTitle: '' })}
        title="Delete Event"
        footer={
          <>
            <button
              onClick={() => setDeleteModal({ isOpen: false, eventId: null, eventTitle: '' })}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDeleteEvent(deleteModal.eventId)}
              className="btn-danger"
            >
              Delete
            </button>
          </>
        }
      >
        <p>Are you sure you want to delete <strong>{deleteModal.eventTitle}</strong>?</p>
        <p>This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default SocietyAdminDashboard;
