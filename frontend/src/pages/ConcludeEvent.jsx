import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast/Toast';
import Sidebar from '../components/Sidebar/Sidebar';
import api from '../api/axios';
import './ConcludeEvent.css';

const ConcludeEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [winners, setWinners] = useState({});

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      const response = await api.get(`/events/${id}`);
      const eventData = response.data.event;
      setEvent(eventData);

      // Initialize winners state based on prizes
      if (eventData.prizes && eventData.prizes.length > 0) {
        const initialWinners = {};
        eventData.prizes.forEach(prize => {
          initialWinners[prize.position] = '';
        });
        setWinners(initialWinners);
      }
    } catch (error) {
      toast.error('Failed to load event details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleWinnerChange = (position, participantId) => {
    setWinners(prev => ({
      ...prev,
      [position]: participantId
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate that at least one winner is selected
    const hasWinner = Object.values(winners).some(w => w);
    if (!hasWinner) {
      toast.error('Please select at least one winner');
      return;
    }

    // Check for duplicate winners
    const selectedWinners = Object.values(winners).filter(w => w);
    const uniqueWinners = new Set(selectedWinners);
    if (selectedWinners.length !== uniqueWinners.size) {
      toast.error('Cannot select the same participant for multiple positions');
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/events/${id}/conclude`, { winners });
      toast.success('Event concluded successfully! XP awarded to participants.');
      navigate('/society/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to conclude event');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading event...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="error-container">
        <h2>Event not found</h2>
        <button onClick={() => navigate('/society/dashboard')} className="btn-primary">
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (event.status !== 'APPROVED') {
    return (
      <div className="error-container">
        <h2>Cannot conclude this event</h2>
        <p>Only approved events that have ended can be concluded.</p>
        <button onClick={() => navigate('/society/dashboard')} className="btn-primary">
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (new Date() < new Date(event.endDateTime)) {
    return (
      <div className="error-container">
        <h2>Event hasn't ended yet</h2>
        <p>You can only conclude an event after its end date and time.</p>
        <button onClick={() => navigate('/society/dashboard')} className="btn-primary">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="conclude-event-page">
      <Sidebar />

      <div className="conclude-content">
        <header className="conclude-header">
          <h1>Conclude Event</h1>
          <p>Select winners for <strong>{event.title}</strong></p>
        </header>

        <div className="event-info-card">
          <h2>{event.title}</h2>
          <div className="event-meta">
            <span>📅 {new Date(event.startDateTime).toLocaleDateString()}</span>
            <span>👥 {event.registeredParticipants?.length || 0} Participants</span>
            <span>🏆 {event.prizes?.length || 0} Prizes</span>
          </div>
        </div>

        {!event.registeredParticipants || event.registeredParticipants.length === 0 ? (
          <div className="no-participants-message">
            <p>No participants registered for this event.</p>
            <p>You can still conclude the event without selecting winners.</p>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-primary"
            >
              {submitting ? 'Concluding...' : 'Conclude Event'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="winners-form">
            <h2 className="section-title">Select Winners</h2>
            <p className="section-description">
              Choose participants for each prize position. Winners will receive XP based on their position.
            </p>

            {event.prizes && event.prizes.length > 0 ? (
              <div className="winners-grid">
                {event.prizes.map((prize, index) => (
                  <div key={index} className="winner-selection-card">
                    <div className="prize-info">
                      <h3>{prize.position}</h3>
                      <p className="prize-title">{prize.title}</p>
                      {prize.description && (
                        <p className="prize-description">{prize.description}</p>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor={`winner-${prize.position}`}>Select Winner</label>
                      <select
                        id={`winner-${prize.position}`}
                        value={winners[prize.position] || ''}
                        onChange={(e) => handleWinnerChange(prize.position, e.target.value)}
                        className="winner-select"
                      >
                        <option value="">-- Select Participant --</option>
                        {event.registeredParticipants.map(participant => (
                          <option key={participant._id} value={participant._id}>
                            {participant.name} ({participant.email})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="xp-indicator">
                      {prize.position.includes('1st') && <span className="xp-badge gold">+50 XP</span>}
                      {prize.position.includes('2nd') && <span className="xp-badge silver">+30 XP</span>}
                      {prize.position.includes('3rd') && <span className="xp-badge bronze">+20 XP</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-prizes-message">
                <p>This event has no prizes defined.</p>
                <p>All participants will receive 10 XP for participation.</p>
              </div>
            )}

            <div className="participants-info">
              <h3>All Participants</h3>
              <p>The following {event.registeredParticipants.length} participant(s) will receive 10 XP for participation:</p>
              <div className="participants-list">
                {event.registeredParticipants.map(participant => (
                  <div key={participant._id} className="participant-item">
                    {participant.name} <span className="participant-email">({participant.email})</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate('/society/dashboard')}
                className="btn btn-secondary"
                disabled={submitting}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
              >
                {submitting ? 'Concluding Event...' : 'Conclude Event & Award XP'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ConcludeEvent;
