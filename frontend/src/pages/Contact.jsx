import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import PublicNavbar from '../components/Navbar/PublicNavbar';
import StudentNavbar from '../components/Navbar/StudentNavbar';
import { useToast } from '../components/Toast/Toast';
import './Contact.css';

const Contact = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.subject.trim() || !formData.message.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    
    setTimeout(() => {
      toast.success('Message sent! We\'ll get back to you soon.');
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        subject: '',
        message: ''
      });
      setSubmitting(false);
    }, 1000);
  };

  return (
    <div className="contact-page">
      {user?.role === 'STUDENT' ? <StudentNavbar /> : <PublicNavbar />}

      <div className="contact-container">
        <div className="contact-content">
          <div className="contact-info">
            <h1>Get in Touch</h1>
            <p className="contact-subtitle">
              Have questions or feedback? We'd love to hear from you!
            </p>

            <div className="info-cards">
              <div className="info-card">
                <div className="info-icon">📧</div>
                <h3>Email</h3>
                <p>support@eventverse.edu</p>
                <p>admin@eventverse.edu</p>
              </div>

              <div className="info-card">
                <div className="info-icon">📞</div>
                <h3>Phone</h3>
                <p>+1 (555) 123-4567</p>
                <p>Mon-Fri: 9AM - 6PM</p>
              </div>

              <div className="info-card">
                <div className="info-icon">📍</div>
                <h3>Location</h3>
                <p>Campus Activity Center</p>
                <p>Room 301, Third Floor</p>
              </div>

              <div className="info-card">
                <div className="info-icon">💬</div>
                <h3>Support</h3>
                <p>Live Chat Available</p>
                <p>Response within 24 hours</p>
              </div>
            </div>

            <div className="faq-section">
              <h2>Quick Help</h2>
              <div className="faq-item">
                <h4>How do I register for an event?</h4>
                <p>Browse events, click on an event card, and hit the "Register" button on the event detail page.</p>
              </div>
              <div className="faq-item">
                <h4>How does the XP system work?</h4>
                <p>Earn 10 XP for participation, and bonus XP for winning positions (20/30/50 XP for 3rd/2nd/1st place).</p>
              </div>
              <div className="faq-item">
                <h4>Can I cancel my registration?</h4>
                <p>Yes, you can cancel your registration anytime before the event starts from the event detail page.</p>
              </div>
            </div>
          </div>

          <div className="contact-form-section">
            <div className="form-card">
              <h2>Send us a Message</h2>
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                  <label htmlFor="name">Your Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="john.doe@example.com"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Subject *</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="What is your message about?"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="6"
                    placeholder="Tell us more..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-submit"
                >
                  {submitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Contact;
