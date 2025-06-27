import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Star } from 'lucide-react';
import toast from 'react-hot-toast';
import urlprovider from '../../utils/urlprovider';

const FeedbackDisplay = ({ propertyId }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [averageRatings, setAverageRatings] = useState({
    overall: 0,
    cleanliness: 0,
    location: 0,
    valueForMoney: 0
  });

  useEffect(() => {
    const fetchFeedback = async () => {
      if (!propertyId) return;

      try {
        setLoading(true);
        const response = await axios.get(
          `${urlprovider()}/api/property/${propertyId}/feedback`,
          {
            headers: {
              Authorization: `Bearer ${Cookies.get('token')}`,
            },
          }
        );

        if (response.status === 200) {
          const feedbackData = response.data.feedbacks || [];
          setFeedbacks(feedbackData);
          calculateAverageRatings(feedbackData);
        }
      } catch (error) {
        console.error('Error fetching feedback:', error);
        toast.error('Failed to load feedback');
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [propertyId]);

  const calculateAverageRatings = (feedbackList) => {
    if (!Array.isArray(feedbackList) || feedbackList.length === 0) {
      setAverageRatings({
        overall: 0,
        cleanliness: 0,
        location: 0,
        valueForMoney: 0
      });
      return;
    }

    const sum = feedbackList.reduce((acc, feedback) => ({
      overall: acc.overall + (feedback.rating || 0),
      cleanliness: acc.cleanliness + (feedback.cleanliness || 0),
      location: acc.location + (feedback.location || 0),
      valueForMoney: acc.valueForMoney + (feedback.valueForMoney || 0)
    }), { overall: 0, cleanliness: 0, location: 0, valueForMoney: 0 });

    const count = feedbackList.length;
    setAverageRatings({
      overall: (sum.overall / count).toFixed(1),
      cleanliness: (sum.cleanliness / count).toFixed(1),
      location: (sum.location / count).toFixed(1),
      valueForMoney: (sum.valueForMoney / count).toFixed(1)
    });
  };

  const renderStars = (rating) => {
    return [
      1, 2, 3, 4, 5
    ].map((star) => (
      <Star
        key={star}
        size={16}
        className={`star-icon ${star <= rating ? 'filled' : ''}`}
        style={{ color: star <= rating ? '#10b981' : '#e2e8f0' }}
      />
    ));
  };

  if (loading) {
    return <div className="feedback-loading">Loading feedback...</div>;
  }

  return (
    <div className="feedback-section">
      <div className="feedback-header">
        <h3>Customer Reviews ({feedbacks.length})</h3>
        <div className="overall-rating">
          {renderStars(averageRatings.overall)}
          <span className="rating-value">{averageRatings.overall}/5</span>
        </div>
      </div>

      <div className="ratings-overview">
        <div className="rating-item">
          <span className="rating-label">Cleanliness</span>
          <div className="rating-stars">
            {renderStars(averageRatings.cleanliness)}
            <span className="rating-value">{averageRatings.cleanliness}</span>
          </div>
        </div>
        <div className="rating-item">
          <span className="rating-label">Location</span>
          <div className="rating-stars">
            {renderStars(averageRatings.location)}
            <span className="rating-value">{averageRatings.location}</span>
          </div>
        </div>
        <div className="rating-item">
          <span className="rating-label">Value for Money</span>
          <div className="rating-stars">
            {renderStars(averageRatings.valueForMoney)}
            <span className="rating-value">{averageRatings.valueForMoney}</span>
          </div>
        </div>
      </div>

      {feedbacks.length > 0 ? (
        <div className="feedback-list">
          {feedbacks.map((feedback, index) => (
            <div key={index} className="feedback-item">
              <div className="feedback-user">
                <img
                  src={feedback.user?.photo || '/public/user.webp'}
                  alt={feedback.user?.name || 'User'}
                />
                <div className="feedback-user-info">
                  <span className="feedback-user-name">
                    {feedback.user?.name || 'Anonymous'}
                  </span>
                  <span className="feedback-date">
                    {new Date(feedback.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="feedback-rating">
                <div className="rating-item">
                  <span className="rating-label">Overall</span>
                  <div className="rating-stars">
                    {renderStars(feedback.rating)}
                  </div>
                </div>
              </div>
              <p className="feedback-text">{feedback.comment}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-feedback">
          No reviews yet. Be the first to review this property!
        </div>
      )}
    </div>
  );
};

export default FeedbackDisplay;

