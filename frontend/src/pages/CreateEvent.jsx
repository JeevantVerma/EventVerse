import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast/Toast';
import Sidebar from '../components/Sidebar/Sidebar';
import api from '../api/axios';
import './CreateEvent.css';

const CreateEvent = () => {
  const { id } = useParams(); // For edit mode
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Technical',
    imageUrl: '',
    startDateTime: '',
    endDateTime: '',
    maxParticipants: 50,
    proposalPdf: null,
  });

  const [prizes, setPrizes] = useState([
    { position: '1st Place', title: '', description: '' }
  ]);

  const categories = [
    'Technical',
    'Cultural',
    'Sports',
    'Literary',
    'Workshops',
    'Other'
  ];

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      fetchEventDetails();
    }
  }, [id]);

  const fetchEventDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/events/${id}`);
      const event = response.data.event;
      
      setFormData({
        title: event.title,
        description: event.description,
        category: event.category,
        imageUrl: event.imageUrl || '',
        startDateTime: new Date(event.startDateTime).toISOString().slice(0, 16),
        endDateTime: new Date(event.endDateTime).toISOString().slice(0, 16),
        maxParticipants: event.maxParticipants,
        proposalPdf: null,
      });

      if (event.prizes && event.prizes.length > 0) {
        setPrizes(event.prizes);
      }
    } catch (error) {
      toast.error('Failed to load event details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setFormData(prev => ({
        ...prev,
        proposalPdf: file
      }));
    } else {
      toast.error('Please select a valid PDF file');
      e.target.value = null;
    }
  };

  const handlePrizeChange = (index, field, value) => {
    const updatedPrizes = [...prizes];
    updatedPrizes[index][field] = value;
    setPrizes(updatedPrizes);
  };

  const addPrize = () => {
    const positions = ['2nd Place', '3rd Place', '4th Place', '5th Place'];
    const nextPosition = positions[prizes.length - 1] || `${prizes.length + 1}th Place`;
    setPrizes([...prizes, { position: nextPosition, title: '', description: '' }]);
  };

  const removePrize = (index) => {
    if (prizes.length > 1) {
      setPrizes(prizes.filter((_, i) => i !== index));
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error('Event title is required');
      return false;
    }
    if (!formData.description.trim()) {
      toast.error('Event description is required');
      return false;
    }
    if (!formData.startDateTime) {
      toast.error('Start date and time is required');
      return false;
    }
    if (!formData.endDateTime) {
      toast.error('End date and time is required');
      return false;
    }
    if (new Date(formData.startDateTime) >= new Date(formData.endDateTime)) {
      toast.error('End date must be after start date');
      return false;
    }
    if (new Date(formData.startDateTime) < new Date()) {
      toast.error('Start date must be in the future');
      return false;
    }
    if (formData.maxParticipants < 1) {
      toast.error('Maximum participants must be at least 1');
      return false;
    }
    if (!isEditMode && !formData.proposalPdf) {
      toast.error('Event proposal PDF is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e, submitForApproval = false) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('category', formData.category);
      if (formData.imageUrl) {
        submitData.append('imageUrl', formData.imageUrl);
      }
      submitData.append('startDateTime', formData.startDateTime);
      submitData.append('endDateTime', formData.endDateTime);
      submitData.append('maxParticipants', formData.maxParticipants);
      submitData.append('societyName', user.name);

      // Filter out empty prizes
      const validPrizes = prizes.filter(p => p.title.trim());
      submitData.append('prizes', JSON.stringify(validPrizes));

      if (formData.proposalPdf) {
        submitData.append('proposalPdf', formData.proposalPdf);
      }

      let response;
      if (isEditMode) {
        response = await api.put(`/events/${id}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        response = await api.post('/events', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      const eventId = response.data.event._id;

      // Show appropriate success message
      if (formData.proposalPdf) {
        toast.success('Event submitted for approval! It will be available to students once approved.');
      } else {
        toast.success(isEditMode ? 'Event updated successfully!' : 'Event saved as draft!');
      }

      // Submit for approval if requested (only if not already submitted via PDF)
      if (submitForApproval && !formData.proposalPdf) {
        await api.put(`/events/${eventId}/submit`);
      }

      navigate('/society/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save event');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading event...</p>
      </div>
    );
  }

  return (
    <div className="create-event-page">
      <Sidebar />

      <div className="create-event-content">
        <header className="create-event-header">
          <h1>{isEditMode ? 'Edit Event' : 'Create New Event'}</h1>
          <p>Fill in the details below to {isEditMode ? 'update' : 'create'} your event</p>
        </header>

        <form className="event-form">
          <div className="form-section">
            <h2 className="section-title">Basic Information</h2>

            <div className="form-group">
              <label htmlFor="title">Event Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Annual Tech Fest 2024"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Event Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your event in detail..."
                rows="6"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="imageUrl">Event Image URL (Optional)</label>
              <input
                type="url"
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/event-image.jpg"
              />
              {formData.imageUrl && (
                <div className="image-preview">
                  <p className="help-text">Preview:</p>
                  <img
                    src={formData.imageUrl}
                    alt="Event preview"
                    style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', marginTop: '8px' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
              <p className="help-text">
                Provide a URL to an image for your event poster/banner. Recommended size: 800x400px
              </p>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="maxParticipants">Max Participants *</label>
                <input
                  type="number"
                  id="maxParticipants"
                  name="maxParticipants"
                  value={formData.maxParticipants}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2 className="section-title">Schedule</h2>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startDateTime">Start Date & Time *</label>
                <input
                  type="datetime-local"
                  id="startDateTime"
                  name="startDateTime"
                  value={formData.startDateTime}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="endDateTime">End Date & Time *</label>
                <input
                  type="datetime-local"
                  id="endDateTime"
                  name="endDateTime"
                  value={formData.endDateTime}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2 className="section-title">Prizes (Optional)</h2>
            <p className="section-description">Add prizes to make your event more attractive</p>

            {prizes.map((prize, index) => (
              <div key={index} className="prize-entry">
                <div className="prize-entry-header">
                  <h3>Prize {index + 1}</h3>
                  {prizes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePrize(index)}
                      className="btn-remove-prize"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Position</label>
                    <input
                      type="text"
                      value={prize.position}
                      onChange={(e) => handlePrizeChange(index, 'position', e.target.value)}
                      placeholder="e.g., 1st Place"
                    />
                  </div>

                  <div className="form-group">
                    <label>Prize Title</label>
                    <input
                      type="text"
                      value={prize.title}
                      onChange={(e) => handlePrizeChange(index, 'title', e.target.value)}
                      placeholder="e.g., ₹10,000 Cash Prize"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Prize Description (Optional)</label>
                  <input
                    type="text"
                    value={prize.description}
                    onChange={(e) => handlePrizeChange(index, 'description', e.target.value)}
                    placeholder="Additional details about the prize"
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addPrize}
              className="btn-add-prize"
            >
              + Add Another Prize
            </button>
          </div>

          <div className="form-section">
            <h2 className="section-title">Event Proposal</h2>
            
            <div className="form-group">
              <label htmlFor="proposalPdf">
                Upload Proposal PDF {!isEditMode && '*'}
              </label>
              <input
                type="file"
                id="proposalPdf"
                accept=".pdf"
                onChange={handleFileChange}
                className="file-input"
              />
              {formData.proposalPdf && (
                <p className="file-selected">
                  Selected: {formData.proposalPdf.name}
                </p>
              )}
              {isEditMode && (
                <p className="help-text">
                  Leave empty to keep existing proposal
                </p>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/society/dashboard')}
              className="btn btn-secondary"
              disabled={submitting}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={(e) => handleSubmit(e, false)}
              className="btn btn-outline"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Save as Draft'}
            </button>

            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit for Approval'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;
