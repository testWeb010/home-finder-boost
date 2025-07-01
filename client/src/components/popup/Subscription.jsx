import React from "react";
import "./Subscription.css";
import "./Login.css";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import MembershipCard from "../cards/MembershipCard";
import urlprovider from "../../utils/urlprovider";
import { useLocation } from "react-router-dom";
import Footer from "../footer/Footer";

function Subscription() {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState();

  const [subscriptions, setSubscriptions] = useState();
  const location = useLocation();
  const { prevPath } = location.state || "/";

  const faqItems = [
    {
      question: "What payment methods do you accept?",
      answer:
        "we accept various payment methods ,we accept payments through Netbanking ,Credit cards ,Debit cards ,Paytm UPI via BHIM UPI ,Google Pay,PhonePe.",
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer: `At this time, our policy does not allow for cancellations of active subscriptions.
This is due to the nature of our subscription model, which helps us maintain the ongoing quality and availability of our services for all customers.
We've designed this approach to ensure that we can continue offering the best experience possible without interruptions.
`,
    },
    {
      question: "Is there a free trial available?",
      answer: `We do not offer a free trial, as our entire platform is free to use. 
You can browse through all available listings, explore different accommodations, and evaluate your options without any cost.
Payment is only required once you've selected the accommodation you wish to rent.`,
    },
    {
      question: "What's included in the Pro support?",
      answer: `Our Pro Plan offers a range of exclusive benefits to help make your property search more efficient and seamless.`,
    },
    {
      question: "How often are property listings updated?",
      answer: `Our team and servers are online 24/7 to ensure that listings are updated as quickly as possible. Whenever a user posts a new ad, it gets listed on the platform within an hour, allowing you to view the latest properties in real-time.`,
    },
  ];

  useEffect(() => {
    async function fetchSubs() {
      setIsLoading(true);
      try {
        const res = await axios.get(`${urlprovider()}/api/membership/`);
        if (res.status == 200) {
          setSubscriptions(res.data.memberships);
        } else {
          toast.error("Something went wrong");
        }
      } catch (err) {
        console.log(err);
        toast.error(
          err.response
            ? err.response.data.message || err.response.statusText
            : "Error"
        );
      } finally {
        setIsLoading(false);
      }
    }

    setUser(JSON.parse(localStorage.getItem("user")));
    fetchSubs();
  }, []);

  return (
    <>
      <div className="outer-subs-cont">
        <div className="subscription-header">
          <h1>Choose Your Perfect Plan</h1>
          <p>
            Find your ideal living space with our flexible subscription plans
          </p>
        </div>
        <div className="cont">
          {isLoading ? (
            "Loading..."
          ) : subscriptions && subscriptions.length > 0 ? (
            subscriptions.map((sub, index) => (
              <MembershipCard
                card={sub}
                key={index}
                user={user}
                prevPath={prevPath}
              />
            ))
          ) : (
            <p>No subscriptions available</p>
          )}
        </div>
        <div className="faq-section">
          <h2>Frequently Asked Questions</h2>
          <div className="accordion">
            {faqItems.map((item, index) => (
              <Accordion
                key={index}
                question={item.question}
                answer={item.answer}
              />
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

const Accordion = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="accordion-item">
      <button className="accordion-header" onClick={() => setIsOpen(!isOpen)}>
        {question}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className={`accordion-icon ${isOpen ? "open" : ""}`}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
          />
        </svg>
      </button>
      {isOpen && <div className="accordion-content">{answer}</div>}
    </div>
  );
};

export default Subscription;
