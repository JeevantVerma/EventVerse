import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast/Toast';
import Sidebar from '../components/Sidebar/Sidebar';
import Modal from '../components/Modal/Modal';
import api from '../api/axios';
import './Approvals.css';

const Approvals = () => {
  const toast = useToast();
  const navigate = useNavigate();

  const [pendingEvents, setPendingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      const response = await api.get('/approvals/events');
      setPendingEvents(response.data.events || []);
    } catch (error) {
      toast.error('Failed to load pending approvals');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedEvent) return;

    setProcessing(true);
    try {
      await api.post(`/approvals/events/${selectedEvent._id}/approve`);
      toast.success('Event approved successfully!');
      setShowApproveModal(false);
      setSelectedEvent(null);
      fetchPendingApprovals();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve event');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedEvent || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setProcessing(true);
    try {
      await api.post(`/approvals/events/${selectedEvent._id}/reject`, {
        remarks: rejectionReason
      });
      toast.success('Event rejected');
      setShowRejectModal(false);
      setSelectedEvent(null);
      setRejectionReason('');
      fetchPendingApprovals();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject event');
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading approvals...</p>
      </div>
    );
  }

  return (
    <div className="approvals-page">
      <Sidebar />

      <div className="approvals-content">
        <header className="approvals-header">
          <h1>Pending Approvals</h1>
          <p>{pendingEvents.length} event{pendingEvents.length !== 1 ? 's' : ''} awaiting review</p>
        </header>

        {pendingEvents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✓</div>
            <h2>All caught up!</h2>
            <p>No pending approvals at the moment</p>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="btn-primary"
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
          <div className="approvals-list">
            {pendingEvents.map(event => (
              <div key={event._id} className="approval-card">
                {event.imageUrl && (
                  <div className="approval-card-image">
                    <img src={event.imageUrl} alt={event.title} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px 8px 0 0' }} />
                  </div>
                )}
                <div className="approval-card-header">
                  <div>
                    <h3>{event.title}</h3>
                    <p className="society-name">by {event.societyName}</p>
                  </div>
                  <span className="category-badge">{event.category}</span>
                </div>

                <p className="event-description">
                  {event.description?.substring(0, 200)}
                  {event.description?.length > 200 ? '...' : ''}
                </p>

                <div className="event-details-grid">
                  <div className="detail-item">
                    <strong>📅 Start:</strong> {formatDate(event.startDateTime)}
                  </div>
                  <div className="detail-item">
                    <strong>🏁 End:</strong> {formatDate(event.endDateTime)}
                  </div>
                  <div className="detail-item">
                    <strong>👥 Max Participants:</strong> {event.maxParticipants}
                  </div>
                  {event.prizes && event.prizes.length > 0 && (
                    <div className="detail-item">
                      <strong>🏆 Prizes:</strong> {event.prizes.length}
                    </div>
                  )}
                </div>

                {event.prizes && event.prizes.length > 0 && (
                  <div className="prizes-preview">
                    <strong>Prize Pool:</strong>
                    <div className="prizes-list">
                      {event.prizes.map((prize, idx) => (
                        <span key={idx} className="prize-tag">
                          {prize.position}: {prize.title}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="approval-actions">
                  {event.proposalPdfUrl && (
                    <a
                      href={`http://localhost:3001${event.proposalPdfUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-view-proposal"
                    >
                      📄 View Proposal PDF
                    </a>
                  )}

                  <button
                    onClick={() => navigate(`/events/${event._id}`)}
                    className="btn-view-details"
                  >
                    View Full Details
                  </button>

                  <button
                    onClick={() => {
                      setSelectedEvent(event);
                      setShowRejectModal(true);
                    }}
                    className="btn-reject"
                  >
                    ✗ Reject
                  </button>

                  <button
                    onClick={() => {
                      setSelectedEvent(event);
                      setShowApproveModal(true);
                    }}
                    className="btn-approve"
                  >
                    ✓ Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={showApproveModal}
        onClose={() => !processing && setShowApproveModal(false)}
        title="Approve Event"
        footer={
          <>
            <button
              onClick={() => setShowApproveModal(false)}
              className="btn btn-secondary"
              disabled={processing}
            >
              Cancel
            </button>
            <button
              onClick={handleApprove}
              className="btn btn-approve"
              disabled={processing}
            >
              {processing ? 'Approving...' : 'Confirm Approval'}
            </button>
          </>
        }
      >
        <p>
          Are you sure you want to approve <strong>{selectedEvent?.title}</strong>?
        </p>
        <p style={{ marginTop: '0.5rem', color: '#6b7280' }}>
          This event will be visible to students and open for registration.
        </p>
      </Modal>

      <Modal
        isOpen={showRejectModal}
        onClose={() => !processing && setShowRejectModal(false)}
        title="Reject Event"
        footer={
          <>
            <button
              onClick={() => {
                setShowRejectModal(false);
                setRejectionReason('');
              }}
              className="btn btn-secondary"
              disabled={processing}
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              className="btn btn-danger"
              disabled={processing || !rejectionReason.trim()}
            >
              {processing ? 'Rejecting...' : 'Confirm Rejection'}
            </button>
          </>
        }
      >
        <p style={{ marginBottom: '1rem' }}>
          Rejecting <strong>{selectedEvent?.title}</strong>
        </p>
        <label htmlFor="rejectionReason" style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>
          Reason for rejection *
        </label>
        <textarea
          id="rejectionReason"
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          placeholder="Explain why this event is being rejected..."
          rows="4"
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '1rem',
            fontFamily: 'inherit',
            resize: 'vertical'
          }}
        />
      </Modal>
    </div>
  );
};

export default Approvals;
