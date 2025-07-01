import React from "react";
import "./PropertyCardLanding.css";
import { GoHomeFill } from "react-icons/go";
import { BsFire } from "react-icons/bs";
import { IoWallet } from "react-icons/io5";
import { replace, useNavigate } from "react-router-dom";

function PropertyCardLanding({ property }) {
  const renderIcon = () => {
    if (property.clicks < 10) {
      return <GoHomeFill />;
    } else if (property.clicks < 50) {
      return <IoWallet />;
    } else {
      return <BsFire />;
    }
  };

  const getTag = (clicks) => {
    if (clicks < 10) {
      return "New";
    } else if (clicks < 50) {
      return "Popular";
    } else {
      return "Best";
    }
  };

  const navigate = useNavigate();

  const handleClick = (id) => {
    // console.log("kdfh")
    // navigate(`/property/${id}`, { replace: true });
    navigate(`/all-properties`, { replace: true });
  };

  return (
    <div className="property-card" onClick={(e) => handleClick(property._id)}>
      <div className="img-container">
        <img
          src={
            property.media.roomOutside ||
            property.media.roomInside ||
            property.media.washroom ||
            property.media.kitchen
          }
          alt="property image"
          loading="lazy"
          decoding="async"
        />
        <p className={`tag ${getTag(property.clicks)}`}>
          {renderIcon()}
          {getTag(property.clicks)}
        </p>
      </div>
      <div className="details">
        <h3>{property.propertyName}</h3>
        <h4>Rs {property.totalRent}</h4>
        <p>{property.location}</p>
      </div>
    </div>
  );
}

export default PropertyCardLanding;
