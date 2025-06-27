import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Cookies from "js-cookie";

function GoogleSuccess() {
  const location = useLocation();
  const token = new URLSearchParams(location.search).get("token");
  
  useEffect(() => {
    Cookies.set("token", token);
    window.location.href = '/';
  }, [token]);
  return (
    <h1
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        color: "#10B981"
      }}
    >
      Google authentication successful
    </h1>
  );
}

export default GoogleSuccess;
