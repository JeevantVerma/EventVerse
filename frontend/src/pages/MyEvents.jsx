import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast/Toast';
import StudentNavbar from '../components/Navbar/StudentNavbar';
import Modal from '../components/Modal/Modal';
import api from '../api/axios';
import './MyEvents.css';

const MyEvents = () => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState('all'); // all, upcoming, past, completed
  const [loading, setLoading] = useState(true);
  const [cancelModal, setCancelModal] = useState({ isOpen: false, eventId: null, eventTitle: '' });

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      const response = await api.get('/profile');
      const registeredEvents = response.data.registeredEvents || [];
      setEvents(registeredEvents);
    } catch (error) {
      toast.error('Failed to load your events');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredEvents = () => {
    const now = new Date();
    
    switch (filter) {
      case 'upcoming':
        return events.filter(e => new Date(e.startDateTime) > now && e.status === 'APPROVED');
      case 'past':
        return events.filter(e => new Date(e.endDateTime) < now);
      case 'completed':
        return events.filter(e => e.status === 'COMPLETED');
      default:
        return events;
    }
  };

  const filteredEvents = getFilteredEvents();

  const handleCancelRegistration = async (eventId) => {
    try {
      await api.delete(`/events/${eventId}/register`);
      toast.success('Registration cancelled successfully!');
      setCancelModal({ isOpen: false, eventId: null, eventTitle: '' });
      fetchMyEvents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel registration');
    }
  };

  const getEventStatus = (event) => {
    const now = new Date();
    const start = new Date(event.startDateTime);
    const end = new Date(event.endDateTime);

    if (event.status === 'COMPLETED') return { text: 'Completed', color: '#3b82f6' };
    if (now < start) return { text: 'Upcoming', color: '#10b981' };
    if (now >= start && now <= end) return { text: 'Ongoing', color: '#f59e0b' };
    if (now > end) return { text: 'Past', color: '#6b7280' };
    return { text: event.status, color: '#6b7280' };
  };

  const isWinner = (event) => {
    if (!event.winners || event.winners.size === 0) return null;
    for (const [position, winnerId] of event.winners.entries()) {
      if (winnerId === user._id) return position;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your events...</p>
      </div>
    );
  }

  return (
    <div className="my-events-page">
      <StudentNavbar />

      <div className="my-events-container">
        <header className="my-events-header">
          <div>
            <h1>My Events</h1>
            <p>Track all your registered events and participation history</p>
          </div>
          <div className="stats-summary">
            <div className="stat-item">
              <span className="stat-number">{events.length}</span>
              <span className="stat-label">Total</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {events.filter(e => new Date(e.startDateTime) > new Date()).length}
              </span>
              <span className="stat-label">Upcoming</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {events.filter(e => e.status === 'COMPLETED').length}
              </span>
              <span className="stat-label">Completed</span>
            </div>
          </div>
        </header>

        <div className="filter-bar">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Events ({events.length})
          </button>
          <button
            className={`filter-btn ${filter === 'upcoming' ? 'active' : ''}`}
            onClick={() => setFilter('upcoming')}
          >
            Upcoming ({events.filter(e => new Date(e.startDateTime) > new Date() && e.status === 'APPROVED').length})
          </button>
          <button
            className={`filter-btn ${filter === 'past' ? 'active' : ''}`}
            onClick={() => setFilter('past')}
          >
            Past ({events.filter(e => new Date(e.endDateTime) < new Date()).length})
          </button>
          <button
            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed ({events.filter(e => e.status === 'COMPLETED').length})
          </button>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <h2>No events found</h2>
            <p>
              {filter === 'all' 
                ? "You haven't registered for any events yet." 
                : `No ${filter} events found.`}
            </p>
            <button
              onClick={() => navigate('/events')}
              className="btn-primary"
            >
              Browse Events
            </button>
          </div>
        ) : (
          <div className="events-grid">
            {filteredEvents.map(event => {
              const status = getEventStatus(event);
              const winnerPosition = isWinner(event);

              return (
                <div key={event._id} className="event-card">
                  {event.imageUrl && (
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="event-card-image"
                    />
                  )}
                  
                  {winnerPosition && (
                    <div className="winner-badge">🏆 {winnerPosition}</div>
                  )}

                  <div className="event-card-body">
                    <div className="event-card-header">
                      <h3>{event.title}</h3>
                      <span
                        className="status-badge"
                        style={{ backgroundColor: status.color }}
                      >
                        {status.text}
                      </span>
                    </div>

                    <p className="event-society">by {event.societyName}</p>

                    <div className="event-meta">
                      <span>📅 {new Date(event.startDateTime).toLocaleDateString()}</span>
                      <span>📂 {event.category}</span>
                      {event.roomName && <span>📍 {event.roomName}</span>}
                    </div>

                    {winnerPosition && (
                      <div className="xp-earned">
                        <span className="xp-icon">⭐</span>
                        <span>
                          +{winnerPosition.includes('1st') ? 50 : winnerPosition.includes('2nd') ? 30 : 20} XP Earned
                        </span>
                      </div>
                    )}

                    {!winnerPosition && event.status === 'COMPLETED' && (
                      <div className="xp-earned participation">
                        <span className="xp-icon">✓</span>
                        <span>+10 XP (Participation)</span>
                      </div>
                    )}

                    <div className="event-actions">
                      <button
                        onClick={() => navigate(`/events/${event._id}`)}
                        className="btn-view"
                      >
                        View Details
                      </button>

                      {new Date(event.startDateTime) > new Date() && event.status === 'APPROVED' && (
                        <button
                          onClick={() => setCancelModal({ isOpen: true, eventId: event._id, eventTitle: event.title })}
                          className="btn-cancel"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        isOpen={cancelModal.isOpen}
        onClose={() => setCancelModal({ isOpen: false, eventId: null, eventTitle: '' })}
        title="Cancel Registration"
        footer={
          <>
            <button
              onClick={() => setCancelModal({ isOpen: false, eventId: null, eventTitle: '' })}
              className="btn-secondary"
            >
              Keep Registration
            </button>
            <button
              onClick={() => handleCancelRegistration(cancelModal.eventId)}
              className="btn-danger"
            >
              Cancel Registration
            </button>
          </>
        }
      >
        <p>Are you sure you want to cancel your registration for <strong>{cancelModal.eventTitle}</strong>?</p>
        <p>You can register again later if spots are still available.</p>
      </Modal>
    </div>
  );
};

export default MyEvents;
