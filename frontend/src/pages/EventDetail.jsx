import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast/Toast';
import PublicNavbar from '../components/Navbar/PublicNavbar';
import StudentNavbar from '../components/Navbar/StudentNavbar';
import Modal from '../components/Modal/Modal';
import api from '../api/axios';
import './EventDetail.css';

const EventDetail = () => {
  const { id } = useParams();
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      const response = await api.get(`/events/${id}`);
      setEvent(response.data.event);
    } catch (error) {
      toast.error('Failed to load event details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!user) {
      toast.info('Please login to register for events');
      navigate('/login');
      return;
    }

    setRegistering(true);
    try {
      const response = await api.post(`/events/${id}/register`);
      toast.success('🎉 Successfully registered for event! You earned +10 XP!');
      
      // Refresh user data to update XP in navbar
      await refreshUser();
      
      await fetchEventDetails();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      console.error('Registration error:', errorMessage, error.response?.data);
      toast.error(errorMessage);
    } finally {
      setRegistering(false);
    }
  };

  const handleCancelRegistration = async () => {
    try {
      await api.delete(`/events/${id}/register`);
      toast.success('Registration cancelled');
      setShowCancelModal(false);
      fetchEventDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Cancellation failed');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isRegistered = () => {
    return event?.registeredParticipants?.some(p => p._id === user?._id);
  };

  const canRegister = () => {
    if (!user || user.role !== 'STUDENT') return false;
    if (event?.status !== 'APPROVED') return false;
    if (new Date() > new Date(event?.endDateTime)) return false;
    if (isRegistered()) return false;
    if (event?.registeredParticipants?.length >= event?.maxParticipants) return false;
    return true;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading event details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="error-container">
        <h2>Event not found</h2>
        <button onClick={() => navigate('/events')} className="btn-primary">
          Back to Events
        </button>
      </div>
    );
  }

  return (
    <div className="event-detail-page">
      {user?.role === 'STUDENT' ? <StudentNavbar /> : <PublicNavbar />}

      {event.imageUrl && (
        <div className="event-banner">
          <img src={event.imageUrl} alt={event.title} className="event-banner-image" />
        </div>
      )}

      <div className="event-detail-container">
        <div className="event-detail-header">
          <div className="header-top">
            <span className={`status-badge status-${event.status.toLowerCase()}`}>
              {event.status}
            </span>
            <span className="category-badge">{event.category}</span>
          </div>
          <h1 className="event-title">{event.title}</h1>
          <p className="event-society">Organized by {event.societyName}</p>
        </div>

        <div className="event-detail-grid">
          <div className="event-main-content">
            <section className="detail-section">
              <h2 className="section-title">About This Event</h2>
              <p className="event-description">{event.description}</p>
            </section>

            <section className="detail-section">
              <h2 className="section-title">Event Details</h2>
              <div className="detail-items">
                <div className="detail-item">
                  <span className="detail-icon">📅</span>
                  <div>
                    <strong>Start:</strong> {formatDate(event.startDateTime)}
                  </div>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">🏁</span>
                  <div>
                    <strong>End:</strong> {formatDate(event.endDateTime)}
                  </div>
                </div>
                {event.roomName && (
                  <div className="detail-item">
                    <span className="detail-icon">📍</span>
                    <div>
                      <strong>Venue:</strong> {event.roomName}
                    </div>
                  </div>
                )}
                <div className="detail-item">
                  <span className="detail-icon">👥</span>
                  <div>
                    <strong>Participants:</strong> {event.registeredParticipants?.length || 0} / {event.maxParticipants}
                  </div>
                </div>
              </div>
            </section>

            {event.prizes && event.prizes.length > 0 && (
              <section className="detail-section">
                <h2 className="section-title">🏆 Prizes</h2>
                <div className="prizes-grid">
                  {event.prizes.map((prize, idx) => (
                    <div key={idx} className="prize-card">
                      <h3 className="prize-position">{prize.position}</h3>
                      <p className="prize-title">{prize.title}</p>
                      {prize.description && <p className="prize-description">{prize.description}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {event.status === 'COMPLETED' && event.winners && event.winners.size > 0 && (
              <section className="detail-section">
                <h2 className="section-title">🎉 Winners</h2>
                <div className="winners-list">
                  {Array.from(event.winners.entries()).map(([position, winnerId]) => {
                    const winner = event.registeredParticipants?.find(p => p._id === winnerId);
                    return (
                      <div key={position} className="winner-item">
                        <span className="winner-position">{position}:</span>
                        <span className="winner-name">{winner?.name || 'Unknown'}</span>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>

          <div className="event-sidebar">
            {canRegister() && (
              <button
                onClick={handleRegister}
                disabled={registering}
                className="btn-register"
              >
                {registering ? 'Registering...' : 'Register for Event'}
              </button>
            )}

            {isRegistered() && event.status === 'APPROVED' && new Date() < new Date(event.startDateTime) && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="btn-cancel"
              >
                Cancel Registration
              </button>
            )}

            {isRegistered() && (
              <div className="registered-badge">
                ✓ You're registered!
              </div>
            )}

            {event.status !== 'APPROVED' && (
              <div className="info-box">
                <p>This event is not yet open for registration.</p>
              </div>
            )}

            {event.registeredParticipants?.length >= event.maxParticipants && !isRegistered() && (
              <div className="info-box warning">
                <p>⚠️ Event is full</p>
              </div>
            )}

            {new Date() > new Date(event.endDateTime) && (
              <div className="info-box">
                <p>This event has ended</p>
              </div>
            )}

            {event.proposalPdfUrl && (user?.role === 'SUPER_ADMIN' || user?.role === 'SOCIETY_ADMIN') && (
              <a
                href={`http://localhost:5000${event.proposalPdfUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-view-proposal"
              >
                📄 View Proposal
              </a>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Registration"
        footer={
          <>
            <button onClick={() => setShowCancelModal(false)} className="btn btn-secondary">
              Keep Registration
            </button>
            <button onClick={handleCancelRegistration} className="btn btn-danger">
              Yes, Cancel
            </button>
          </>
        }
      >
        <p>Are you sure you want to cancel your registration for this event?</p>
        <p style={{ marginTop: '0.5rem', color: '#6b7280' }}>
          You can register again later if spots are available.
        </p>
      </Modal>
    </div>
  );
};

export default EventDetail;
