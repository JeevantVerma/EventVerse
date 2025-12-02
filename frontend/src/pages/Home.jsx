import { Link } from 'react-router-dom';
import PublicNavbar from '../components/Navbar/PublicNavbar';
import Footer from '../components/Footer/Footer';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      <PublicNavbar />
      
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Welcome to EventVerse</h1>
          <p className="hero-subtitle">
            Your centralized platform for college event management
          </p>
          <p className="hero-description">
            Discover events, participate, earn XP, climb the leaderboard, and make your college experience unforgettable!
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-hero-primary">
              Get Started
            </Link>
            <Link to="/events" className="btn btn-hero-secondary">
              Explore Events
            </Link>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="features-container">
          <h2 className="section-title">Why Choose EventVerse?</h2>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3 className="feature-title">Centralized Platform</h3>
              <p className="feature-description">
                All college events from every club and society in one place
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🏆</div>
              <h3 className="feature-title">XP & Leaderboard</h3>
              <p className="feature-description">
                Earn XP by participating in events and compete on the leaderboard
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🎪</div>
              <h3 className="feature-title">Easy Registration</h3>
              <p className="feature-description">
                Register for events with just a click and manage your schedule
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">✨</div>
              <h3 className="feature-title">Smart Recommendations</h3>
              <p className="feature-description">
                Get personalized event suggestions based on your interests
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🏛️</div>
              <h3 className="feature-title">Venue Management</h3>
              <p className="feature-description">
                Seamless room booking with automatic clash detection
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3 className="feature-title">Track Progress</h3>
              <p className="feature-description">
                Monitor your participation history and unlock badges
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="cta-content">
          <h2 className="cta-title">Ready to Get Started?</h2>
          <p className="cta-description">
            Join EventVerse today and never miss another exciting event!
          </p>
          <Link to="/register" className="btn btn-cta">
            Create Your Account
          </Link>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Home;
