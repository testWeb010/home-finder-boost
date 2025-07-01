import React, { useEffect, useState } from "react";
import "./css/EmailVerification.css";
import { useParams } from "react-router-dom";
import axios from "axios";
import { TbRosetteDiscountCheckFilled } from "react-icons/tb";
import { MdError } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import urlprovider from "../utils/urlprovider";

function EmailVerification() {
  const navigate = useNavigate();
  const params = useParams();
  const [result, setResult] = useState("Verifying...");
  const [verified, setVerified] = useState(false);
  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const res = await axios.post(
          `${urlprovider()}/api/auth/verify-email`,
          { token: params.token }
        );
        if (res.status === 200) {
          setResult(res.data.message);
          setVerified(true);
        } else {
          setResult("Email verification failed");
        }
      } catch (err) {
        setResult(err.response?.data?.message);
      }
    };
    verifyEmail();
  }, []);

  //   redirect after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/");
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const [sec, setSec] = useState(5);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (sec > 0) {
        setSec(sec - 1);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [sec]);

  return (
    <div className="verification-outer">
      <div className="container">
        <p>{verified ? (
          <TbRosetteDiscountCheckFilled className="success" />
        ) : (
          <MdError className="error" />
        )}
        {result}</p>
        <p className="redirect">Redirecting in {sec} seconds...</p>
      </div>
    </div>
  );
}

export default EmailVerification;
