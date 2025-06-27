import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import Dashboard from "../../components/admin/Dashboard";
import Notifications from "../../components/admin/Notifications";
import PostsPage from "../../components/admin/PostsPage";
import MembershipsPage from "../../components/admin/MembershipsPage";
import TeamPage from "../../components/admin/TeamPage";
import UsersPage from "../../components/admin/UsersPage";
import OrdersPage from "../../components/admin/OrdersPage";
import "./AdminPanel.css";
import { getUser } from "../../utils/storage";

function AdminPanel() {
  const [selected, setSelected] = useState("Dashboard");
  const navigate = useNavigate();
  const location = useLocation();

  const [logoutPopupOpen, setLogoutPopupOpen] = useState(false);

  // Handle logout
  const handleLogout = () => {
    setLogoutPopupOpen(true);
  };

  const confirmLogout = () => {
    Cookies.remove("token");
    setLogoutPopupOpen(false);
    window.location.href = "/";
  };

  const [tabs, setTabs] = useState(null);

  // handle unauthorized access
  useEffect(() => {
    const user = getUser();
    if (!user || user.role !== "admin") {
      navigate("/");
    } else if (user && user.role === "mainAdmin") {
      setTabs([
        "Dashboard",
        "Notifications",
        "History",
        "Posts",
        "Memberships",
        "Team",
        "Users",
        "Orders",
      ]);
    } else {
      setTabs([
        "Dashboard",
        "Notifications",
        "Posts",
        "Memberships",
        "Team",
        "Users",
        "Orders",
      ]);
    }
  }, [navigate]);

  // Effect to sync selected tab with the URL
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const tabb = query.get("tab");

    if (tabb && tabb !== selected) {
      setSelected(tabb);
    } else if (!tabb) {
      query.set("tab", selected);
      navigate(`?${query.toString()}`, { replace: true });
    }
  }, [location.search, selected]);

  // Effect to update the URL when the selected tab changes
  // useEffect(() => {
  //   const query = new URLSearchParams(location.search);
  //   query.set("tab", selected);
  //   navigate(`?${query.toString()}`, { replace: true });
  // }, []);

  // Render content based on the selected tab
  const renderContent = () => {
    switch (selected) {
      case "Dashboard":
        return <Dashboard />;
      case "Notifications":
        return <Notifications />;
      case "Posts":
        return <PostsPage />;
      case "Memberships":
        return <MembershipsPage />;
      case "Team":
        return <TeamPage />;
      case "Users":
        return <UsersPage />;
      case "Orders":
        return <OrdersPage />;
      case "History":
        return <div>History</div>;
      default:
        return <div>Invalid tab selected</div>;
    }
  };

  return (
    <div className="a-p">
      <div className="a-drawer">
        {tabs &&
          tabs.map((tab) => (
            <Link
              key={tab}
              className={selected === tab ? "selected" : ""}
              onClick={() => setSelected(tab)}
              to={`?tab=${tab}`}
            >
              {tab}
            </Link>
          ))}
        <Link onClick={handleLogout}>Logout</Link>
      </div>
      <div className="a-content">{renderContent()}</div>
      {logoutPopupOpen && (
        <div className="logout-popup">
          <div className="logout-popup-content">
            <p>Are you sure you want to logout?</p>
            <div>
              <button onClick={confirmLogout}>Yes</button>
              <button onClick={() => setLogoutPopupOpen(false)}>No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
