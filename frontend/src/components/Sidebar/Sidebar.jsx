import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getMenuItems = () => {
    if (user?.role === 'SOCIETY_ADMIN') {
      return [
        { path: '/society/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/society/events/create', label: 'Create Event', icon: '➕' },
        { path: '/society/rooms', label: 'Book Room', icon: '🏛️' },
        { path: '/events', label: 'All Events', icon: '📅' },
        { path: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
      ];
    } else if (user?.role === 'SUPER_ADMIN') {
      return [
        { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/admin/approvals', label: 'Event Approvals', icon: '✓' },
        { path: '/admin/room-approvals', label: 'Room Approvals', icon: '🏛️' },
        { path: '/events', label: 'All Events', icon: '📅' },
        { path: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
      ];
    }
    return [];
  };

  const menuItems = getMenuItems();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-logo">EventVerse</h2>
        <div className="sidebar-user">
          <div className="sidebar-user-info">
            <p className="sidebar-user-name">{user?.name}</p>
            <p className="sidebar-user-role">
              {user?.role === 'SOCIETY_ADMIN' ? 'Society Admin' : 'Super Admin'}
            </p>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul className="sidebar-menu">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span className="sidebar-label">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="sidebar-logout">
          <span className="sidebar-icon">🚪</span>
          <span className="sidebar-label">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
