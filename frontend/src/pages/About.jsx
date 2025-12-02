import { useAuth } from '../context/AuthContext';
import PublicNavbar from '../components/Navbar/PublicNavbar';
import StudentNavbar from '../components/Navbar/StudentNavbar';
import './About.css';

const About = () => {
  const { user } = useAuth();

  return (
    <div className="about-page">
      {user?.role === 'STUDENT' ? <StudentNavbar /> : <PublicNavbar />}

      <div className="about-container">
        <header className="about-header">
          <h1>About EventVerse</h1>
          <p className="about-subtitle">Your Gateway to Campus Events</p>
        </header>

        <section className="about-section">
          <h2>Our Mission</h2>
          <p>
            EventVerse is a comprehensive event management platform designed specifically for college communities. 
            We aim to streamline the entire event lifecycle - from creation and approval to registration and participation tracking.
          </p>
        </section>

        <section className="about-section">
          <h2>What We Offer</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎓</div>
              <h3>For Students</h3>
              <p>Discover events, earn XP, compete on leaderboards, and build your campus presence through active participation.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🏛️</div>
              <h3>For Societies</h3>
              <p>Create and manage events seamlessly with our intuitive dashboard, proposal system, and winner selection tools.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>For Administrators</h3>
              <p>Maintain oversight with powerful approval workflows, room management, and comprehensive analytics.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🏆</div>
              <h3>Gamification</h3>
              <p>Engage students with our XP system, achievement badges, and competitive leaderboards that recognize participation.</p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>How It Works</h2>
          <div className="process-steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Societies Create Events</h3>
              <p>Society admins create events with detailed proposals, prizes, and venue requirements.</p>
            </div>

            <div className="step">
              <div className="step-number">2</div>
              <h3>Admin Approval</h3>
              <p>Super admins review proposals and approve events, ensuring quality and preventing conflicts.</p>
            </div>

            <div className="step">
              <div className="step-number">3</div>
              <h3>Student Registration</h3>
              <p>Students discover and register for approved events that match their interests.</p>
            </div>

            <div className="step">
              <div className="step-number">4</div>
              <h3>Event Completion</h3>
              <p>After events conclude, organizers select winners and XP is automatically distributed.</p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>Our Technology</h2>
          <p>
            Built with modern web technologies including React, Node.js, Express, and MongoDB, 
            EventVerse provides a fast, secure, and reliable platform for managing campus events.
          </p>
          <div className="tech-badges">
            <span className="tech-badge">React 18</span>
            <span className="tech-badge">Node.js</span>
            <span className="tech-badge">Express</span>
            <span className="tech-badge">MongoDB</span>
            <span className="tech-badge">JWT Auth</span>
            <span className="tech-badge">Responsive Design</span>
          </div>
        </section>

        <section className="about-section cta-section">
          <h2>Join EventVerse Today</h2>
          <p>Be part of a vibrant campus community and never miss an event again.</p>
          {!user && (
            <div className="cta-buttons">
              <a href="/register" className="btn btn-primary">Get Started</a>
              <a href="/events" className="btn btn-secondary">Browse Events</a>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default About;
