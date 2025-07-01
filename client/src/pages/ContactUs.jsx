import React, { useState } from 'react';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock } from 'react-icons/fa';
import '../pages/css/ContactUs.css';
import Cookies from "js-cookie";
import axios from "axios";
import urlprovider from "../utils/urlprovider";
import toast from "react-hot-toast";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    userName: '',
    emailId: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success'
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        `${urlprovider()}/api/contact/contact-us`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );

      const data = await res.data;
      console.log(data);

      if (data.success) {
        setNotification({
          show: true,
          message: 'Message sent successfully! We will get back to you soon.',
          type: 'success'
        });
        setFormData({
          userName: '',
          emailId: '',
          subject: '',
          message: ''
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      setNotification({
        show: true,
        message: error.message || 'Failed to send message. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
      setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }));
      }, 5000);
    }
  };

  const contactInfo = [
    {
      icon: <FaMapMarkerAlt />,
      title: 'Our Location',
      content: '843324 Mahadeopatti,Sitamarhi, Bihar, India'
    },
    {
      icon: <FaPhone />,
      title: 'Phone Number',
      content: '+91 874-098-0991'
    },
    {
      icon: <FaEnvelope />,
      title: 'Email Address',
      content: 'support@thehomedaze.com'
    },
    {
      icon: <FaClock />,
      title: 'Working Hours',
      content: 'Mon - Fri: 9:00 AM - 4:00 PM'
    }
  ];

  return (
    <div className="contact-page">
      <div className="container">
        {/* Header Section */}
        <div className="header">
          <h1 className="gradient-text">Contact Us</h1>
          <p className="subtitle">
            Have questions about NewHomeDaze? We're here to help you find your dream home.
          </p>
        </div>

        <div className="info-cards">
          {contactInfo.map((info, index) => (
            <div className="card" key={index}>
              <div className="icon">{info.icon}</div>
              <h3>{info.title}</h3>
              <p>{info.content}</p>
            </div>
          ))}
        </div>

        <div className="contact-content">
          <div className="form-container">
            <h2>Send us a Message</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <input
                    type="text"
                    name="userName"
                    value={formData.userName}
                    onChange={handleChange}
                    placeholder="Your Name"
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="email"
                    name="emailId"
                    value={formData.emailId}
                    onChange={handleChange}
                    placeholder="Email Address"
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Subject"
                    required
                  />
                </div>
                <div className="form-group">
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Your Message"
                    rows="4"
                    required
                  ></textarea>
                </div>
                <div className="form-group">
                  <button 
                    type="submit" 
                    className="submit-button"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="loader"></div>
                    ) : (
                      'Send Message'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Map Section */}
          <div className="map-container">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3574.218838785737!2d85.49864771437472!3d26.60395638334897!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39ec731f58b440d3%3A0xa635f3f527b1e138!2sMahadeopatti%2C%20Sitamarhi%2C%20Bihar%20843324%2C%20India!5e0!3m2!1sen!2sus!4v1701921292826!5m2!1sen!2sus"
              allowFullScreen=""
              loading="lazy"
              title="location map"
              referrerpolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        {/* Notification */}
        {notification.show && (
          <div className={`notification ${notification.type}`}>
            {notification.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactUs;
