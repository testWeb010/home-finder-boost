import React from "react";
import { FaStar } from "react-icons/fa";
import "./ReviewCard.css";

function ReviewCard({ review }) {
  return (
    <div className="review-card">
      <div className="property-img">
        <img src={review.image} alt="Property Image" loading='lazy' decoding='async' />
      </div>
      <div className="content">
        <h3>{review.title}</h3>
        <p>{review.description}</p>
        <div className="user-info">
          <img src={review.userImage} alt="User Image" loading='lazy' decoding='async' />
          <div className="detail">
            <span>{review.name}</span>
            <p>{review.location}</p>
          </div>
          <div className="rating">
            <FaStar className="star" />
            <span>{review.rating}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReviewCard;
