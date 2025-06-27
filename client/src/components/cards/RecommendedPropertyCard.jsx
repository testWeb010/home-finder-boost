import React from 'react';
import { Link } from 'react-router-dom';
import './RecommendedPropertyCard.css';

const RecommendedPropertyCard = ({ property }) => {
  return (
    <Link to={`/property/${property._id}`} className="recommended-property-card">
      <div className="recommended-image">
        <img src={property.images[0]} alt={property.title} />
        <div className="recommended-price">₹{property.totalRent}/month</div>
      </div>
      <div className="recommended-content">
        <h3>{property.title}</h3>
        <p className="location">{property.location}</p>
        <div className="property-features">
          <span>{property.propertyType}</span>
          <span>{property.totalRooms} Beds</span>
          <span>{property.preferedGender}</span>
        </div>
      </div>
    </Link>
  );
};

export default RecommendedPropertyCard;
