import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const StudentNavbar = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/student/dashboard" className="navbar-logo">
          EventVerse
        </Link>
        <ul className="navbar-menu">
          <li><Link to="/student/dashboard" className="navbar-link">Dashboard</Link></li>
          <li><Link to="/events" className="navbar-link">Events</Link></li>
          <li><Link to="/student/my-events" className="navbar-link">My Events</Link></li>
          <li><Link to="/leaderboard" className="navbar-link">Leaderboard</Link></li>
          <li><Link to="/about" className="navbar-link">About</Link></li>
          <li><Link to="/contact" className="navbar-link">Contact</Link></li>
        </ul>
        <div className="navbar-auth">
          <span className="navbar-user">
            {user?.name} ({user?.xp || 0} XP)
          </span>
          <button onClick={handleLogout} className="btn btn-secondary">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default StudentNavbar;
