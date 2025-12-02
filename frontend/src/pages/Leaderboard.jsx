import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PublicNavbar from '../components/Navbar/PublicNavbar';
import StudentNavbar from '../components/Navbar/StudentNavbar';
import api from '../api/axios';
import './Leaderboard.css';

const Leaderboard = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await api.get('/leaderboard?limit=50');
      setLeaderboard(response.data.leaderboard || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMedalIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  return (
    <div className="leaderboard-page">
      {user?.role === 'STUDENT' ? <StudentNavbar /> : <PublicNavbar />}

      <div className="leaderboard-container">
        <div className="leaderboard-header">
          <h1 className="leaderboard-title">🏆 Leaderboard</h1>
          <p className="leaderboard-subtitle">Top participants by XP</p>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading leaderboard...</p>
          </div>
        ) : (
          <div className="leaderboard-list">
            {leaderboard.map((entry) => (
              <div
                key={entry._id}
                className={`leaderboard-item ${entry._id === user?._id ? 'highlight' : ''} ${entry.rank <= 3 ? 'top-three' : ''}`}
              >
                <div className="rank-badge">
                  {getMedalIcon(entry.rank)}
                </div>
                <div className="user-info">
                  <h3 className="user-name">{entry.name}</h3>
                  <div className="user-badges">
                    {entry.badges?.map((badge, idx) => (
                      <span key={idx} className="badge-pill">
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="xp-display">
                  <span className="xp-value">{entry.xp}</span>
                  <span className="xp-label">XP</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
