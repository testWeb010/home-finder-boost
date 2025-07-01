import React, { useEffect } from "react";
import Logo from "../../assets/images/logo.webp";
import { FaFacebookF, FaTelegram } from "react-icons/fa6";
import { FaTwitter } from "react-icons/fa";
import { AiFillInstagram } from "react-icons/ai";
import AOS from "aos";
import "aos/dist/aos.css";
import "./Footer.css";
import { Link, useNavigate } from "react-router-dom";

function Footer() {
  useEffect(() => {
    AOS.init({
      duration: 500,
    });
  }, []);

  

  const navigate = useNavigate();
  

  return (
    <div className="footer">
      <div className="bg"></div>
      <footer data-aos="fade-up">
        <div className="about">
          <div
            className="logo"
            onClick={() => navigate("/", { replace: true })}
          >
            <img
              src={Logo}
              alt="The HomeDaze Logo"
              loading="lazy"
              decoding="async"
            />
          </div>
          <p>
            We provide information about properties such
            <br />
            as homes, appartments, and PGs to help people
            <br />
            find their dream home.
          </p>
          
          <div className="social">
            <FaFacebookF className="icon" />
            <FaTwitter className="icon" />
            <FaTelegram className="icon" onClick={() => window.open("https://t.me/thehomedaze", "_blank")}/>
            <AiFillInstagram className="icon" onClick={() => window.open("https://www.instagram.com/thehomedaze?igsh=MTNwOWgwNDJocW1kOQ==", "_blank")}/>
          </div>
        </div>
        <div className="property">
          <h2>Property</h2>
          <ul>
            <li>Home</li>
            <li>Appartment</li>
            <li>PG</li>
          </ul>
        </div>
        <div className="contact">
          <h2>Contact</h2>
          <ul>
            <li>Mahadeopatti,Sitamarhi, Bihar, 843324</li>
            <li>(874) 098-0991</li>
            <li>support@thehomedaze.com</li>
          </ul>
        </div>
      </footer>
      <div
        style={{
          textAlign: "center",
          padding: "1rem",
          color: "#333",
          fontSize: "0.7rem",
        }}
        className="footer-bottom"
      >
        <p>
          <Link
            to="/terms-and-conditions"
            style={{ textDecoration: "underline" }}
          >
            Terms and Conditions
          </Link>
          &nbsp;{" "}
          <Link
            to="/cancellation-policy"
            style={{ textDecoration: "underline" }}
          >
            Cancellation Policy
          </Link>{" "}
          &copy; 2024 The HomeDaze. All rights reserved.
        </p>
        {/* <p style={{textDecoration: "underline"}}>
        </p> */}
      </div>
    </div>
  );
}

export default Footer;
