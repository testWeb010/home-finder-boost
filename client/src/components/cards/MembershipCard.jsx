import React from "react";
import { FaRupeeSign } from "react-icons/fa";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import './MembershipCard.css';

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

function MembershipCard({ card, user, prevPath }) {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  function handleClick() {
    setIsLoading(true);
    if(Cookies.get("token") != null) {
      navigate("/checkout", { state: { card, prevPath: prevPath } });
    }else{
      toast.error("Login required")
      navigate("/")
    }
    setIsLoading(false);
  }

  const cardStyle = {
    backgroundColor: "#ffffff",
    borderRadius: "15px",
    boxShadow: "0 0px 15px rgba(0, 0, 0, 0.15)",
    padding: "24px",
    width: "230px",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    transition: "transform 0.3s ease",
    height: "360px",
    marginBottom: "24px",
    // border: user?.membership === card._id ? "2px solid #10b981" : "2px solid #c9c9c9",
    border : "2px solid #c9c9c9",
  };

  const titleStyle = {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "16px",
  };

  const priceContainerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "8px",
  };

  const priceStyleOuter = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  };

  const priceStyle = {
    fontSize: "36px",
    fontWeight: "bold",
    color: "#10b981",
    display: "flex",
    alignItems: "center",
  };

  const originalPriceStyle = {
    fontSize: "14px",
    color: "#666",
    textDecoration: "line-through",
    marginTop: "4px",
  };

  const durationStyle = {
    fontSize: "14px",
    color: "#666",
    marginBottom: "24px",
  };

  const featureListStyle = {
    listStyleType: "none",
    padding: 0,
    margin: "0 0 24px 0",
    width: "100%",
  };

  const featureItemStyle = {
    display: "flex",
    alignItems: "center",
    marginBottom: "12px",
    fontSize: "14px",
    color: "#333",
  };

  const checkIconStyle = {
    width: "16px",
    height: "16px",
    marginRight: "18px",
    color: "#10b981",
  };

  const buttonStyle = {
    backgroundColor: user?.membership === card._id ? "#ffffff" : "#10b981",
    color: user?.membership === card._id ? "#10b981" : "white",
    border: user?.membership === card._id ? "1px solid #10b981" : "none",
    borderRadius: "4px",
    padding: "10px 20px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
    width: "80%",
    position: "absolute",
    bottom: "25px",
  };

  return (
    <div style={cardStyle} className={`mem-card ${card.planName}`}>
      <h2 style={titleStyle}>{card.planName}</h2>
      <div style={priceContainerStyle}>
        <p style={priceStyleOuter}>
          <span style={priceStyle}>
            <FaRupeeSign />
            {card.discountedPrice}
          </span>
          <span style={originalPriceStyle}>
            <FaRupeeSign />
            {card.originalPrice}
          </span>
        </p>
      </div>
      <p style={durationStyle}>{card.durationInDays} Days</p>
      <ul style={featureListStyle}>
        {card.features.map((feature, idx) => (
          <li key={idx} style={featureItemStyle}>
            <span style={checkIconStyle}>
              <CheckIcon />
            </span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <button
        style={buttonStyle}
        onClick={handleClick}
        disabled={isLoading || user?.membership === card._id}
      >
        {isLoading
          ? "Loading..."
          : user?.membership === card._id
          ? "Subscribed"
          : user?.membership == null || user?.membership == ""
          ? "Subscribe Now"
          : "Change Plan"}
      </button>
    </div>
  );
}

export default MembershipCard;
