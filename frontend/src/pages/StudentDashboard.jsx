import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StudentNavbar from '../components/Navbar/StudentNavbar';
import api from '../api/axios';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [highlights, setHighlights] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [rank, setRank] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [profileRes, highlightsRes] = await Promise.all([
        api.get('/profile'),
        api.get('/highlights'),
      ]);

      setRank(profileRes.data.rank);
      setHighlights(highlightsRes.data.highlights?.slice(0, 4) || []);
      setUpcomingEvents(
        profileRes.data.registeredEvents?.filter(
          (e) => new Date(e.startDateTime) > new Date() && e.status === 'APPROVED'
        ).slice(0, 5) || []
      );
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNextBadge = () => {
    const xp = user?.xp || 0;
    if (xp < 50) return { badge: 'Newcomer', required: 50, progress: (xp / 50) * 100 };
    if (xp < 100) return { badge: 'Active Participant', required: 100, progress: (xp / 100) * 100 };
    if (xp < 250) return { badge: 'Event Enthusiast', required: 250, progress: (xp / 250) * 100 };
    if (xp < 500) return { badge: 'Campus Legend', required: 500, progress: (xp / 500) * 100 };
    return { badge: 'Max Level', required: 500, progress: 100 };
  };

  const nextBadge = getNextBadge();

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="student-dashboard">
      <StudentNavbar />

      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Welcome back, {user?.name}!</h1>
          <p className="dashboard-subtitle">Your EventVerse Dashboard</p>
        </div>

        <div className="dashboard-grid">
          {/* XP Card */}
          <div className="dashboard-card xp-card">
            <h2 className="card-title">Your XP Progress</h2>
            <div className="xp-display-large">
              <span className="xp-value-large">{user?.xp || 0}</span>
              <span className="xp-label-large">XP</span>
            </div>
            <div className="progress-section">
              <div className="progress-info">
                <span>Progress to {nextBadge.badge}</span>
                <span>{user?.xp || 0} / {nextBadge.required}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${nextBadge.progress}%` }}></div>
              </div>
            </div>
            <div className="badges-display">
              {user?.badges?.length > 0 ? (
                user.badges.map((badge, idx) => (
                  <span key={idx} className="badge-earned">
                    🏅 {badge}
                  </span>
                ))
              ) : (
                <span className="no-badges">No badges yet - participate in events!</span>
              )}
            </div>
          </div>

          {/* Rank Card */}
          <div className="dashboard-card rank-card">
            <h2 className="card-title">Your Rank</h2>
            <div className="rank-display">
              <span className="rank-value">#{rank || '—'}</span>
            </div>
            <p className="rank-description">Out of all students</p>
            <Link to="/leaderboard" className="btn-view-leaderboard">
              View Leaderboard
            </Link>
          </div>

          {/* Highlights Section */}
          <div className="dashboard-card highlights-card">
            <h2 className="card-title">✨ Recommended For You</h2>
            {highlights.length > 0 ? (
              <div className="highlights-list">
                {highlights.map((event) => (
                  <Link to={`/events/${event._id}`} key={event._id} className="highlight-item">
                    {event.imageUrl && (
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="highlight-image"
                      />
                    )}
                    <div className="highlight-content">
                      <h4 className="highlight-title">{event.title}</h4>
                      <p className="highlight-meta">
                        {event.category} • {event.societyName}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="empty-message">No recommendations yet. Set your favorite categories in settings!</p>
            )}
            <Link to="/events" className="btn-view-all">
              Explore All Events
            </Link>
          </div>

          {/* Upcoming Events */}
          <div className="dashboard-card upcoming-card">
            <h2 className="card-title">📅 My Upcoming Events</h2>
            {upcomingEvents.length > 0 ? (
              <div className="upcoming-list">
                {upcomingEvents.map((event) => (
                  <Link to={`/events/${event._id}`} key={event._id} className="upcoming-item">
                    {event.imageUrl && (
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="upcoming-image"
                      />
                    )}
                    <div className="upcoming-content">
                      <h4 className="upcoming-title">{event.title}</h4>
                      <p className="upcoming-date">
                        {new Date(event.startDateTime).toLocaleDateString()}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="empty-message">No upcoming events. Browse and register for events!</p>
            )}
            <Link to="/student/my-events" className="btn-view-all">
              View All My Events
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
