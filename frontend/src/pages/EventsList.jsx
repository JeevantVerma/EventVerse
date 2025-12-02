import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PublicNavbar from '../components/Navbar/PublicNavbar';
import StudentNavbar from '../components/Navbar/StudentNavbar';
import Footer from '../components/Footer/Footer';
import api from '../api/axios';
import './Events.css';

const EventsList = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'APPROVED',
    category: '',
    search: '',
  });

  useEffect(() => {
    fetchEvents();
  }, [filters]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);

      const response = await api.get(`/events?${params.toString()}`);
      setEvents(response.data.events || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      APPROVED: 'badge-success',
      PENDING_APPROVAL: 'badge-warning',
      COMPLETED: 'badge-info',
      DRAFT: 'badge-secondary',
      REJECTED: 'badge-danger',
    };
    return badges[status] || 'badge-secondary';
  };

  return (
    <div className="events-page">
      {user?.role === 'STUDENT' ? <StudentNavbar /> : <PublicNavbar />}

      <div className="events-container">
        <div className="events-header">
          <h1 className="events-title">Discover Events</h1>
          <p className="events-subtitle">Find and register for exciting college events</p>
        </div>

        <div className="events-filters">
          <input
            type="text"
            placeholder="Search events..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="filter-input"
          />

          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="filter-select"
          >
            <option value="">All Categories</option>
            <option value="Technical">Technical</option>
            <option value="Cultural">Cultural</option>
            <option value="Sports">Sports</option>
            <option value="Literary">Literary</option>
            <option value="Workshops">Workshops</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="empty-state">
            <p>No events found</p>
          </div>
        ) : (
          <div className="events-grid">
            {events.map((event) => (
              <Link to={`/events/${event._id}`} key={event._id} className="event-card">
                {event.imageUrl && (
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="event-card-image"
                  />
                )}
                
                <div className="event-card-content">
                  <div className="event-card-header">
                    <span className={`badge ${getStatusBadge(event.status)}`}>
                      {event.status}
                    </span>
                    <span className="event-category">{event.category}</span>
                  </div>

                  <h3 className="event-card-title">{event.title}</h3>
                  <p className="event-card-society">{event.societyName}</p>

                  <p className="event-card-description">
                    {event.description.substring(0, 120)}
                    {event.description.length > 120 ? '...' : ''}
                  </p>

                  <div className="event-card-meta">
                    <div className="event-meta-item">
                      <span className="meta-icon">📅</span>
                      <span className="meta-text">{formatDate(event.startDateTime)}</span>
                    </div>
                    <div className="event-meta-item">
                      <span className="meta-icon">👥</span>
                      <span className="meta-text">
                        {event.registeredParticipants?.length || 0}/{event.maxParticipants}
                      </span>
                    </div>
                  </div>

                  {event.roomName && (
                    <div className="event-card-venue">
                      <span className="meta-icon">📍</span>
                      <span>{event.roomName}</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default EventsList;
