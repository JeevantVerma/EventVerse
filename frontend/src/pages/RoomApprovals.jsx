import { useState, useEffect } from 'react';
import { useToast } from '../components/Toast/Toast';
import Sidebar from '../components/Sidebar/Sidebar';
import Modal from '../components/Modal/Modal';
import api from '../api/axios';
import './RoomApprovals.css';

const RoomApprovals = () => {
  const toast = useToast();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPendingBookings();
  }, []);

  const fetchPendingBookings = async () => {
    try {
      const response = await api.get('/rooms/bookings/pending');
      setBookings(response.data.bookings || []);
    } catch (error) {
      toast.error('Failed to load pending bookings');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedBooking) return;

    setProcessing(true);
    try {
      await api.post(`/rooms/bookings/${selectedBooking._id}/approve`);
      toast.success('Room booking approved successfully!');
      setShowApproveModal(false);
      setSelectedBooking(null);
      fetchPendingBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve booking');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedBooking || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setProcessing(true);
    try {
      await api.post(`/rooms/bookings/${selectedBooking._id}/reject`, {
        remarks: rejectionReason
      });
      toast.success('Room booking rejected');
      setShowRejectModal(false);
      setSelectedBooking(null);
      setRejectionReason('');
      fetchPendingBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject booking');
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
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
        <p>Loading room approvals...</p>
      </div>
    );
  }

  return (
    <div className="room-approvals-page">
      <Sidebar role="super" />
      
      <div className="room-approvals-content">
        <div className="room-approvals-header">
          <h1>Room Booking Approvals</h1>
          <p>Review and approve room booking requests</p>
        </div>

        {bookings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <h2>No Pending Bookings</h2>
            <p>All room booking requests have been processed</p>
          </div>
        ) : (
          <div className="bookings-list">
            {bookings.map((booking) => (
              <div key={booking._id} className="booking-approval-card">
                <div className="booking-main">
                  <div className="booking-info">
                    <h3>{booking.roomId?.name || 'Room'}</h3>
                    <p className="booking-location">📍 {booking.roomId?.location}</p>
                    
                    <div className="booking-details-grid">
                      <div className="detail-item">
                        <strong>Society:</strong>
                        <span>{booking.bookedBy?.societyName || booking.bookedBy?.name}</span>
                      </div>
                      <div className="detail-item">
                        <strong>Event:</strong>
                        <span>{booking.eventId?.title || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <strong>Start Time:</strong>
                        <span>{formatDate(booking.startDateTime)}</span>
                      </div>
                      <div className="detail-item">
                        <strong>End Time:</strong>
                        <span>{formatDate(booking.endDateTime)}</span>
                      </div>
                      {booking.purpose && (
                        <div className="detail-item full-width">
                          <strong>Purpose:</strong>
                          <span>{booking.purpose}</span>
                        </div>
                      )}
                    </div>

                    {booking.roomId && (
                      <div className="room-info">
                        <strong>Room Details:</strong>
                        <p>Capacity: {booking.roomId.capacity} people</p>
                        {booking.roomId.facilities && booking.roomId.facilities.length > 0 && (
                          <div className="facilities-list">
                            {booking.roomId.facilities.map((facility, idx) => (
                              <span key={idx} className="facility-badge">{facility}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="booking-actions">
                    <button
                      onClick={() => {
                        setSelectedBooking(booking);
                        setShowApproveModal(true);
                      }}
                      className="btn-approve"
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => {
                        setSelectedBooking(booking);
                        setShowRejectModal(true);
                      }}
                      className="btn-reject"
                    >
                      ✕ Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        title="Approve Room Booking"
        footer={
          <>
            <button
              onClick={() => setShowApproveModal(false)}
              className="btn-secondary"
              disabled={processing}
            >
              Cancel
            </button>
            <button
              onClick={handleApprove}
              className="btn-success"
              disabled={processing}
            >
              {processing ? 'Approving...' : 'Approve'}
            </button>
          </>
        }
      >
        <p>
          Are you sure you want to approve the room booking for{' '}
          <strong>{selectedBooking?.roomId?.name}</strong>?
        </p>
        <div className="modal-details">
          <p><strong>Society:</strong> {selectedBooking?.bookedBy?.societyName}</p>
          <p><strong>Event:</strong> {selectedBooking?.eventId?.title}</p>
          <p><strong>Time:</strong> {selectedBooking && formatDate(selectedBooking.startDateTime)} - {selectedBooking && formatDate(selectedBooking.endDateTime)}</p>
        </div>
      </Modal>

      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectionReason('');
        }}
        title="Reject Room Booking"
        footer={
          <>
            <button
              onClick={() => {
                setShowRejectModal(false);
                setRejectionReason('');
              }}
              className="btn-secondary"
              disabled={processing}
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              className="btn-danger"
              disabled={processing || !rejectionReason.trim()}
            >
              {processing ? 'Rejecting...' : 'Reject'}
            </button>
          </>
        }
      >
        <p>
          Please provide a reason for rejecting the room booking for{' '}
          <strong>{selectedBooking?.roomId?.name}</strong>:
        </p>
        <textarea
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          placeholder="Enter rejection reason..."
          className="rejection-textarea"
          rows={4}
        />
      </Modal>
    </div>
  );
};

export default RoomApprovals;
