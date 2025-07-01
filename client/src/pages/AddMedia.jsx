import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Compressor from "compressorjs";
import "./css/AddMedia.css";
import Footer from "../components/footer/Footer";
import toast from "react-hot-toast";
import axios from "axios";
import Cookies from "js-cookie";
import miniLogo from "../assets/images/miniLogo.gif";
import urlprovider from "../utils/urlprovider";

const AddMedia = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [images, setImages] = useState({
    roomInside: null,
    roomOutside: null,
    kitchen: null,
    washroom: null,
  });

  // Refs for input fields
  const roomInsideInputRef = useRef(null);
  const roomOutsideInputRef = useRef(null);
  const kitchenInputRef = useRef(null);
  const washroomInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const [video, setVideo] = useState(null);
  const [compressedMedia, setCompressedMedia] = useState({
    images: {
      roomInside: null,
      roomOutside: null,
      kitchen: null,
      washroom: null,
    },
  });
  const [post, setPost] = useState(null);

  const [isLoading, setIsLoading] = useState(false);

  //   fetch post
  useEffect(() => {
    async function getPost() {
      setIsLoading(true);
      try {
        const res = await axios.get(
          `${urlprovider()}/api/post/get-post-by-id/${params.postid}`,
          {
            headers: {
              authorization: `Bearer ${Cookies.get("token")}`,
            },
          }
        );
        if (res.status === 404) {
          navigate("/all-properties");
          // login first
        } else if (res.status === 200) {
          setPost(res.data.post);
        } else {
          toast.error(res.data.message);
        }
      } catch (err) {
        console.log(err);
        toast.error(err.response?.data?.message || "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }
    getPost();
  }, []);

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (file && file.size <= 10 * 1024 * 1024) {
      // 10MB
      setImages((prevImages) => ({ ...prevImages, [type]: file }));
    } else {
      alert("Image size must be less than 10MB.");
    }
  };

  

  const handleVideoChange = async (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 50 * 1024 * 1024) {
      // 50MB
      setVideo(file);
    } else {
      alert("Video size must be less than 50MB.");
    }
  };

  // Get original image dimensions
  const getImageDimensions = (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const compressImage = async (file) => {
    // Get original dimensions
    const { width, height } = await getImageDimensions(file);
    
    return new Promise((resolve, reject) => {
      new Compressor(file, {
        quality: 0.9, // Higher quality to preserve detail
        width: width, // Keep original width
        height: height, // Keep original height
        resize: 'none', // Don't resize
        success: resolve,
        error: reject,
      });
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // image validation
    if (
      !images.roomInside ||
      !images.roomOutside ||
      (post?.washroom[0] && !images.washroom) ||
      (post?.kitchen[0] && !images.kitchen)
    ) {
      toast.error("All images are required");
      return;
    }
    // Compress images
    const compressedImages = {};
    for (const key in images) {
      if (images[key]) {
        const compressedFile = await compressImage(images[key]);
        compressedImages[key] = compressedFile;
      }
    }
    // images validation

    // video validation
    if (!video) {
      toast.error("Video file is rquired");
      return;
    }
    

    // Update state with compressed media
    setCompressedMedia({ images: compressedImages });

    try {
      setIsLoading(true);
      // Create a new FormData object
      const formData = new FormData();

      // Append each image to the formData object
      Object.entries(compressedImages).forEach(([key, image]) => {
        formData.append(`${key}`, image);
      });

      // Append the video to the formData object
      formData.append("video", video);

      // Send the formData to the backend using axios
      const res = await axios.post(
        `${urlprovider()}/api/post/add-media/${params.postid}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );

      if (res.status === 200) {
        toast.success(res.data.message);
        navigate("/");
      } else {
        toast.error(res.response.data.message);
      }
    } catch (err) {
      console.log(err);
      if (err.response && err.response.status === 401) {
        toast.error(err.response.data);
        navigate("/");
      } else {
        console.log(err);
        toast.error(err.response?.data?.message || "An error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteImage = (type) => {
    setImages((prevImages) => ({ ...prevImages, [type]: null }));
    setCompressedMedia((prevCompressed) => ({
      ...prevCompressed,
      images: { ...prevCompressed.images, [type]: null },
    }));

    // Reset the corresponding input field
    switch (type) {
      case "roomInside":
        roomInsideInputRef.current.value = null;
        break;
      case "roomOutside":
        roomOutsideInputRef.current.value = null;
        break;
      case "kitchen":
        kitchenInputRef.current.value = null;
        break;
      case "washroom":
        washroomInputRef.current.value = null;
        break;
      default:
        break;
    }
  };

  const handleDeleteVideo = () => {
    setVideo(null);
    setCompressedMedia((prevCompressed) => ({
      ...prevCompressed,
      video: null,
    }));
    videoInputRef.current.value = null;
  };

  return (
    <>
      {isLoading && (
        <div
          className="loader"
          style={{ display: isLoading ? "flex" : "none" }}
        >
          <img src={miniLogo} alt="logo" />
        </div>
      )}
      {isLoading ? (
        <div className="content-loader-container">
          <p className="content-loader"></p>
        </div>
      ) : (
        <div className="add-media-container">
          <h2>Add Media</h2>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="roomInsideImage">
                Upload Room Inside Image (Max 10MB):
              </label>
              <input
                type="file"
                id="roomInsideImage"
                accept="image/*"
                ref={roomInsideInputRef}
                onChange={(e) => handleImageChange(e, "roomInside")}
              />
            </div>

            <div className="input-group">
              <label htmlFor="roomOutsideImage">
                Upload Room Outside Image (Max 10MB):
              </label>
              <input
                type="file"
                id="roomOutsideImage"
                accept="image/*"
                ref={roomOutsideInputRef}
                onChange={(e) => handleImageChange(e, "roomOutside")}
              />
            </div>

            {post?.kitchen[0] && (
              <div className="input-group">
                <label htmlFor="kitchenImage">
                  Upload Kitchen Image (Max 10MB, Required if kitchen exists):
                </label>
                <input
                  type="file"
                  id="kitchenImage"
                  accept="image/*"
                  ref={kitchenInputRef}
                  onChange={(e) => handleImageChange(e, "kitchen")}
                />
              </div>
            )}

            {post?.washroom[0] && (
              <div className="input-group">
                <label htmlFor="washroomImage">
                  Upload Washroom Image (Max 10MB, Required if washroom exists):
                </label>
                <input
                  type="file"
                  id="washroomImage"
                  accept="image/*"
                  ref={washroomInputRef}
                  onChange={(e) => handleImageChange(e, "washroom")}
                />
              </div>
            )}

            <div className="input-group">
              <label htmlFor="videoUpload">Upload Video (Max 50MB):</label>
              <input
                type="file"
                id="videoUpload"
                accept="video/*"
                ref={videoInputRef}
                onChange={handleVideoChange}
              />
            </div>

            <div className="preview-container">
              {Object.keys(images).map(
                (key) =>
                  images[key] && (
                    <div key={key} className="media-card">
                      <img src={URL.createObjectURL(images[key])} alt={key} 
                      style={{
                        maxWidth: '100%',
                        height: 'auto',
                        objectFit: 'contain',
                      }}
                      />
                      
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteImage(key)}
                      >
                        X
                      </button>
                    </div>
                  )
              )}
              {video && (
                <div className="video-preview">
                  <video 
                    controls 
                    src={URL.createObjectURL(video)}
                    style={{
                      maxWidth: '100%',
                      height: 'auto'
                    }}
                  ></video>
                  <button className="delete-btn" onClick={handleDeleteVideo}>
                    X
                  </button>
                </div>
              )}
              {compressedMedia.video && !video && (
                <div className="video-preview">
                  <video
                    controls
                    src={URL.createObjectURL(compressedMedia.video)}
                  ></video>
                  <button className="delete-btn" onClick={handleDeleteVideo}>
                    X
                  </button>
                </div>
              )}
            </div>

            <button type="submit" className="submit-btn">
              Add Media
            </button>
          </form>
        </div>
      )}
      <Footer />
    </>
  );
};

export default AddMedia;
