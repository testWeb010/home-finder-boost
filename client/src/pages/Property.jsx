import { useEffect, useState } from "react";
import { IoBed } from "react-icons/io5";
import { FaBath, FaSmoking } from "react-icons/fa6";
import { IoIosImages } from "react-icons/io";
import { MdOndemandVideo } from "react-icons/md";
import { FaRupeeSign } from "react-icons/fa";
import { FaKitchenSet } from "react-icons/fa6";
import { GiHummingbird } from "react-icons/gi";
import { BsLightningChargeFill } from "react-icons/bs";
import { HiUsers } from "react-icons/hi";
import { FaHandshakeSimple } from "react-icons/fa6";
import "./css/Property.css";
import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import Footer from "../components/footer/Footer";
import miniLogo from "../assets/images/miniLogo.gif";
import MapContainer from "../components/map/MapContainer";
import Subscription from "../components/popup/Subscription";
import urlprovider from "../utils/urlprovider";
import RecommendedPropertyCard from "../components/cards/RecommendedPropertyCard";
import FeedbackDisplay from "../components/feedback/FeedbackDisplay";

function Property() {
  const { id } = useParams();
  const [property, setProperty] = useState();
  const [isLoading, setIsLoading] = useState(true);

  const [MainImage, setMainImage1] = useState();

  const [mediaType, setMediaType] = useState(0);

  const [isSubscribed, setIsSubscribed] = useState(false);

  const [secureInfo, setSecureInfo] = useState(null);

  const [recommendedProperties, setRecommendedProperties] = useState([]);

  const navigate = useNavigate();

  function setMainImage(src) {
    console.log(src);
    setMainImage1(src);
  }

  //   fetch property
  useEffect(() => {
    async function fetchProperty() {
      setIsLoading(true);
      try {
        const res = await axios.get(
          `${urlprovider()}/api/post/get-post-by-id/${id}`,
          {
            headers: {
              Authorization: `Bearer ${Cookies.get("token")}`,
            },
          }
        );
        if (res.status === 200) {
          setProperty(res.data.post);
          setMainImage1(res.data.post.media.roomInside);
        } else {
          toast.error("Something went wrong");
        }
      } catch (err) {
        console.log(err);
        if (err.response && err.response.status === 401) {
          toast.error("Login Required");
          navigate("/");
        } else {
          console.log("errrr");
          //   toast.error(
          //     err.response
          //       ? err.response.data.message || err.response.statusText
          //       : "Error"
          //   );
        }
      } finally {
        setIsLoading(false);
      }
    }

    const fetchSubscription = async () => {
      try {
        const res = await axios.get(
          `${urlprovider()}/api/post/subscription/${id}`,
          {
            headers: {
              Authorization: `Bearer ${Cookies.get("token")}`,
            },
          }
        );

        if (res.status == 200) {
          setIsSubscribed(true);
          setSecureInfo(res.data);
        }
      } catch (e) {
        console.log(e);
      }
    };

    fetchSubscription();
    fetchProperty();
  }, []);

  // Add recommendation fetch function
  const fetchRecommendations = async () => {
    if (!property || !property.propertyType) return; // Don't fetch if no property data

    try {
      const res = await axios.get(
        `${urlprovider()}/api/post/recommendations/get-recommendations`,
        {
          params: {
            propertyType: property.propertyType,
            location: property.location,
            pricerange: `${Math.max(0, property.totalRent - 5000)}-${property.totalRent + 5000}`,
            excludeIds: [property._id],
            gender: property.preferedGender
          },
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );

      if (res.status === 200 && Array.isArray(res.data.recommendations) && res.data.recommendations.length > 0) {
        setRecommendedProperties(res.data.recommendations.slice(0, 4));
      } else {
        setRecommendedProperties([]);
      }
    } catch (err) {
      console.log("Error fetching recommendations:", err);
    }
  };

  // Add useEffect for recommendations
  useEffect(() => {
    if (property) {
      fetchRecommendations();
    }
  }, [property]);

  function handleSubscription() {
    navigate("/subscriptions", {
      replace: true,
      state: { prevPath: location.pathname },
    });
  }

  // Only show recommendations section when:
  // 1. Not loading
  // 2. Property exists
  // 3. Has recommendations
  const showRecommendations = !isLoading && 
    property && 
    Array.isArray(recommendedProperties) && 
    recommendedProperties.length > 0;

  return (
    <>
      {isLoading ? (
        <>
          <div
            className="loader"
            style={{ display: isLoading ? "flex" : "none" }}
          >
            <img src={miniLogo} alt="logo" loading="lazy" />
          </div>
          {/* <div className="content-loader-container">
            <span className="content-loader"></span>
          </div> */}
        </>
      ) : property ? (
        <div className="container-wrapper">
          <div className="grid-wrapper">
            <div className="media">
              <div className="media-types">
                <p
                  className="btn media-type-btn"
                  style={
                    !mediaType ? { background: "#10b981", color: "white" } : {}
                  }
                  onClick={() => setMediaType(0)}
                >
                  <IoIosImages size={24} />
                </p>
                <p
                  className="btn media-type-btn"
                  style={
                    mediaType ? { background: "#10b981", color: "white" } : {}
                  }
                  onClick={() => setMediaType(1)}
                >
                  <MdOndemandVideo size={24} />
                </p>
              </div>
              {property.media ? (
                !mediaType ? (
                  <div className="media-wrapper">
                    <div className="relative">
                      <img
                        src={MainImage}
                        alt="Main property view"
                        className="main-image"
                        loading="lazy"
                      />
                    </div>
                    <div className="thumbnails-wrapper">
                      <img
                        src={property.media?.roomInside}
                        className="thumbnail"
                        loading="lazy"
                        onMouseOver={() =>
                          setMainImage(property.media?.roomInside)
                        }
                        onClick={() => setMainImage(property.media?.roomInside)}
                      />
                      <img
                        src={property.media?.roomOutside}
                        className="thumbnail"
                        loading="lazy"
                        onMouseOver={() =>
                          setMainImage(property.media?.roomOutside)
                        }
                        onClick={() =>
                          setMainImage(property.media?.roomOutside)
                        }
                      />
                      {property.media?.kitchen && (
                        <img
                          src={property.media?.kitchen}
                          className="thumbnail"
                          loading="lazy"
                          onMouseOver={() =>
                            setMainImage(property.media?.kitchen)
                          }
                          onClick={() => setMainImage(property.media?.kitchen)}
                        />
                      )}
                      {property.media?.washroom && (
                        <img
                          src={property.media?.washroom}
                          className="thumbnail"
                          loading="lazy"
                          onMouseOver={() =>
                            setMainImage(property.media?.washroom)
                          }
                          onClick={() => setMainImage(property.media?.washroom)}
                        />
                      )}
                    </div>
                  </div>
                ) : (
                  <video
                    src={property.media.video}
                    className="main-video"
                    loading="lazy"
                    autoPlay
                    controls
                  />
                )
              ) : (
                <p>Media not added yet</p>
              )}
            </div>

            <div className="card-wrapper">
              <div className="card-content">
                <div className="details">
                  <h1 className="property-title">
                    {property.propertyName} |{" "}
                    {property.propertyType == "singleroom"
                      ? "Single Room"
                      : property.propertyType}
                  </h1>
                  {property.preferedGender != "any" && (
                    <p className="gender-tag">
                      {property.needRoommate
                        ? "Need " + property.preferedGender + " Roommate"
                        : property.preferedGender != "any" &&
                          property.preferedGender?.charAt(0)?.toUpperCase() +
                            property.preferedGender?.slice(1) +
                            " Only"}
                    </p>
                  )}
                  <p className="property-location">
                    {property.city + ", " + property.pincode}
                  </p>

                  <div className="amenities-wrapper section">
                    <h2 className="section-title">Rent Includes & Excludes</h2>
                    <div className="amenities">
                      <div className="amenity">
                        <IoBed size={20} />
                        <p>{property.totalRooms} Room(s)</p>
                      </div>
                      <div className="amenity">
                        <BsLightningChargeFill size={20} />
                        <p>
                          {property.electricityIncluded
                            ? "Electricity Included"
                            : "Electricity Excluded"}
                        </p>
                      </div>
                      <div className="amenity">
                        <FaKitchenSet size={20} />
                        <p>
                          {property.kitchen[1] && "Shared "}
                          {property.kitchen[0]
                            ? "Kitchen Available"
                            : "Kitchen Not Available"}
                        </p>
                      </div>
                      <div className="amenity">
                        <FaBath size={20} />
                        <p>
                          {property.washroom[1] && "Shared "}
                          {property.washroom[0]
                            ? "Washroom Available"
                            : "Washroom Not Available"}
                        </p>
                      </div>
                      <div className="amenity">
                        <FaSmoking size={20} />
                        <p>
                          {property.canSmoke
                            ? "Smoking Allowed"
                            : "Smoking Not Allowed"}
                        </p>
                      </div>
                      <div className="amenity">
                        <GiHummingbird size={20} />
                        <p>
                          {property.isIndependent
                            ? "Independent Property"
                            : "Shared Property"}
                        </p>
                      </div>
                      <div className="amenity">
                        <HiUsers size={20} />
                        <p>Capacity {property.capacity}</p>
                      </div>
                      {property.needRoommate && (
                        <div className="amenity">
                          <FaHandshakeSimple size={20} />
                          <p>Need Roommate</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="description-section">
                    <h2 className="section-title">Description</h2>
                    <p className="section-text">{property.description}</p>
                  </div>

                  {property.needRoommate && property.aboutRoommate && (
                    <div className="description-section">
                      <h2 className="section-title">Message from Tenant</h2>
                      <p className="section-text">{property.aboutRoommate}</p>
                    </div>
                  )}

                  <div className="contact-details">
                    <h2 className="section-title">
                      Contact Details{" "}
                      {!isSubscribed && (
                        <span className="btn" onClick={handleSubscription}>
                          Get Contact Details
                        </span>
                      )}
                    </h2>
                    <div className="details">
                      <div className="user">
                        <div className="user-image">
                          <img
                            src={property.user.photo || "/public/user.webp"}
                            loading="lazy"
                          />
                        </div>
                        <div className="user-name">
                          <p>{property.user.name || "User"}</p>
                        </div>
                      </div>
                      <div className="contact">
                        <p>
                          <span>Mobile:</span>{" "}
                          {isSubscribed ? (
                            secureInfo.mobile
                          ) : (
                            <span className="blur">+91 XXX123XXXX</span>
                          )}
                        </p>
                        <p>
                          <span>Email:</span>{" "}
                          {isSubscribed ? (
                            secureInfo.email
                          ) : (
                            <span className="blur">abc@gmail.com</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="prices">
                  <div className="pricing-section">
                    <div className="pricing-header">
                      <div>
                        <p className="price">
                          <FaRupeeSign size={20} /> {property.totalRent}/Month
                        </p>
                      </div>
                      <div className="guests-info">
                        <p>All utilities are included</p>
                      </div>
                    </div>
                    <div className="pricing-details">
                      <div className="pricing-item">
                        <span>Average monthly rent</span>
                        <span className="price-detail">
                          <FaRupeeSign size={14} /> {property.totalRent}
                        </span>
                      </div>
                      {property.securityMoney && (
                        <div className="pricing-item">
                          <span>Deposit / Security Money</span>
                          <span className="price-detail">
                            <FaRupeeSign size={14} /> {property.securityMoney}
                          </span>
                        </div>
                      )}
                      <div className="pricing-total">
                        <span>Total costs</span>
                        <span className="price-detail">
                          <FaRupeeSign size={14} />{" "}
                          {property.totalRent + (property.securityMoney || 0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* <button className="booking-button">Continue booking</button> */}
                </div>
              </div>
            </div>
          </div>

          {isSubscribed ? (
            <>
              <div className="location-section">
                <h2 className="section-title">Location</h2>
                <div className="map-placeholder">
                  {secureInfo.location?.latitude &&
                  secureInfo.location?.longitude ? (
                    <MapContainer
                      lat={secureInfo.location.latitude}
                      lng={secureInfo.location.longitude}
                    />
                  ) : (
                    <p style={{ textAlign: "center", color: "red" }}>
                      This post is added manually. Please contact the post owner
                      for location
                    </p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="location-section">
                <h2 className="section-title">Location</h2>
                <div className={"map-placeholder"}>
                  {!isSubscribed && (
                    <div className="overlay">
                      <span
                        className="btn subscription-btn"
                        onClick={handleSubscription}
                      >
                        Get Subscription
                      </span>
                    </div>
                  )}
                  <MapContainer lat={31.262617} lng={75.704099} />
                </div>
              </div>
            </>
          )}

          {/* Add Recommendations Section */}
          {/* Feedback Section */}
          <div className="feedback-section">
            <h2 className="section-title">Property Reviews</h2>
            <FeedbackDisplay propertyId={id} />
          </div>

          {showRecommendations && (
            <div className="recommendations-section">
              <h2>Similar Properties You May Like</h2>
              <div className="recommendations-container">
                {recommendedProperties.map((property, index) => (
                  <RecommendedPropertyCard 
                    key={index} 
                    property={property}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <p
          style={{
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          Property Not Found
        </p>
      )}

      <Footer />
    </>
  );
}

export default Property;
