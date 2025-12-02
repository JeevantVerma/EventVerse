import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast/Toast';
import PublicNavbar from '../components/Navbar/PublicNavbar';
import './Auth.css';

const categories = ['Technical', 'Cultural', 'Sports', 'Literary', 'Workshops', 'Other'];

const Register = () => {
  const [userType, setUserType] = useState('student'); // student, society-admin, super-admin
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    societyName: '',
    favoriteCategories: [],
  });
  const [loading, setLoading] = useState(false);

  const { register, registerAdmin } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCategoryToggle = (category) => {
    setFormData((prev) => ({
      ...prev,
      favoriteCategories: prev.favoriteCategories.includes(category)
        ? prev.favoriteCategories.filter((c) => c !== category)
        : [...prev.favoriteCategories, category],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    let result;
    if (userType === 'student') {
      result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        favoriteCategories: formData.favoriteCategories,
      });
    } else {
      result = await registerAdmin({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: userType === 'society-admin' ? 'SOCIETY_ADMIN' : 'SUPER_ADMIN',
        societyName: userType === 'society-admin' ? formData.societyName : undefined,
      });
    }

    if (result.success) {
      toast.success('Registration successful!');
      
      // Navigate based on user role
      if (result.user.role === 'STUDENT') {
        navigate('/student/dashboard');
      } else if (result.user.role === 'SOCIETY_ADMIN') {
        navigate('/society/dashboard');
      } else if (result.user.role === 'SUPER_ADMIN') {
        navigate('/admin/dashboard');
      }
    } else {
      toast.error(result.message || 'Registration failed');
    }

    setLoading(false);
  };

  return (
    <div className="auth-page">
      <PublicNavbar />

      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join EventVerse today</p>

          {/* User Type Selection */}
          <div className="user-type-selector">
            <button
              type="button"
              className={`user-type-btn ${userType === 'student' ? 'active' : ''}`}
              onClick={() => setUserType('student')}
            >
              Student
            </button>
            <button
              type="button"
              className={`user-type-btn ${userType === 'society-admin' ? 'active' : ''}`}
              onClick={() => setUserType('society-admin')}
            >
              Society Admin
            </button>
            <button
              type="button"
              className={`user-type-btn ${userType === 'super-admin' ? 'active' : ''}`}
              onClick={() => setUserType('super-admin')}
            >
              Super Admin
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="John Doe"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="your.email@example.com"
              />
            </div>

            {userType === 'society-admin' && (
              <div className="form-group">
                <label htmlFor="societyName" className="form-label">
                  Society Name
                </label>
                <input
                  type="text"
                  id="societyName"
                  name="societyName"
                  value={formData.societyName}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder="e.g., Coding Club, Drama Club"
                />
              </div>
            )}

            {userType === 'student' && (
              <div className="form-group">
                <label className="form-label">
                  Favorite Categories (Optional)
                </label>
                <div className="category-grid">
                  {categories.map((category) => (
                    <label key={category} className="category-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.favoriteCategories.includes(category)}
                        onChange={() => handleCategoryToggle(category)}
                      />
                      <span>{category}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="btn-auth-submit"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
