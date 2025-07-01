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

const AdPost = () => {
  useEffect(() => {
    AOS.init({
      duration: 500,
    });
  }, []);

  const navigate = useNavigate();

  // fields data
  const [propertyType, setPropertyType] = useState("");
  const [city, setCity] = useState("");
  const [location, setLocation] = useState("");
  const [pincode, setPincode] = useState();
  const [mobile, setMobile] = useState();
  const [propertyName, setName] = useState("");
  const [securityMoney, setSecurityMoney] = useState();
  const [totalRooms, setTotalRooms] = useState();
  const [totalRent, setTotalRent] = useState();
  const [isIndependent, setIsIndependent] = useState(false);
  const [electricityIncluded, setElectricityIncluded] = useState(false);
  const [isKitchen, setIsKitchen] = useState(false);
  const [isSharedKitchen, setIsSharedKitchen] = useState(false);
  const [isWashroom, setIsWashroom] = useState(false);
  const [isSharedWashroom, setIsSharedWashroom] = useState(false);
  const [canSmoke, setCanSmoke] = useState(false);
  const [totalMembers, setTotalMembers] = useState();
  const [RoWater, setRoWater] = useState(false);
  const [AC, setAC] = useState(false);
  const [availFoodService, setAvailFoodService] = useState(false);
  const [preferedGender, setPreferedGender] = useState("");
  const [needRoommate, setNeedRoommate] = useState(false);
  const [about, setAbout] = useState("");
  const [description, setDescription] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const validateInput = () => {
    if (
      !(propertyType === "singleroom") &&
      (!isNumber(totalRooms) || totalRooms <= 0)
    ) {
      return {
        status: false,
        message: "Total rooms must be a positive number",
      };
    }
    if (!propertyName) {
      return { status: false, message: "Property Name is required" };
    }
    if (!mobile || mobile.length !== 10) {
      return {
        status: false,
        message: "Mobile number must be 10 digits long",
      };
    }
    if (!["apartment", "pg", "singleroom"].includes(propertyType)) {
      return {
        status: false,
        message: "Property type must be one of: apartment, pg, singleroom",
      };
    }
    if (needRoommate && !about) {
      return {
        status: false,
        message: "About yourself is required",
      };
    }
    if (!isNumber(totalRent) || totalRent <= 0) {
      return { status: false, message: "Total rent must be a positive number" };
    }
    if (!isNumber(totalMembers) || totalMembers <= 0) {
      return {
        status: false,
        message: "Total members must be a positive number",
      };
    }
    if (!["male", "female", "other", "any"].includes(preferedGender)) {
      return {
        status: false,
        message: "Valid gender required",
      };
    }
    if (description && typeof description !== "string") {
      return {
        status: false,
        message: "Description must be a string",
      };
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

    try {
      const body = {
        totalRooms,
        totalRent,
        city,
        pincode,
        electricityIncluded,
        kitchen: {
          isKitchen,
          isShared: isSharedKitchen,
        },
        washroom: {
          isWashroom,
          isShared: isSharedWashroom,
        },
        canSmoke,
        isIndependent,
        capacity: totalMembers,
        extra: {
          RoWater,
          AC,
          availFoodService,
        },
        preferedGender,
        propertyType,
        description,
        needRoommate,
        securityMoney,
        propertyName,
        aboutRoommate: about,
        mobile,
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
      };
      setIsLoading(true);
      const res = await axios.post(
        `${urlprovider()}/api/post/addpost`,
        body,
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
        console.log(res.data);
        toast.success(res.data.message);
        navigate(`/add-media/${res.data.post._id}`);
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
      console.log("Geolocation not supported");
      toast.error("Geolocation not supported");
    }
  }

  function success(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    setLocation({ latitude, longitude });

    setIsLoading(true);
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setCity(data.address.city);
        setPincode(data.address.postcode);
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
        <h2 className="ad-post-title">Add A Property</h2>

        <form className="ad-post-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="city" className="city-lbl">
              City:{" "}
              <span className="btn location-btn" onClick={handleLocationInput}>
                Current Location
              </span>
            </label>
            <p style={{color: "red", fontSize: ".55rem", textAlign: "end"}}>Please use current location for google map appearance of property</p>
            <input
              value={city}
              type="text"
              id="city"
              name="city"
              placeholder="Enter City"
              onChange={(e) => setCity(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="pincode">Pincode:</label>
            <input
              value={pincode}
              type="number"
              id="pincode"
              name="pincode"
              placeholder="Enter Your Pincode"
              onChange={(e) => setPincode(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="mobile">Contact Number:</label>
            <input
              value={mobile}
              type="number"
              id="mobile"
              name="mobile"
              placeholder="Enter Your Contact Number"
              onChange={(e) => setMobile(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="name">Property Name:</label>
            <input
              value={propertyName}
              type="text"
              id="name"
              name="property-name"
              placeholder="Enter Property Name"
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="propertyType">Property Type:</label>
            <select
              type="text"
              value={propertyType}
              id="propertyType"
              name="propertyType"
              onChange={(e) => setPropertyType(e.target.value)}
            >
              <option value="">Select Property Type</option>
              <option value="apartment">Apartment</option>
              <option value="pg">PG</option>
              <option value="singleroom">Single Room</option>
            </select>
          </div>

          {!(propertyType === "singleroom") && (
            <div className="form-group">
              <label htmlFor="totalRooms">Total Rooms:</label>
              <input
                value={totalRooms}
                type="number"
                id="totalRooms"
                name="totalRooms"
                placeholder="Enter total number of rooms"
                onChange={(e) => setTotalRooms(e.target.value)}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="totalRent">Total Rent:</label>
            <input
              value={totalRent}
              type="number"
              id="totalRent"
              name="totalRent"
              placeholder="Enter total rent"
              onChange={(e) => setTotalRent(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="securityMoney">Security Money:</label>
            <input
              value={securityMoney}
              type="number"
              id="securityMoney"
              name="securityMoney"
              placeholder="Enter Security Money"
              onChange={(e) => setSecurityMoney(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>
              <input
                value={electricityIncluded}
                type="checkbox"
                name="electricityIncluded"
                onChange={() => setElectricityIncluded(!electricityIncluded)}
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
                  checked={isKitchen}
                  name="isKitchen"
                  onChange={(e) => setIsKitchen(!isKitchen)}
                />{" "}
                Kitchen Available
              </p>
              {isKitchen && (
                <p className="item-label">
                  <input
                    value={isSharedKitchen}
                    type="checkbox"
                    name="isSharedKitchen"
                    onChange={() => setIsSharedKitchen(!isSharedKitchen)}
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
                  checked={isWashroom}
                  name="isWashroom"
                  onChange={() => setIsWashroom(!isWashroom)}
                />{" "}
                Washroom Available
              </p>
              {isWashroom && (
                <p className="item-label">
                  <input
                    value={isSharedWashroom}
                    type="checkbox"
                    name="isSharedWashroom"
                    onChange={() => setIsSharedWashroom(!isSharedWashroom)}
                  />{" "}
                  Shared
                </p>
              )}
            </div>
          </div>

          <div className="form-group">
            <p className="item-label">
              <input
                value={canSmoke}
                type="checkbox"
                id="canSmoke"
                name="canSmoke"
                onChange={() => setCanSmoke(!canSmoke)}
              />
              <label htmlFor="canSmoke">Smoking and Alcohol Allowed</label>
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="capacity">Total Members Allowed:</label>
            <input
              value={totalMembers}
              type="number"
              id="capacity"
              name="capacity"
              placeholder="Enter number of members allowed"
              onChange={(e) => setTotalMembers(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Property Surveillance:</label>
            <div>
              <p className="item-label">
                <input
                  type="checkbox"
                  checked={isIndependent}
                  name="isIndependent"
                  onChange={() => setIsIndependent(!isIndependent)}
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
                  checked={!needRoommate}
                  name="needRoommate"
                  onChange={() => setNeedRoommate(false)}
                />
                Property Owner
              </p>
              <p className="item-label">
                <input
                  type="radio"
                  checked={needRoommate}
                  name="needRoommate"
                  onChange={() => setNeedRoommate(true)}
                />
                Asking for Roommate
              </p>
            </div>
          </div>

          {needRoommate && (
            <div className="form-group">
              <label htmlFor="about">About Yourself:</label>
              <textarea
                value={about}
                id="about"
                name="about"
                placeholder="Tell us about yourself, to let others know"
                onChange={(e) => setAbout(e.target.value)}
              />
            </div>
          )}

          <div className="form-group">
            <label>Extras:</label>
            <label className="d-flex">
              <input
                value={RoWater}
                type="checkbox"
                name="RoWater"
                onChange={() => setRoWater(!RoWater)}
              />{" "}
              RO Water
            </label>
            <label className="d-flex">
              <input
                value={AC}
                type="checkbox"
                name="AC"
                onChange={() => setAC(!AC)}
              />{" "}
              AC
            </label>
            <label className="d-flex">
              <input
                value={availFoodService}
                type="checkbox"
                name="availFoodService"
                onChange={() => setAvailFoodService(!availFoodService)}
              />{" "}
              Food Service Available
            </label>
          </div>

          <div className="form-group">
            <label htmlFor="preferedGender">Preferred Gender:</label>
            <select
              value={preferedGender}
              id="preferedGender"
              name="preferedGender"
              onChange={(e) => setPreferedGender(e.target.value)}
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
              value={description}
              id="description"
              name="description"
              placeholder="Tell us more about your property"
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-group sub-btn-group">
            <button type="submit" className="submit-btn">
              Add Property
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

  if (!isNaN(num) && typeof num === "number") {
    return true;
  }

  return false;
}

export default AdPost;
