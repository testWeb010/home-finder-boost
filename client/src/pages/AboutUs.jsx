import React, { useEffect } from "react";
import { FaUsers, FaHome, FaHandshake, FaMedal, FaMapMarkedAlt } from "react-icons/fa";
import { BsFillBuildingsFill } from "react-icons/bs";
import { IoCallSharp } from "react-icons/io5";
import { MdEmail, MdLocationOn, MdPlayCircle } from "react-icons/md"; // Add this import
import { HiLockClosed } from "react-icons/hi";
import { FaMoneyBillWave, FaPhoneAlt } from "react-icons/fa";
import { useTypewriter } from "react-simple-typewriter";
import AOS from "aos";
import "aos/dist/aos.css";
import "./css/AboutUs.css";
import Footer from "../components/footer/Footer";

const teamImgUrl = "https://img.freepik.com/free-photo/group-diverse-people-having-business-meeting_53876-25060.jpg";
const visionImgUrl = "https://img.freepik.com/free-photo/business-concept-vision-success_1421-26.jpg";

function AboutUs() {
  useEffect(() => {
    AOS.init({
      duration: 1000,
    });
  }, []);

    // Add typewriter effect for more engagement
    const [typeEffect] = useTypewriter({
      words: [
        "Making Housing Simple",
        "Connecting Dreams to Homes",
        "Your Perfect Space Awaits",
      ],
      loop: {},
      typeSpeed: 100,
      deleteSpeed: 40,
    });

  const stats = [
    { number: "1000+", text: "Happy Customers", icon: <FaUsers /> },
    { number: "500+", text: "Properties Listed", icon: <FaHome /> },
    { number: "50+", text: "Cities Covered", icon: <BsFillBuildingsFill /> },
    { number: "99%", text: "Customer Satisfaction", icon: <FaMedal /> },
  ];

  const values = [
    {
      title: "Trust",
      description:
        "Building lasting relationships through transparency and reliability",
      icon: <FaHandshake />,
    },
    {
      title: "Innovation",
      description: "Constantly evolving to provide better housing solutions",
      icon: <BsFillBuildingsFill />,
    },
    {
      title: "Community",
      description: "Creating connections that go beyond just finding a home",
      icon: <FaUsers />,
    },
  ];

  const features = [
    {
      icon: <HiLockClosed />,
      title: "No Broker Required",
      description: "Direct connection between tenants and property owners, eliminating broker fees and commissions."
    },
    {
      icon: <FaMoneyBillWave />,
      title: "Pay & Access",
      description: "One-time subscription payment unlocks all property details you need."
    },
    {
      icon: <FaPhoneAlt />,
      title: "Direct Contact",
      description: "Get instant access to verified property owner contact numbers after subscription."
    },
    {
      icon: <MdEmail />,
      title: "Email Access",
      description: "Connect through email for detailed inquiries and documentation."
    },
    {
      icon: <MdLocationOn />,
      title: "Exact Location",
      description: "Access precise property locations and directions after subscription."
    }
  ];

  return (
    <div className="about-container">
      {/* Hero Section */}
      <section className="hero-section" data-aos="fade-up">
        <h1>{typeEffect}</h1>
        <p>Connecting people with their perfect living spaces since 2023</p>
      </section>

      {/* Our Story Section */}
      <section className="story-section" data-aos="fade-up">
        <div className="content">
          <div className="text">
            <h2>Our Story</h2>
            <p>
              HomeDaze was born from a simple idea: make house hunting easier.
              We understand the challenges of finding the right place to live,
              especially for students and young professionals. Our platform
              connects property owners with potential tenants, creating a
              seamless experience for both parties.
            </p>
            <p>
              What started as a small project has grown into a trusted platform
              serving thousands of users across multiple cities. We're proud of
              our journey and excited about the future of housing solutions.
            </p>
          </div>
          <div className="image">
            <img src={teamImgUrl} alt="Our Team" loading="lazy" />
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section" data-aos="fade-up">
        <h2>Our Values & Vision</h2>
        <div className="values-container">
          <div className="vision-image">
            <img src={visionImgUrl} alt="Our Vision" loading="lazy" />
          </div>
          <div className="values-grid">
            {values.map((value, index) => (
              <div className="value-card" key={index} data-aos="zoom-in">
                <div className="icon">{value.icon}</div>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section" data-aos="fade-up">
        <div className="stats-container">
          {stats.map((stat, index) => (
            <div className="stat-card" key={index} data-aos="zoom-in">
              <div className="icon">{stat.icon}</div>
              <h3>{stat.number}</h3>
              <p>{stat.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section" data-aos="fade-up">
        <h2>How HomeDaze Works</h2>
        <p className="section-subtitle">Simple, Transparent, and Broker-Free</p>
        
        {/* Add Video Section Here */}
        <div className="video-container" data-aos="fade-up">
          <div className="video-wrapper">
            <iframe 
              src="https://www.youtube.com/embed/YOUR_VIDEO_ID"
              title="HomeDaze Guide"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
            <div className="play-button">
              <MdPlayCircle size={60} />
            </div>
          </div>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div className="feature-card" key={index} data-aos="zoom-in">
              <div className="icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section" data-aos="fade-up">
        <h2>Get in Touch</h2>
        <div className="contact-container">
          <div className="contact-card">
            <IoCallSharp />
            <h3>Call Us</h3>
            <p>+91 1234567890</p>
          </div>
          <div className="contact-card">
            <MdEmail />
            <h3>Email Us</h3>
            <p>support@homedaze.com</p>
          </div>
          <div className="contact-card">
            <MdLocationOn />
            <h3>Visit Us</h3>
            <p>Phagwara, Punjab, India</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default AboutUs;
