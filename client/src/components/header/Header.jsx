import React, { useEffect, useState } from "react";
import "./Header.css";
import Logo from "../../assets/images/logo.webp";
import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { IoMdNotifications, IoMdHome, IoMdPerson, IoMdAdd, IoMdSearch, IoMdInformationCircle, IoMdThumbsUp, IoMdStar, IoMdLogOut, IoMdCall, IoMdClose } from "react-icons/io";
import { saveUser } from "../../utils/storage";
import urlprovider from "../../utils/urlprovider";

function Header({ setIsOpen, isAuth, setAuth, loading }) {
  const [user, setUser] = useState({});
  const navigate = useNavigate();
  const [humOpen, setHumOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isNotificationsLoading, setIsNotificationsLoading] = useState(false);
  useEffect(() => {
    AOS.init({
      duration: 1000,
    });

    // Fetch notifications
    const fetchNotifications = async () => {
      if (!isAuth) return;
      
      try {
        setIsNotificationsLoading(true);
        const res = await axios({
          url: `${urlprovider()}/api/notifications`,
          method: "GET",
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        });
        if (res.status === 200 && res.data?.notifications) {
          setNotifications(res.data.notifications);
          setUnreadCount(res.data.notifications.filter(n => !n.isRead).length);
        }
      } catch (err) {
        console.log(err);
        setNotifications([]);
        setUnreadCount(0);
      } finally {
        setIsNotificationsLoading(false);
      }
    };

    if (isAuth) {
      fetchNotifications();
      // Poll for new notifications every minute
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [isAuth]);
  // fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios({
          url: `${urlprovider()}/api/user/`,
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        });

        if (res.status === 200) {
          setAuth(true);
          setUser(res.data.user);
          if (
            (res.data.user.role === "admin" ||
              res.data.user.role === "mainAdmin") &&
            window.location.pathname === "/"
          ) {
            navigate("/admin-panel");
          }
          saveUser(res.data.user);
          toast.success(`Authenticated As ${res.data.user.username}`);
        }
      } catch (err) {
        console.log(err);
      }
    };

    Cookies.get("token") && fetchUser();
  }, []);

  const handleNewPost = () => {
    if (isAuth) {
      navigate("/new-post");
    } else {
      setIsOpen(true);
    }
  };

  const handleLogout = () => {
    Cookies.remove("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const handleLogoClick = () => {
    if (user?.role === "admin" || user?.role === "mainAdmin") {
      navigate("/admin-panel");
    } else {
      navigate("/");
    }
  };

  // Close the hamburger menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        !e.target.closest(".hamburger") &&
        !e.target.closest(".username") &&
        !e.target.closest(".user img")
      ) {
        setHumOpen(false);
      }
    };

    if (humOpen) {
      document.addEventListener("click", handleOutsideClick);
    } else {
      document.removeEventListener("click", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [humOpen]);

  return (
    <>
      <header className={user?.role === "admin" ? "admin-header" : ""}>
        {window.location.pathname !== "/checkout" && (
          <>
            <div className="logo" onClick={handleLogoClick}>
              <img
                src={Logo}
                alt="The HomeDaze Logo"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className={`get-started ${humOpen ? "open" : ""}`}>
              {user?.role === "admin" && (
                <div className="notification-wrapper">
                  <button
                    className="btn notification-icon"
                    onClick={() => setShowNotifications(!showNotifications)}
                  >
                    <IoMdNotifications />
                    {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                  </button>
                  {showNotifications && (
                    <div className="notifications-dropdown" data-aos="fade-down">
                      <div className="notifications-header">
                        <h3>Notifications</h3>
                        <button onClick={() => setShowNotifications(false)} className="close-btn">
                          <IoMdClose />
                        </button>
                      </div>
                      <div className="notifications-list">
                        {isNotificationsLoading ? (
                          <div className="notifications-loading">Loading...</div>
                        ) : notifications && notifications.length > 0 ? (
                          notifications.map((notification) => (
                            <div
                              key={notification._id}
                              className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                              onClick={() => {
                                if (notification.type === 'property') {
                                  navigate(`/property/${notification.relatedId}`);
                                } else if (notification.type === 'message') {
                                  navigate(`/messages/${notification.relatedId}`);
                                } else if (notification.type === 'subscription') {
                                  navigate('/subscriptions');
                                }
                                setShowNotifications(false);
                              }}
                            >
                              <div className="notification-content">
                                <h4>{notification.title}</h4>
                                <p>{notification.message}</p>
                                <span className="notification-time">
                                  {new Date(notification.createdAt).toLocaleDateString('en-GB', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="no-notifications">No notifications</div>
                        )}
                      </div>
                      {notifications && notifications.length > 0 && (
                        <div className="notifications-footer">
                          <Link to="/admin-panel?tab=Notifications" onClick={() => setShowNotifications(false)}>
                            View All
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              {user?.role !== "admin" && user?.role !== "mainAdmin" && (
                <>
                  <Link to={"/"} className="btn">
                    About Us
                  </Link>
                  <Link to={"/all-properties/"} className="btn">
                    Properties
                  </Link>
                  {!isAuth && (
                    <Link
                      to={"/"}
                      className="btn signup-btn"
                      onClick={() => setIsOpen(true)}
                    >
                      SignIn/SignUp
                    </Link>
                  )}
                  <span to={"/"} className="btn post" onClick={handleNewPost}>
                    + Post
                  </span>
                </>
              )}
              {isAuth && (
                <div className="user">
                  <img
                    src={user.photo ? user.photo : "/public/user.webp"}
                    alt="User"
                    loading="lazy"
                    decoding="async"
                  />
                  <ul className="navs" data-aos="fade-up">
                    {user?.role === "admin" && (
                      <Link to="/admin-panel">Admin Panel</Link>
                    )}
                    <Link to={`/profile/${user._id}`}>Account</Link>
                    {user?.role !== "admin" && (
                      <Link to="/all-properties">All Properties</Link>
                    )}
                    <div className="logout-icon" onClick={handleLogout}>
                      <IoMdLogOut size={20} />
                    </div>
                  </ul>
                  <p style={{ color: "white" }} className="username">
                    {user.username}
                  </p>
                </div>
              )}
            </div>
            {/* Hamburger menu icon */}
            <div className="hamburger" onClick={() => setHumOpen(!humOpen)}>
              <div className="line"></div>
              <div className="line"></div>
              <div className="line"></div>
            </div>
          </>
        )}
      </header>
      
      {/* Mobile Bottom Navigation */}
      {window.location.pathname !== "/checkout" &&
       window.location.pathname !== "/admin-panel" &&
        !loading && (
        <>
          <nav className="mobile-nav">
            <div className="nav-item" onClick={() => navigate("/")}>
              <IoMdHome size={24} />
              <span>Home</span>
            </div>
            <div className="nav-item" onClick={() => navigate("/all-properties")}>
              <IoMdSearch size={24} />
              <span>Search</span>
            </div>
            <div className="nav-item nav-item-center" onClick={handleNewPost}>
              <IoMdAdd size={24} />
              <span>Post</span>
            </div>
            <div className="nav-item notification-item" onClick={() => navigate('/admin-panel?tab=Notifications')}>
              {unreadCount > 0 && <div className="notification-badge">{unreadCount}</div>}
              <IoMdNotifications size={24} />
              <span>Notifications</span>
            </div>
            <div className="nav-item" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <IoMdPerson size={24} />
              <span>Account</span>
            </div>
          </nav>

          {/* Mobile Account Menu */}
          {mobileMenuOpen && (
            <div className="mobile-account-menu" data-aos="fade-up">
              {!isAuth ? (
                <div className="menu-item" onClick={() => {
                  setIsOpen(true);
                  setMobileMenuOpen(false);
                }}>
                  <IoMdPerson size={20} />
                  <span>Sign In / Sign Up</span>
                </div>
              ) : (
                <div className="menu-item" onClick={() => {
                  navigate(`/profile/${user._id}`);
                  setMobileMenuOpen(false);
                }}>
                  <IoMdPerson size={20} />
                  <span>My Profile</span>
                </div>
              )}
              <div className="menu-item" onClick={() => {
                navigate("/about");
                setMobileMenuOpen(false);
              }}>
                <IoMdInformationCircle size={20} />
                <span>About Us</span>
              </div>
              <div className="menu-item" onClick={() => {
                navigate("/feedback");
                setMobileMenuOpen(false);
              }}>
                <IoMdThumbsUp size={20} /> 
                <span>Feedback</span>
              </div>
              <div className="menu-item" onClick={() => {
                navigate("/subscriptions");
                setMobileMenuOpen(false);
              }}>
                <IoMdStar size={20} />
                <span>Subscription</span>
              </div>
              <div className="menu-item" onClick={() => {
                navigate("/contact-us");
                setMobileMenuOpen(false);
              }}>
                <IoMdCall size={20} /> 
                <span>Contact Us</span>
              </div>
              {isAuth && (
                <div className="menu-item" onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}>
                  <IoMdLogOut size={20} />
                  <span>Logout</span>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
}

export default Header;
