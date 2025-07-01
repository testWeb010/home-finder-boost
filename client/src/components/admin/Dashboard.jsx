import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import axios from "axios";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import { UsersRound, AppWindow, ReceiptText } from "lucide-react";
import urlprovider from "../../utils/urlprovider";
import miniLogo from "../../assets/images/miniLogo.gif";

function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const res = await axios({
          url: `${urlprovider()}/api/admin/get-stats`,
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        });
        if (res.status === 200) {
          setData(res.data);
        }
      } catch (e) {
        console.log(e);
        toast.error("Error fetching data");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  return isLoading ? (
    <div className="loader" style={{ display: isLoading ? "flex" : "none" }}>
      <img src={miniLogo} alt="logo" loading="lazy" />
    </div>
  ) : data ? (
    <div className="d-dashboard">
      <h1 className="d-title">Dashboard</h1>
      <div className="d-stats">
        <div className="d-stat">
          <h3 className="d-stat-title">Users</h3>
          <p className="d-stat-value">
            <UsersRound /> {data.usersCount}
          </p>
        </div>
        <div className="d-stat">
          <h3 className="d-stat-title">Posts</h3>
          <p className="d-stat-value">
            <AppWindow /> {data.postsCount}
          </p>
        </div>
        <div className="d-stat">
          <h3 className="d-stat-title">Orders</h3>
          <p className="d-stat-value">
            <ReceiptText /> {data.ordersCount}
          </p>
        </div>
      </div>
    </div>
  ) : (
    <div className="d-error">Error fetching data</div>
  );
}

export default Dashboard;
