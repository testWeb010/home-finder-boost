import React, { useEffect, useState, useRef } from "react";
import {
  Link,
  useParams,
  NavLink,
  useNavigate,
  useLocation,
} from "react-router-dom";
import "./css/profile.css";
import { IoBed } from "react-icons/io5";
import { FaBath, FaSmoking } from "react-icons/fa6";
import { FaKitchenSet } from "react-icons/fa6";
import { GiHummingbird } from "react-icons/gi";
import { BsLightningChargeFill } from "react-icons/bs";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { HiUsers } from "react-icons/hi";
import { FaHandshakeSimple } from "react-icons/fa6";
import getDate from "../utils/getDate";
import validatePassword from "../utils/validatePassword";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import EditProfile from "../components/popup/EditProfile";
import urlprovider from "../utils/urlprovider";

function Profile() {
  document.title = "Profile | StudySync";
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState({});
  const [isUser, setIsUser] = useState(false);
  const [selectedSection, setSelectedSection] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const getUser = async () => {
      try {
        let res = await fetch(
          `${urlprovider()}/api/user/get-user-by-id/${params.id}`,
          {
            headers: {
              Authorization: "Bearer " + Cookies.get("token"),
            },
          }
        );
        res = await res.json();
        if (res.status === "OK") {
          setUser(res.data);
          setIsUser(res.isUser);
          console.log(res.data);
        } else {
          console.log(res.message);
        }
      } catch (err) {
        console.log(err);
      } finally {
        setIsLoading(false);
      }
    };
    getUser();
  }, [params.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    const validationError = validatePassword(newPassword);
    if (validationError.status === false) {
      toast.error(validationError.message);
      return;
    }

    if (oldPassword === newPassword) {
      toast.error("New password cannot be same as old password.");
      return;
    }

    try {
      const res = await fetch(`${urlprovider()}/api/user/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: "Bearer " + Cookies.get("token"),
        },
        body: JSON.stringify({
          oldPassword,
          newPassword,
          confirmPassword,
        }),
      });
      const data = await res.json();
      if (data.success === "OK") {
        toast.success("Password updated successfully");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Error updating password.");
    }
  };

  function useQuery() {
    return new URLSearchParams(useLocation().search);
  }

  const query = useQuery();

  useEffect(() => {
    const section = query.get("section");
    if (section) {
      setSelectedSection(section);
    } else {
      setSelectedSection("profile");
      updateQueryParameter("section", "profile");
    }
  }, []);

  const updateQueryParameter = (key, value) => {
    query.set(key, value);
    navigate(`?${query.toString()}`, { replace: true });
  };

  useEffect(() => {
    if (selectedSection) {
      updateQueryParameter("section", selectedSection);
    }
  }, [selectedSection]);

  // close edit profile
  const handleClose = () => {
    setEditingProfile(false);
  };

  // profile updated, open snackbar
  const handleProfileEdited = (user) => {
    localStorage.setItem("user", JSON.stringify(user));
    toast.success("Profile Updated Successfully");
    setEditingProfile(false);
  };

  // error while updating profile
  const handleEditError = (message) => {
    toast.error(message);
  };

  // edit post
  const handleEditPost = (e, postId) => {
    e.preventDefault();
    navigate(`/edit-post/${postId}`, {
      replace: true,
      state: { prevPath: location.pathname },
    });
  };

  // activate or deactivate post
  const handlePostActive = async (e, postId) => {
    e.preventDefault();
    try {
      const res = await fetch(
        `${urlprovider()}/api/post/activate-post/${postId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + Cookies.get("token"),
          },
          body: JSON.stringify({
            postId: postId,
          }),
        }
      );
      const data = await res.json();
      if (res.status === 200) {
        toast.success("Post updated successfully");
        setUser((prev) => {
          const newPosts = prev.posts.map((post) => {
            if (post._id === postId) {
              return { ...post, isActive: !post.isActive };
            }
            return post;
          });
          return { ...prev, posts: newPosts };
        });
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Error updating post");
    }
  };

  // delete post
  const handleDeletePost = async (e, postId) => {
    e.preventDefault();
    try {
      const res = await fetch(
        `${urlprovider()}/api/post/delete-post/${postId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + Cookies.get("token"),
          },
          body: JSON.stringify({
            postId: user.posts[0]._id,
          }),
        }
      );
      const data = await res.json();
      if (res.status === 200) {
        toast.success("Post deleted successfully");
        setUser((prev) => {
          const newPosts = prev.posts.filter(
            (post) => post._id !== user.posts[0]._id
          );
          return { ...prev, posts: newPosts };
        });
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Error deleting post");
    }
  };

  return (
    <>
      {user ? (
        <div className="profile-container">
          <section className="left-section">
            {isLoading ? (
              <p>Loading...</p>
            ) : (
              <>
                <div style={{ position: "relative" }}>
                  <img
                    loading="lazy"
                    src={
                      user.profilePic ? user.profilePic : "/public/user.webp"
                    }
                    alt="profile-pic"
                  />
                  {isUser && (
                    <p
                      className="membership-tag"
                      style={{
                        position: "absolute",
                        top: "0",
                        left: "50%",
                        backgroundColor: "#10b981",
                        color: "white",
                        padding: "5px 10px",
                        transform: "translate(-50%, 50%)",
                        borderRadius: "5px",
                      }}
                    >
                      {user.role !== "admin"? user.membership?.planName ? user.membership?.planName : "NS" : "Admin"}
                    </p>
                  )}
                </div>
                <div className="profile-analysis">
                  <h2>{user.name}</h2>
                  <p className="username">@{user.username}</p>
                </div>
                {isUser && (
                  <>
                    <button
                      className="btn edit-profile"
                      onClick={() => setEditingProfile(!editingProfile)}
                    >
                      Edit
                    </button>
                    {editingProfile ? (
                      <EditProfile
                        user={user}
                        close={handleClose}
                        onSuccess={handleProfileEdited}
                        onError={handleEditError}
                      />
                    ) : null}
                  </>
                )}
              </>
            )}
          </section>
          <section className="right-section">
            <div className="nav-items">
              <Link
                className={`nav-item ${
                  selectedSection === "profile" ? "selected" : ""
                }`}
                onClick={() => setSelectedSection("profile")}
              >
                Profile
              </Link>
              {isUser && (
                <>
                  <Link
                    className={`nav-item ${
                      selectedSection === "changePassword" ? "selected" : ""
                    }`}
                    onClick={() => setSelectedSection("changePassword")}
                  >
                    Change Password
                  </Link>
                  {user.role !== "admin" && (
                    <Link
                      className={`nav-item ${
                        selectedSection === "posts" ? "selected" : ""
                      }`}
                      onClick={() => setSelectedSection("posts")}
                    >
                      Posts
                    </Link>
                  )}
                </>
              )}
            </div>
            <div className="content">
              {isLoading ? (
                <div className="loader-container">
                  <p className="loading"></p>
                </div>
              ) : (
                <>
                  {selectedSection === "profile" && (
                    <div className="profile">
                      <p>
                        <span>Name:</span> {user.name}
                      </p>
                      <p>
                        <span>Username:</span> {user.username}
                      </p>
                      <p>
                        <span>Email:</span> {user.email}
                      </p>
                      {/* <p>
                        <span>Status:</span> {user.status}
                      </p>
                      <p>
                        <span>Total posts:</span> {user.totalposts}
                      </p>
                      <p>
                        <span>Total Answers:</span> {user.totalAnswers}
                      </p> */}
                      <p>
                        <span>User Since:</span> {getDate(user.createdAt)}
                      </p>
                      <p>
                        <span>Last Updated:</span> {getDate(user.lastUpdated)}
                      </p>
                    </div>
                  )}
                  {isUser && (
                    <>
                      {selectedSection === "changePassword" && (
                        <div className="change-password">
                          <form onSubmit={handleSubmit}>
                            <div>
                              <label htmlFor="old-password">Old Password</label>
                              <input
                                type="password"
                                id="old-password"
                                placeholder="********"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                              />
                            </div>
                            <div>
                              <label htmlFor="new-password">New Password</label>
                              <input
                                type="password"
                                id="new-password"
                                placeholder="********"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                              />
                            </div>
                            <div>
                              <label htmlFor="confirm-password">
                                Confirm Password
                              </label>
                              <input
                                type="password"
                                id="confirm-password"
                                placeholder="********"
                                value={confirmPassword}
                                onChange={(e) =>
                                  setConfirmPassword(e.target.value)
                                }
                              />
                            </div>
                            <button type="submit" className="btn">
                              Update
                            </button>
                          </form>
                        </div>
                      )}
                      {selectedSection === "posts" && (
                        <div className="posts">
                          {user.posts && user.posts.length > 0 ? (
                            user.posts.map((post, index) => (
                              <div className="post" key={post._id}>
                                <div className="post-top">
                                  <div className="post-left">
                                    <NavLink
                                      to={`/property/${post._id}`}
                                      className="post-title"
                                    >
                                      {post.propertyName}
                                    </NavLink>
                                    <p className="small-text">
                                      {post.city[0].toUpperCase() +
                                        post.city.substr(1)}
                                      , {post.pincode} |{" "}
                                      {getDate(post.createdAt)}
                                    </p>
                                    <p className="post-description">
                                      {post.description}
                                    </p>
                                  </div>
                                  <div className="post-right">
                                    {/* edit options */}
                                    <button
                                      className={`btn ${
                                        post.isActive === true
                                          ? "delete-btn"
                                          : "edit-btn"
                                      }`}
                                      onClick={(e) =>
                                        handlePostActive(e, post._id)
                                      }
                                      style={{ fontSize: "0.8rem" }}
                                    >
                                      {post.isActive === true
                                        ? "Deactivate"
                                        : "Activate"}
                                    </button>
                                    <button
                                      className="btn edit-btn"
                                      onClick={(e) =>
                                        handleEditPost(e, post._id)
                                      }
                                    >
                                      <FaEdit />
                                    </button>
                                    <button
                                      className="btn delete-btn"
                                      onClick={(e) =>
                                        handleDeletePost(e, post._id)
                                      }
                                    >
                                      <MdDelete />
                                    </button>
                                  </div>
                                </div>
                                <p className="post-bottom">
                                  {/* amenties */}
                                  <div className="amenity">
                                    <IoBed size={20} />
                                    <p>{post.totalRooms} Room(s)</p>
                                  </div>
                                  <div className="amenity">
                                    <BsLightningChargeFill size={20} />
                                    <p>
                                      {post.electricityIncluded
                                        ? "Electricity Included"
                                        : "Electricity Excluded"}
                                    </p>
                                  </div>
                                  <div className="amenity">
                                    <FaKitchenSet size={20} />
                                    <p>
                                      {post.kitchen[1] && "Shared "}
                                      {post.kitchen[0]
                                        ? "Kitchen Available"
                                        : "Kitchen Not Available"}
                                    </p>
                                  </div>
                                  <div className="amenity">
                                    <FaBath size={20} />
                                    <p>
                                      {post.washroom[1] && "Shared "}
                                      {post.washroom[0]
                                        ? "Washroom Available"
                                        : "Washroom Not Available"}
                                    </p>
                                  </div>
                                  <div className="amenity">
                                    <FaSmoking size={20} />
                                    <p>
                                      {post.canSmoke
                                        ? "Smoking Allowed"
                                        : "Smoking Not Allowed"}
                                    </p>
                                  </div>
                                  <div className="amenity">
                                    <GiHummingbird size={20} />
                                    <p>
                                      {post.isIndependent
                                        ? "Independent Property"
                                        : "Shared Property"}
                                    </p>
                                  </div>
                                  <div className="amenity">
                                    <HiUsers size={20} />
                                    <p>Capacity {post.capacity}</p>
                                  </div>
                                  {post.needRoommate && (
                                    <div className="amenity">
                                      <FaHandshakeSimple size={20} />
                                      <p>Need Roommate</p>
                                    </div>
                                  )}
                                </p>
                              </div>
                            ))
                          ) : (
                            <p>No posts found</p>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </section>
        </div>
      ) : (
        "User Not Found"
      )}
    </>
  );
}

export default Profile;
