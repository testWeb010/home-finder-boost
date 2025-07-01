import React, { useEffect, useState } from "react";
import "./css/AdPost.css";
import AOS from "aos";
import toast from "react-hot-toast";
import axios from "axios";
import Cookies from "js-cookie";
import Footer from "../components/footer/Footer";
import { useNavigate } from "react-router-dom";
import miniLogo from "../assets/images/miniLogo.gif";
import urlprovider from "../utils/urlprovider";
import { useParams, useLocation } from "react-router-dom";

const EditPost = () => {
  useEffect(() => {
    AOS.init({ duration: 500 });
  }, []);

  const location = useLocation();
  const params = useParams();
  const { prevPath } = location.state || {};

  const navigate = useNavigate();
  const [post, setPost] = useState({
    propertyType: "",
    city: "",
    location: {},
    pincode: "",
    mobile: "",
    propertyName: "",
    securityMoney: "",
    totalRooms: "",
    totalRent: "",
    isIndependent: false,
    electricityIncluded: false,
    isKitchen: false,
    isSharedKitchen: false,
    isWashroom: false,
    isSharedWashroom: false,
    canSmoke: "",
    capacity: "",
    RoWater: false,
    AC: false,
    availFoodService: false,
    preferedGender: "",
    needRoommate: false,
    aboutRoommate: "",
    description: "",
  });

  // fetch post data
  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await axios.get(
          `${urlprovider()}/api/post/get-post-by-id/${params.id}`,
          {
            headers: {
              Authorization: `Bearer ${Cookies.get("token")}`,
            },
          }
        );

        if (res.status === 200) {
          setPost(res.data.post);
          // set washroom and kitchen values
          if (res.data.post.kitchen) {
            setPost((prevPost) => ({
              ...prevPost,
              isKitchen: res.data.post.kitchen[0],
              isSharedKitchen: res.data.post.kitchen[1],
            }));
          }
          if (res.data.post.washroom) {
            setPost((prevPost) => ({
              ...prevPost,
              isWashroom: res.data.post.washroom[0],
              isSharedWashroom: res.data.post.washroom[1],
            }));
          }
          // set extra values
          if (res.data.post.extra) {
            setPost((prevPost) => ({
              ...prevPost,
              RoWater: res.data.post.extra[0],
              AC: res.data.post.extra[1],
              availFoodService: res.data.post.extra[2],
            }));
          }

          console.log(res.data.post.canSmoke);

          setPost((prevPost) => ({
            ...prevPost,
            canSmoke: res.data.post.canSmoke,
            isIndependent: res.data.post.isIndependent,
            needRoommate: res.data.post.needRoommate,
          }));
        } else {
          toast.error("Failed to fetch post data");
        }
      } catch (error) {
        console.log(error);
        toast.error(error.response.data.message);
      }
    }

    fetchPost();
  }, []);

  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPost((prevPost) => ({
      ...prevPost,
      [name]:
        type === "checkbox"
          ? checked
          : name === "needRoommate"
          ? value === "true"
          : value,
    }));
  };

  const validateInput = () => {
    if (
      !(post.propertyType === "singleroom") &&
      (!isNumber(post.totalRooms) || post.totalRooms <= 0)
    ) {
      return {
        status: false,
        message: "Total rooms must be a positive number",
      };
    }
    if (!post.propertyName) {
      return { status: false, message: "Property Name is required" };
    }
    if (!post.mobile || post.mobile.length !== 10) {
      return { status: false, message: "Mobile number must be 10 digits long" };
    }
    if (!["apartment", "pg", "singleroom"].includes(post.propertyType)) {
      return {
        status: false,
        message: "Property type must be one of: apartment, pg, singleroom",
      };
    }
    if (post.needRoommate && !post.aboutRoommate) {
      return { status: false, message: "About yourself is required" };
    }
    if (!isNumber(post.totalRent) || post.totalRent <= 0) {
      return { status: false, message: "Total rent must be a positive number" };
    }
    if (!isNumber(post.capacity) || post.capacity <= 0) {
      return {
        status: false,
        message: "Total members must be a positive number",
      };
    }
    if (!["male", "female", "other", "any"].includes(post.preferedGender)) {
      return { status: false, message: "Valid gender required" };
    }
    if (post.description && typeof post.description !== "string") {
      return { status: false, message: "Description must be a string" };
    }
    return { status: true };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validate = validateInput();
    if (!validate.status) {
      toast.error(validate.message);
      return;
    }
    const postId = params.id;

    try {
      setIsLoading(true);
      const res = await axios.post(
        `${urlprovider()}/api/post/edit-post/${postId}`,
        post,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );

      if (res.status === 401) {
        toast.error("Login required");
        navigate("/");
      } else if (res.status === 200 || res.status === 201) {
        toast.success(res.data.message);
        navigate(prevPath+'?section=posts' || "/all-properties");
      } else {
        toast.error(res.data.message || "Failed to submit the form");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    } finally {
      setIsLoading(false);
    }
  };

  function handleLocationInput() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(success, error);
    } else {
      toast.error("Geolocation not supported");
    }
  }

  function success(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    setPost((prevPost) => ({
      ...prevPost,
      location: { latitude, longitude },
    }));

    setIsLoading(true);
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setPost((prevPost) => ({
          ...prevPost,
          city: data.address.city,
          pincode: data.address.postcode,
        }));
      })
      .finally(() => setIsLoading(false));
  }

  function error() {
    toast.error("Unable to retrieve your location");
  }

  return (
    <>
      <div className="loader" style={{ display: isLoading ? "flex" : "none" }}>
        <img src={miniLogo} alt="logo" />
      </div>

      <div className="ad-post-container" data-aos="fade-up">
        <h2 className="ad-post-title">Update Your Property</h2>

        <form className="ad-post-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="city" className="city-lbl">
              City:{" "}
              <span className="btn location-btn" onClick={handleLocationInput}>
                Current Location
              </span>
            </label>
            <p style={{ color: "red", fontSize: ".55rem", textAlign: "end" }}>
              Please use current location for google map appearance of property
            </p>
            <input
              value={post.city}
              type="text"
              id="city"
              name="city"
              placeholder="Enter City"
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="pincode">Pincode:</label>
            <input
              value={post.pincode}
              type="number"
              id="pincode"
              name="pincode"
              placeholder="Enter Your Pincode"
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="mobile">Contact Number:</label>
            <input
              value={post.mobile}
              type="number"
              id="mobile"
              name="mobile"
              placeholder="Enter Your Contact Number"
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="name">Property Name:</label>
            <input
              value={post.propertyName}
              type="text"
              id="name"
              name="propertyName"
              placeholder="Enter Property Name"
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="propertyType">Property Type:</label>
            <select
              type="text"
              value={post.propertyType}
              id="propertyType"
              name="propertyType"
              onChange={handleInputChange}
            >
              <option value="">Select Property Type</option>
              <option value="apartment">Apartment</option>
              <option value="pg">PG</option>
              <option value="singleroom">Single Room</option>
            </select>
          </div>

          {!(post.propertyType === "singleroom") && (
            <div className="form-group">
              <label htmlFor="totalRooms">Total Rooms:</label>
              <input
                value={post.totalRooms}
                type="number"
                id="totalRooms"
                name="totalRooms"
                placeholder="Enter total number of rooms"
                onChange={handleInputChange}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="totalRent">Total Rent:</label>
            <input
              value={post.totalRent}
              type="number"
              id="totalRent"
              name="totalRent"
              placeholder="Enter total rent"
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="securityMoney">Security Money:</label>
            <input
              value={post.securityMoney}
              type="number"
              id="securityMoney"
              name="securityMoney"
              placeholder="Enter Security Money"
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label>
              <input
                checked={post.electricityIncluded}
                type="checkbox"
                name="electricityIncluded"
                onChange={handleInputChange}
              />{" "}
              Electricity Included
            </label>
          </div>

          <div className="form-group">
            <label>Kitchen:</label>
            <div>
              <p className="item-label">
                <input
                  type="checkbox"
                  checked={post.isKitchen}
                  name="isKitchen"
                  onChange={handleInputChange}
                />{" "}
                Kitchen Available
              </p>
              {post.isKitchen && (
                <p className="item-label">
                  <input
                    value={post.isSharedKitchen}
                    type="checkbox"
                    name="isSharedKitchen"
                    onChange={handleInputChange}
                  />
                  Shared
                </p>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Washroom:</label>
            <div>
              <p className="item-label">
                <input
                  type="checkbox"
                  checked={post.isWashroom}
                  name="isWashroom"
                  onChange={handleInputChange}
                />{" "}
                Washroom Available
              </p>
              {post.isWashroom && (
                <p className="item-label">
                  <input
                    value={post.isSharedWashroom}
                    type="checkbox"
                    name="isSharedWashroom"
                    onChange={handleInputChange}
                  />{" "}
                  Shared
                </p>
              )}
            </div>
          </div>

          <div className="form-group">
            <p className="item-label">
              <input
                checked={post.canSmoke}
                type="checkbox"
                id="canSmoke"
                name="canSmoke"
                onChange={handleInputChange}
              />
              <label htmlFor="canSmoke">Smoking and Alcohol Allowed</label>
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="capacity">Total Members Allowed:</label>
            <input
              value={post.capacity}
              type="number"
              id="capacity"
              name="capacity"
              placeholder="Enter number of members allowed"
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label>Property Surveillance:</label>
            <div>
              <p className="item-label">
                <input
                  type="checkbox"
                  checked={post.isIndependent}
                  name="isIndependent"
                  onChange={handleInputChange}
                />{" "}
                Independent Property
              </p>
            </div>
          </div>

          <div className="form-group">
            <label>Ownership:</label>
            <div>
              <p className="item-label">
                <input
                  type="radio"
                  value="false"
                  checked={!post.needRoommate}
                  name="needRoommate"
                  onChange={handleInputChange}
                />
                Property Owner
              </p>
              <p className="item-label">
                <input
                  type="radio"
                  value="true"
                  checked={post.needRoommate}
                  name="needRoommate"
                  onChange={handleInputChange}
                />
                Asking for Roommate
              </p>
            </div>
          </div>

          {post.needRoommate && (
            <div className="form-group">
              <label htmlFor="about">About Yourself:</label>
              <textarea
                value={post.aboutRoommate}
                id="aboutRoommate"
                name="aboutRoommate"
                placeholder="Tell us about yourself, to let others know"
                onChange={handleInputChange}
              />
            </div>
          )}

          <div className="form-group">
            <label>Extras:</label>
            <label className="d-flex">
              <input
                checked={post.RoWater}
                type="checkbox"
                name="RoWater"
                onChange={handleInputChange}
              />{" "}
              RO Water
            </label>
            <label className="d-flex">
              <input
                checked={post.AC}
                type="checkbox"
                name="AC"
                onChange={handleInputChange}
              />{" "}
              AC
            </label>
            <label className="d-flex">
              <input
                checked={post.availFoodService}
                type="checkbox"
                name="availFoodService"
                onChange={handleInputChange}
              />{" "}
              Food Service Available
            </label>
          </div>

          <div className="form-group">
            <label htmlFor="preferedGender">Preferred Gender:</label>
            <select
              value={post.preferedGender}
              id="preferedGender"
              name="preferedGender"
              onChange={handleInputChange}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="any">Any</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description:</label>
            <textarea
              value={post.description}
              id="description"
              name="description"
              placeholder="Tell us more about your property"
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group sub-btn-group">
            <button type="submit" className="submit-btn">
              Update
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </>
  );
};

function isNumber(data) {
  const num = Number(data);
  return !isNaN(num) && typeof num === "number";
}

export default EditPost;
