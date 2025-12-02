import { Link } from 'react-router-dom';
import './Navbar.css';

const PublicNavbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          EventVerse
        </Link>
        <ul className="navbar-menu">
          <li><Link to="/events" className="navbar-link">Events</Link></li>
          <li><Link to="/leaderboard" className="navbar-link">Leaderboard</Link></li>
          <li><Link to="/about" className="navbar-link">About</Link></li>
          <li><Link to="/contact" className="navbar-link">Contact</Link></li>
        </ul>
        <div className="navbar-auth">
          <Link to="/login" className="btn btn-secondary">Login</Link>
          <Link to="/register" className="btn btn-primary">Register</Link>
        </div>
      </div>
    </nav>
  );
};

export default PublicNavbar;
