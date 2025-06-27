import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./css/ResetPassword.css";
import toast from "react-hot-toast";
import axios from "axios";
import { useParams } from "react-router-dom";
import miniLogo from "../assets/images/miniLogo.gif";

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const passwordRegex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (!passwordRegex.test(password)) {
      toast.error(
        "Password must be at least 8 characters long, contain at least one number, one special character, one uppercase and one lowercase letter"
      );
      return;
    }
    console.log("first");

    try {
      setIsLoading(true);
      const res = await axios.post(`${urlprovider()}/api/auth/reset-password`, {
        token,
        password,
      });
      console.log(res);
      if (res.status === 200) {
        toast.success(res.data.message);
        setPassword("");
        setConfirmPassword("");
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
        console.error(err);
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="loader" style={{ display: isLoading ? "flex" : "none" }}>
        <img src={miniLogo} alt="logo" />
      </div>
      <div className="reset-password-container">
        <div className="reset-password-card">
          <h2 className="reset-password-title">Reset Your Password</h2>
          <form onSubmit={handleSubmit}>
            {/* New Password Field */}
            <div className="input-container">
              <input
                type={passwordVisible ? "text" : "password"}
                className="reset-password-input"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span
                className="password-toggle-icon"
                onClick={() => setPasswordVisible(!passwordVisible)}
              >
                {passwordVisible ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            {/* Confirm Password Field */}
            <div className="input-container">
              <input
                type={confirmPasswordVisible ? "text" : "password"}
                className="reset-password-input"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <span
                className="password-toggle-icon"
                onClick={() =>
                  setConfirmPasswordVisible(!confirmPasswordVisible)
                }
              >
                {confirmPasswordVisible ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <button type="submit" className="reset-password-button">
              Reset Password
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;
