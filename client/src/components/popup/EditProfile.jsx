import React, { useState } from "react";
import "./EditProfile.css";
import { IoClose } from "react-icons/io5";
import { CiEdit } from "react-icons/ci";
import Cookies from "js-cookie";
import Resizer from "react-image-file-resizer";
import validateUsername from "../../utils/validateUsername";
import urlprovider from "../../utils/urlprovider";

function EditProfile({ user, close, onSuccess, onError }) {
  const [profilePic, setProfilePic] = useState(user.profilePic);
  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");
  const [checkingAvailible, setCheckingAvailible] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [picUpdated, setPicUpdated] = useState(false);

  const handleImageInput = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setProfilePic(reader.result);
      setPicUpdated(true);
    };
  };

  const checkAvailibility = async (e) => {
    e.preventDefault();
    try {
      setCheckingAvailible(true);
      setMessage("");
      const res = await fetch(`${urlprovider()}/api/user/check-username`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
        body: JSON.stringify({ username }),
      });

      const data = await res.json();
      if (data.status == "OK" && data.available) {
        setMessage("Username is available");
        setMessageType("success");
      } else {
        setMessage("Username is not available");
        setMessageType("error");
      }
    } catch (err) {
      setMessage("Try again");
      setMessageType("error");
    } finally {
      setCheckingAvailible(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateUsername(username)) {
      onError("Invalid username");
      return;
    }

    if (name == "") {
      onError("Name is required");
      return;
    }

    let resizedImage = profilePic;

    if (picUpdated) {
      resizedImage = await resizeImage(profilePic);
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("username", username);
    formData.append("profilePic", resizedImage);

    try {
      setUpdating(true);
      const res = await fetch(`${urlprovider()}/user/update`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (data.status === "OK") {
        onSuccess(data.user);
      } else {
        onError(data.message);
      }
    } catch {
      onError("Something went wrong");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="edit-profile-container">
      <div className="content">
        <IoClose className="close-btn" onClick={close} />
        <form onSubmit={handleSubmit}>
          <div className="form-group img-group">
            <img
              loading="lazy"
              src={profilePic ? profilePic : "/public/user.webp"}
              alt=""
            />
            <input
              type="file"
              id="photo"
              name="photo"
              onInput={handleImageInput}
              accept="image/*"
            />
            <label htmlFor="photo" className="edit-icon">
              <CiEdit className="icon" />
            </label>
          </div>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onInput={(e) => setName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onInput={(e) => setUsername(e.target.value)}
            />
            <span className="availibility-btn">
              <p className={messageType + ' check-availibility-msg'}>{message}</p>
              <button className="btn" onClick={checkAvailibility}>
                {checkingAvailible ? "checking..." : "Check Availibility"}
              </button>
            </span>
          </div>

          <button type="submit" className="btn">
            {updating ? "Updating..." : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
}

async function resizeImage(base64String) {
  const MAX_WIDTH = 200;
  const MAX_HEIGHT = 200;

  // Function to convert base64 to Blob
  function dataURItoBlob(dataURI) {
    const mimeType = dataURI.split(",")[0].split(":")[1];
    const byteString = atob(dataURI.split(",")[1]);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const intArray = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      intArray[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([arrayBuffer], { type: mimeType });
    return blob;
  }

  const blob = dataURItoBlob(base64String); // Convert base64 to Blob

  // Using a library like react-image-file-resizer
  return new Promise((resolve, reject) => {
    Resizer.imageFileResizer(
      blob,
      MAX_WIDTH,
      MAX_HEIGHT,
      "JPEG",
      80,
      0,
      (uri) => {
        resolve(uri);
      },
      "base64"
    );
  });
}

export default EditProfile;