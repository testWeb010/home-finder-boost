import React from "react";
import Slider from "react-slick";
import { IoBed } from "react-icons/io5";
import { FaBath } from "react-icons/fa";
import { FaKitchenSet } from "react-icons/fa6";
import { MdOutlineSmokeFree } from "react-icons/md";
import { GiHummingbird } from "react-icons/gi";
import { FaTransgender } from "react-icons/fa6";
import { BsLightningChargeFill } from "react-icons/bs";
import { FaRupeeSign } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import './PropertyCardAll.css'

function PropertyCardAll({ card }) {
  const navigate = useNavigate();

  const settings = {
    dots: false,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    initialSlide: 0,
    autoplay: true,
    autoplaySpeed: 2000,
    pauseOnHover: true,
  };

  const styles = {
    card: {
      display: "flex",
      backgroundColor: "#f2f0f2",
      width: "90%",
      margin: "0px auto",
      borderRadius: "20px",
      overflow: "hidden",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      cursor: "pointer",
      transition: "transform 0.3s ease",
      height: "200px",
    },
    imageContainer: {
      width: "300px",
      minWidth: "300px",
      height: "200px",
      position: "relative",
      overflow: "hidden",
    },
    image: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
    },
    details: {
      display: "flex",
      flexDirection: "column",
      // gap: '10px',
      padding: "10px 15px",
      flex: 1,
    },
    title: {
      fontSize: "18px",
      fontWeight: "bold",
      color: "#1b1c57",
      textTransform: "capitalize",
      display: "-webkit-box",
      webkitLineClamp: "1",
      webkitBoxOrient: "vertical",
      overflow: "hidden",
    },
    description: {
      fontSize: "14px",
      color: "#64748b",
      paddingBottom: "0px",
      display: "-webkit-box",
      webkitLineClamp: "1",
      webkitBoxOrient: "vertical",
      overflow: "hidden",
    },
    tagContainer: {
      display: "flex",
      flexWrap: "wrap",
      gap: "10px",
      marginBottom: "10px",
    },
    tag: {
      display: "flex",
      alignItems: "center",
      gap: "5px",
      fontSize: "14px",
      color: "#64748b",
    },
    iconTag: {
      display: "flex",
      alignItems: "center",
      padding: "2px 10px",
      backgroundColor: "#10b981",
      borderRadius: "24px",
      color: "white",
      fontSize: "12px",
    },
    price: {
      display: "flex",
      alignItems: "center",
      gap: "5px",
      fontSize: "16px",
      color: "#64748b",
    },
    priceAmount: {
      fontWeight: "bold",
      color: "#1b1c57",
      display: "flex",
      alignItems: "center",
    },
    loader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      width: "100%",
    },
    loaderCircle: {
      border: "4px solid #f3f3f3",
      borderTop: "4px solid #10b981",
      borderRadius: "50%",
      width: "30px",
      height: "30px",
      animation: "spin 1s linear infinite",
    },
  };

  return (
    <div
      style={styles.card}
      onClick={() => navigate(`/property/${card._id}`)}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      className="prop-card"
    >
      <div style={styles.imageContainer} className="image-cont">
        {card.media ? (
          <Slider {...settings}>
            {["roomInside", "roomOutside", "washroom", "kitchen"].map(
              (key, index) =>
                card.media[key] && (
                  <img
                    key={index}
                    src={card.media[key]}
                    alt=""
                    style={styles.image}
                  />
                )
            )}
          </Slider>
        ) : (
          <div style={styles.loader}>
            <div style={styles.loaderCircle}></div>
          </div>
        )}
      </div>
      <div style={styles.details}>
        <h2 style={styles.title}>
          {card.propertyType === "singleroom"
            ? "Single Room"
            : card.propertyType}{" "}
          in {card.city} | {card.capacity} Members
        </h2>
        <p style={styles.description} className="prop-des">{card.description}</p>
        <div style={styles.tagContainer} className="amenties-cont">
          {card.propertyType === "singleroom" ? (
            <span style={styles.tag}>
              <IoBed /> 1
            </span>
          ) : (
            card.totalRooms > 0 && (
              <span style={styles.tag}>
                <IoBed /> {card.totalRooms}
              </span>
            )
          )}
          {card.washroom[0] && (
            <span style={styles.tag}>
              <FaBath /> {card.washroom[0] ? "Yes" : "No"}
              {card.washroom[1] && " (Shared)"}
            </span>
          )}
          {card.kitchen[0] && (
            <span style={styles.tag}>
              <FaKitchenSet /> {card.kitchen[0] ? "Yes" : "No"}
              {card.kitchen[1] && " (Shared)"}
            </span>
          )}
        </div>
        <div style={styles.tagContainer} className="amenties-cont-2">
          <span style={styles.iconTag}>
            <FaTransgender /> {card.preferedGender}
          </span>
          {card.canSmoke && (
            <span style={styles.iconTag}>
              <MdOutlineSmokeFree /> Smoking & Drinking
            </span>
          )}
          {card.isIndependent && (
            <span style={styles.iconTag}>
              <GiHummingbird /> Independent
            </span>
          )}
          {card.electricityIncluded && (
            <span style={styles.iconTag}>
              <BsLightningChargeFill /> Electricity
            </span>
          )}
        </div>
        <p style={styles.price} className="prop-price">
          from{" "}
          <span style={styles.priceAmount}>
            <FaRupeeSign />
            {card.totalRent}
          </span>
          /month
        </p>
      </div>
    </div>
  );
}

export default PropertyCardAll;
