import React, { useEffect, useState } from "react";
import { FaRupeeSign, FaCheckCircle, FaUserAlt, FaPhoneAlt, FaShieldAlt, FaCreditCard, FaLock } from "react-icons/fa";
import { useLocation, useNavigate, Link } from "react-router-dom";
import "./css/Checkout.css";
import toast from "react-hot-toast";
import { load } from "@cashfreepayments/cashfree-js";
import axios from "axios";
import Cookies from "js-cookie";
import urlprovider from "../utils/urlprovider";
import UPI from "../assets/images/upi.png";
import Cards from "../assets/images/atm-card.png"; 
import MobileBanking from "../assets/images/mobile-banking.png"; 
import Wallet from "../assets/images/wallet.png"; 

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { card, prevPath } = location.state || {};

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  //   cashfree
  const [cashfree, setCashfree] = useState(null);

  useEffect(() => {
    async function initializeSDK() {
      const cf = await load({
        mode: "production",
      });
      setCashfree(cf);
    }
    initializeSDK();
  }, []);

  const getSessionIdOrderId = async (e) => {
    setIsLoading(true);
    try {
      const res = await axios.post(
        `${urlprovider()}/api/payment/pay`,
        {
          name: name,
          mobile: mobile,
          membershipId: card._id,
        },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );

      if (res.data) {
        if (res.data.order_id && res.data.payment_session_id) {
          //   setOrderId(res.data.order_id);
          return {
            sessionId: res.data.payment_session_id,
            orderId: res.data.order_id,
          };
        } else {
          toast.error("Missing order_id or payment_session_id");
        }
      }
    } catch (error) {
      toast.error("Error fetching session ID");
      console.log("Error fetching session ID: ", error);
    }
  };

  const verifyPayment = async (orderId, request) => {
    try {
      console.log("orderid", orderId);
      let res = await axios.post(
        `${urlprovider()}/api/payment/verify`,
        { orderId, request }, // Ensure orderId is correctly passed
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );

      if (res && res.data) {
        const paymentData = res.data[0]; // Assuming the response structure

        console.log("paymentData", paymentData);

        switch (paymentData.payment_status) {
          case "SUCCESS":
            toast.success("Payment Successful");
            navigate(prevPath || "/");
            break;
          case "NOT_ATTEMPTED":
            toast.error("Payment was not attempted. Please try again.");
            break;
          case "FAILED":
            toast.error("Payment failed. Please check your payment method.");
            break;
          default:
            toast.error("Unexpected payment status. Please try again.");
        }
      }
    } catch (error) {
      console.log(error);
      console.log(
        "Error during payment verification:",
        error.response ? error.response.data : error
      );
      toast.error("An error occurred during payment verification.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayNow = async (e) => {
    e.preventDefault();
    if (!name || !mobile) {
      setError("Please fill in both name and mobile number.");
      return;
    }
    setError("");

    try {
      const { sessionId, orderId } = await getSessionIdOrderId();

      let checkoutOptions = {
        paymentSessionId: sessionId,
        redirectTarget: "_modal",
      };

      cashfree.checkout(checkoutOptions).then((res) => {
        verifyPayment(orderId, {
          name,
          mobile,
          membershipId: card._id,
          membershipName: card.planName,
        });
      });
    } catch (error) {
      console.log(error);
    }
  };

  if (!card) {
    return <h2>Error: No membership plan selected!</h2>;
  }

  const discountPrice = card.originalPrice - card.discountedPrice;
  const discount = Math.round((discountPrice / card.originalPrice) * 100);

  return (
    <div className="checkout-wrapper">
      <div className="checkout-container">
        {/* Left Section (Plan Summary) */}
        <div className="checkout-left">
          <div className="section-header">
            <h2>Complete Your Purchase</h2>
            <span className="step-indicator">Step 1 of 2</span>
          </div>
          
          <div className="checkout-card">
            <div className="plan-header">
              <h3>{card.planName}</h3>
              <span className="duration-badge">{card.durationInDays} Days Premium</span>
            </div>
            <div className="features-list">
              {card.features.map((feature, index) => (
                <div key={index} className="feature-item">
                  <FaCheckCircle className="check-icon" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="payment-modes">
            <div className="section-header">
              <h3>Payment Modes</h3>
              <span className="secure-badge">
                <FaShieldAlt />
                100% Secure Payment
              </span>
            </div>
            <div className="payment-grid">
              <div className="payment-option" role="button" tabIndex={0}>
                <img src={UPI} alt="UPI" />
                <span>UPI Payment</span>
              </div>
              <div className="payment-option" role="button" tabIndex={0}>
                <img src={Cards} alt="Cards" />
                <span>Credit/Debit Card</span>
              </div>
              <div className="payment-option" role="button" tabIndex={0}>
                <img src={MobileBanking} alt="Net Banking" />
                <span>Net Banking</span>
              </div>
              <div className="payment-option" role="button" tabIndex={0}>
                <img src={Wallet} alt="Wallet" />
                <span>Mobile Wallet</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section (Price & Payment) */}
        <div className="checkout-right">
          <div className="section-header">
            <h3>Order Summary</h3>
            <span className="step-indicator">Step 2 of 2</span>
          </div>

          <div className="price-card">
            <div className="price-details">
              <div className="price-row">
                <span>Original Price</span>
                <span className="price">
                  <FaRupeeSign /> {card.originalPrice}
                </span>
              </div>
              <div className="price-row discount">
                <span>Special Discount ({discount}% OFF)</span>
                <span className="price">
                  - <FaRupeeSign /> {discountPrice}
                </span>
              </div>
              <div className="price-divider"></div>
              <div className="price-row total">
                <span>Final Amount</span>
                <span className="price">
                  <FaRupeeSign /> {card.discountedPrice}
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handlePayNow} className="payment-form">
            <div className="input-group">
              <label htmlFor="name">
                <FaUserAlt /> Full Name
              </label>
              <input
                type="text"
                id="name"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="mobile">
                <FaPhoneAlt /> Mobile Number
              </label>
              <input
                type="tel"
                id="mobile"
                placeholder="Enter your mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                required
              />
            </div>
            {error && (
              <div className="error-message">
                <FaLock /> {error}
              </div>
            )}
            <button 
              type="submit" 
              className="pay-now-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading-spinner"></span>
              ) : (
                <>
                  <FaCreditCard />
                  Pay <FaRupeeSign /> {card.discountedPrice}
                </>
              )}
            </button>
          </form>

          <div className="terms">
            By proceeding with the payment, you agree to our{" "}
            <Link to="/terms-and-conditions">Terms of Service</Link> and{" "}
            <Link to="/cancellation-policy">Cancellation & Refund Policy</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
