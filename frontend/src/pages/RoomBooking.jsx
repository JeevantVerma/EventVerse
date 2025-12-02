import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast/Toast';
import Sidebar from '../components/Sidebar/Sidebar';
import Modal from '../components/Modal/Modal';
import api from '../api/axios';
import './RoomBooking.css';

const RoomBooking = () => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookModal, setShowBookModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    eventId: '',
    startDateTime: '',
    endDateTime: '',
    purpose: '',
  });
  const [myEvents, setMyEvents] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [roomsRes, bookingsRes, eventsRes] = await Promise.all([
        api.get('/rooms'),
        api.get('/rooms/bookings/my-bookings'),
        api.get('/events', { params: { societyName: user.societyName, status: 'APPROVED' } })
      ]);

      setRooms(roomsRes.data.rooms || []);
      setMyBookings(bookingsRes.data.bookings || []);
      setMyEvents(eventsRes.data.events || []);
    } catch (error) {
      toast.error('Failed to load data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookRoom = (room) => {
    setSelectedRoom(room);
    setBookingForm({
      eventId: '',
      startDateTime: '',
      endDateTime: '',
      purpose: '',
    });
    setShowBookModal(true);
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();

    if (!bookingForm.eventId) {
      toast.error('Please select an event');
      return;
    }

    try {
      await api.post(`/rooms/${bookingForm.eventId}/book-room`, {
        roomId: selectedRoom._id,
      });
      
      toast.success('Room booked successfully!');
      setShowBookModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to book room');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      await api.delete(`/rooms/bookings/${bookingId}`);
      toast.success('Booking cancelled successfully!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isRoomAvailable = (room) => {
    // Simple availability check - can be enhanced
    return room.isAvailable !== false;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading rooms...</p>
      </div>
    );
  }

  return (
    <div className="room-booking-page">
      <Sidebar role="society" />
      
      <div className="room-booking-content">
        <div className="room-booking-header">
          <h1>Room Booking</h1>
          <p>Book rooms for your events</p>
        </div>

        {/* My Bookings Section */}
        <div className="section">
          <h2>My Bookings</h2>
          {myBookings.length === 0 ? (
            <p className="empty-message">No bookings yet. Book a room below!</p>
          ) : (
            <div className="bookings-grid">
                  {myBookings.map((booking) => (
                <div key={booking._id} className="booking-card">
                  <div className="booking-header">
                    <h3>{booking.roomId?.name || 'Room'}</h3>
                    <span className={`status-badge status-${booking.status.toLowerCase()}`}>
                      {booking.status}
                    </span>
                  </div>
                  <div className="booking-details">
                    <p><strong>Location:</strong> {booking.roomId?.location}</p>
                    <p><strong>Event:</strong> {booking.eventId?.title || 'N/A'}</p>
                    <p><strong>Purpose:</strong> {booking.purpose}</p>
                    <p><strong>Start:</strong> {formatDate(booking.startDateTime)}</p>
                    <p><strong>End:</strong> {formatDate(booking.endDateTime)}</p>
                  </div>
                  {(booking.status === 'PENDING' || booking.status === 'PENDING_APPROVAL') && (
                    <button
                      onClick={() => handleCancelBooking(booking._id)}
                      className="btn-cancel-booking"
                    >
                      Cancel Booking
                    </button>
                  )}
                  {booking.status === 'REJECTED' && booking.remarks && (
                    <div className="rejection-reason">
                      <strong>Rejection Reason:</strong> {booking.remarks}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Available Rooms Section */}
        <div className="section">
          <h2>Available Rooms</h2>
          <div className="rooms-grid">
            {rooms.map((room) => (
              <div key={room._id} className="room-card">
                <div className="room-header">
                  <h3>{room.name}</h3>
                  {isRoomAvailable(room) && (
                    <span className="available-badge">Available</span>
                  )}
                </div>
                <div className="room-details">
                  <p><strong>Location:</strong> {room.location}</p>
                  <p><strong>Capacity:</strong> {room.capacity} people</p>
                  {room.facilities && room.facilities.length > 0 && (
                    <div className="facilities">
                      <strong>Facilities:</strong>
                      <div className="facility-tags">
                        {room.facilities.map((facility, idx) => (
                          <span key={idx} className="facility-tag">{facility}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleBookRoom(room)}
                  className="btn-book-room"
                  disabled={!isRoomAvailable(room)}
                >
                  Book Room
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <Modal
        isOpen={showBookModal}
        onClose={() => setShowBookModal(false)}
        title={`Book ${selectedRoom?.name}`}
        size="medium"
      >
        <form onSubmit={handleSubmitBooking} className="booking-form">
          <div className="form-group">
            <label>Select Event *</label>
            <select
              value={bookingForm.eventId}
              onChange={(e) => setBookingForm({ ...bookingForm, eventId: e.target.value })}
              required
            >
              <option value="">-- Select Event --</option>
              {myEvents
                .filter(e => e.status === 'APPROVED' || e.status === 'PENDING_APPROVAL')
                .map((event) => (
                  <option key={event._id} value={event._id}>
                    {event.title} ({event.status})
                  </option>
                ))}
            </select>
          </div>

          <div className="form-group">
            <label>Start Date & Time *</label>
            <input
              type="datetime-local"
              value={bookingForm.startDateTime}
              onChange={(e) => setBookingForm({ ...bookingForm, startDateTime: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>End Date & Time *</label>
            <input
              type="datetime-local"
              value={bookingForm.endDateTime}
              onChange={(e) => setBookingForm({ ...bookingForm, endDateTime: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Purpose</label>
            <textarea
              value={bookingForm.purpose}
              onChange={(e) => setBookingForm({ ...bookingForm, purpose: e.target.value })}
              placeholder="Describe the purpose of this booking..."
              rows={3}
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={() => setShowBookModal(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Book Room
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RoomBooking;
