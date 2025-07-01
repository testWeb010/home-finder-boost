import React, { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Star } from 'lucide-react';
import toast from 'react-hot-toast';
import './FeedbackForm.css';
import urlprovider from '../../utils/urlprovider';

const FeedbackForm = ({ propertyId, onSubmitSuccess }) => {
  const [formData, setFormData] = useState({
    rating: 0,
    cleanliness: 0,
    location: 0,
    valueForMoney: 0,
    comment: '',
  });
  const [loading, setLoading] = useState(false);
  const [hoveredRating, setHoveredRating] = useState({
    rating: 0,
    cleanliness: 0,
    location: 0,
    valueForMoney: 0,
  });

  const handleStarHover = (category, value) => {
    setHoveredRating(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleStarClick = (category, value) => {
    setFormData(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!propertyId) {
      toast.error('Property ID is required');
      return;
    }

    if (formData.rating === 0) {
      toast.error('Please provide an overall rating');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${urlprovider()}/api/property/feedback`,
        {
          ...formData,
          propertyId
        },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get('token')}`,
          },
        }
      );

      if (response.status === 201) {
        toast.success('Feedback submitted successfully');
        setFormData({
          rating: 0,
          cleanliness: 0,
          location: 0,
          valueForMoney: 0,
          comment: '',
        });
        if (onSubmitSuccess) onSubmitSuccess();
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error(error.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (category, value) => {
    return [
      1, 2, 3, 4, 5
    ].map((star) => (
      <Star
        key={star}
        size={24}
        className={`star-icon ${star <= (hoveredRating[category] || formData[category]) ? 'filled' : ''}`}
        onMouseEnter={() => handleStarHover(category, star)}
        onMouseLeave={() => handleStarHover(category, 0)}
        onClick={() => handleStarClick(category, star)}
      />
    ));
  };

  return (
    <div className="feedback-form-container">
      <h3>Rate Your Experience</h3>
      <form onSubmit={handleSubmit} className="feedback-form">
        <div className="rating-section">
          <label>Overall Rating</label>
          <div className="stars-container">
            {renderStars('rating', formData.rating)}
          </div>
        </div>

        <div className="rating-section">
          <label>Cleanliness</label>
          <div className="stars-container">
            {renderStars('cleanliness', formData.cleanliness)}
          </div>
        </div>

        <div className="rating-section">
          <label>Location</label>
          <div className="stars-container">
            {renderStars('location', formData.location)}
          </div>
        </div>

        <div className="rating-section">
          <label>Value for Money</label>
          <div className="stars-container">
            {renderStars('valueForMoney', formData.valueForMoney)}
          </div>
        </div>

        <div className="comment-section">
          <label>Your Review</label>
          <textarea
            value={formData.comment}
            onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
            placeholder="Share your experience with this property..."
            rows={4}
          />
        </div>

        <button 
          type="submit" 
          className="submit-button" 
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm;