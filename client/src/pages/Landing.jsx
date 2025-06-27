import React, { useEffect, useState, useMemo } from "react";
import Slider from "react-slick";
import { useTypewriter } from "react-simple-typewriter";
import AOS from "aos";
import "aos/dist/aos.css";
import Home from "../assets/images/home.webp";
import "./css/Landing.css";
import { FaLocationDot } from "react-icons/fa6";
import { FaAngleRight } from "react-icons/fa6";
import { FaAngleLeft } from "react-icons/fa6";
import { GoHomeFill } from "react-icons/go";
import { MdVilla } from "react-icons/md";
import { MdApartment } from "react-icons/md";
import { IoCall } from "react-icons/io5";
import { MdEmail } from "react-icons/md";
import property1 from "../assets/images/property1.jpg";
import property2 from "../assets/images/property2.jpg";
import property3 from "../assets/images/property3.jpg";
import property4 from "../assets/images/property4.jpg";
import property5 from "../assets/images/property5.jpg";
import raviImg from "../assets/images/ravi.jpg";
import sagarImg from "../assets/images/sagar.png";
import himanshuImg from "../assets/images/himanshu.png";
import aryanImg from "../assets/images/aryan.png";
import tanishaImg from "../assets/images/tisha.png";
import HouseVideo from "../assets/images/house_video.png";
import Dealer from "../assets/images/dealer.png";
import PropertyCardLanding from "../components/cards/PropertyCardLanding";
import Footer from "../components/footer/Footer";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ReviewCard from "../components/cards/ReviewCard";
import { Link, useNavigate } from "react-router-dom";
import { getUser } from "../utils/storage";
import MembershipCard from "../components/cards/MembershipCard";
import axios from "axios";
import urlprovider from "../utils/urlprovider";
import toast from "react-hot-toast";

const WIDTH = 33.33; // Add this constant for width calculation

function Landing() {
  // AOS init
  useEffect(() => {
    AOS.init({
      duration: 1000,
    });
  }, []);

  const navigate = useNavigate();

  // welcome typewriter
  const [typeEffect] = useTypewriter({
    words: [
      `Welcome to HomeDaze!`,
      "We Find Perfect Tenant/ Roomie/ Home For You",
    ],
    loop: {},
    typeSpeed: 100,
    deleteSpeed: 40,
  });

  // variables
  const [location, setLocation] = useState("");

  //  slider settings

  const settingsProperty = {
    dots: false,
    infinite: true,
    speed: 1000,
    slidesToShow: 4,
    slidesToScroll: 1,
    initialSlide: 0,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 2000,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 1400,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 1330,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },

      {
        breakpoint: 680,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  const settingsReview = {
    dots: false,
    infinite: true,
    speed: 1000,
    slidesToShow: 2,
    slidesToScroll: 1,
    initialSlide: 0,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 2000,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 1480,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },

      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  // recommended properties
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    async function fetchProperties() {
      try {
        const res = await axios.get(
          `${urlprovider()}/api/post/get-popular-posts`
        );
        if (res.status === 200) {
          setProperties(res.data.posts || []);
        } else {
          toast.error("Something went wrong");
        }
      } catch (err) {
        console.log(err);
      }
    }
    fetchProperties();
  }, []);

  const reviews = [
    {
      image: property1,
      title: "Best! I Got the best house i wanted ",
      description: `I was looking for a room in kota and I 
        found the perfect one through HomeDaze.`,
      name: "Sagar prajapati",
      location: "kota",
      userImage: sagarImg,
      rating: 4.6,
    },
    {
      image: property2,
      title: "Easy findings",
      description: `HomeDaze made the process of renting accomodation 
        incredibly easy and stress-free.`,
      name: "Ravi Kumar",
      location: "Jalandhar",
      userImage: raviImg,
      rating: 4.8,
    },
    {
      image: property3,
      title: "HomeDaze is the best",
      description: `It was easy to find accomodation through homedaze. I was
      looking for the property without any restrictions and homedaze did their job
      well`,
      name: "Himanshu gurjar",
      location: "phagwara",
      userImage: himanshuImg,
      rating: 5.0,
    },
    {
      image: property4,
      title: "Good initiative",
      description: `Earlier Changing and finding room were quite long task,
      homedaze is something i was looking for!`,
      name: "aryan akki",
      location: "kharar",
      userImage: aryanImg,
      rating: 4.7,
    },
    {
      image: property5,
      title: "HomeDaze Exceeded My Expectations",
      description: `From start to finish, HomeDaze is perfect
      if you're looking for a roomate.I was able to find my roommate with
      ease`,
      name: "tanisha tarun",
      location: "kharar",
      userImage: tanishaImg,
      rating: 4.9,
    },
  ];

  const [activeButton, setActiveButton] = useState(0);

  const filteredProperties = useMemo(() => {
    const propertyTypes = ["apartment", "pg", "singleroom"];
    return properties.filter(
      (property) => property.propertyType === propertyTypes[activeButton]
    );
  }, [properties, activeButton]);

  const [bgOffset, setBgOffset] = useState(0);

  const slideBg = (n) => {
    const offset = WIDTH * n;
    setBgOffset(offset);
    setActiveButton(n);
  };

  const handleSwipe = (direction) => {
    if (direction === "left") {
      document.getElementsByClassName("slick-prev")[0].click();
    } else {
      document.getElementsByClassName("slick-next")[0].click();
    }
  };

  const [memberships, setMemberships] = useState([]);

  useEffect(() => {
    async function fetchMemberships() {
      try {
        const res = await axios.get(`${urlprovider()}/api/membership/`);
        if (res.status === 200) {
          setMemberships(res.data.memberships);
        } else {
          toast.error("Something went wrong");
        }
      } catch (err) {
        console.log(err);
      }
    }
    fetchMemberships();
  }, []);

  const [subscriber, setSubscriber] = useState("");

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (subscriber == "" || !isEmail(subscriber)) {
      toast.error("Invalid email");
      return;
    }
    try {
      const res = await axios.post(`${urlprovider()}/api/contact/subscribers`, {
        emailId: subscriber,
      });

      if (res.status === 200) {
        toast.success("Subscription successful!");
      } else {
        toast.error("Failed to subscribe. Please try again.");
      }
    } catch (error) {
      toast.error("An error occurred while subscribing. Please try again.");
      console.error("Subscription Error:", error);
    }
  };

  const containerStyle = {
    display: "flex",
    flexDirection: "column !important",
    justifyContent: "center",
    alignItems: "center",
    gap: "5%",
    paddingTop: "20px",
    width: "100%",
  };

  return (
    <div className="landing">
      {/* Welcome section*/}
      <section
        data-aos="fade-up"
        className="section-1"
        aria-labelledby="welcome-heading"
      >
        <div className="left">
          <div className="content">
            <h1>{typeEffect}</h1>
            <p>
              HomeDaze is a platform that helps you find your dream home. We
              provide you with the best properties in the market. We have a team
              of experts that will help you find the perfect home for you and
              your family.
            </p>
            <form
              className="searchbar"
              onSubmit={(e) => {
                e.preventDefault();
                navigate(`/all-properties/${location}`);
              }}
            >
              <FaLocationDot className="location-icon" size={24} />
              <input
                type="text"
                placeholder="Search for your dream home"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
              <Link
                type="submit"
                className="btn"
                to={`/all-properties/${location}`}
              >
                Search
              </Link>
            </form>
          </div>
        </div>
        <div className="right">
          <img src={Home} alt="home" loading="lazy" decoding="async" />
        </div>
      </section>

      {/* Recommendation section */}
      <section
        data-aos="fade-up"
        className="section-2"
        aria-labelledby="recommendation"
      >
        <p className="reccomendation">Our Recommendation</p>
        <div className="mini-navs">
          <h2>Featured House</h2>
          <div className="types" style={{ "--bg-offset": `${bgOffset}%` }}>
            <button
              onClick={() => slideBg(0)}
              className={activeButton === 0 ? "active" : ""}
            >
              <GoHomeFill /> Apartment
            </button>
            <button
              onClick={() => slideBg(1)}
              className={activeButton === 1 ? "active" : ""}
            >
              <MdApartment /> PG
            </button>
            <button
              onClick={() => slideBg(2)}
              className={activeButton === 2 ? "active" : ""}
            >
              <MdVilla /> Single/Shared
            </button>
          </div>
          <div className="swipes">
            <FaAngleLeft
              className="left"
              size={24}
              onClick={() => handleSwipe("left")}
            />
            <FaAngleRight
              className="right"
              size={24}
              onClick={() => handleSwipe("right")}
            />
          </div>
        </div>
        <div className="recommended-items">
          {properties.length > 0 ? (
            <Slider {...settingsProperty}>
              {filteredProperties.map((property, index) => (
                <PropertyCardLanding key={index} property={property} />
              ))}
            </Slider>
          ) : (
            "Loading..."
          )}
        </div>
      </section>

      {/* Ready to sell */}
      <section
        data-aos="fade-up"
        className="section-3"
        aria-labelledby="ready to sell"
      >
        <p className="ready-to-sell">Ready to sell</p>
        <div className="content">
          <div className="left">
            <h1>Let's Tour And See Our Property!</h1>
            <p>
              Houses recommended by our partners that have been
              <br />
              curated to become the home of your dreams!
            </p>
            <h3>House Detail</h3>
            <p>4 Bedrooms, 3 Bathrooms, 2,500 sqft</p>
            <div className="contact">
              <img src={Dealer} alt="" loading="lazy" decoding="async" />
              <div className="contact-details">
                <h3>Shraddha Gupta</h3>
                <p>Property Dealer</p>
              </div>
              <button className="btn">
                <IoCall size={18} /> Contact Now
              </button>
            </div>
          </div>
          <div className="right">
            <img src={HouseVideo} alt="home" loading="lazy" decoding="async" />
          </div>
        </div>
      </section>

      {/* subscriptions */}
      <section className="section-5 section-4" data-aos="fade-up">
        <p className="review-text">Explore our plans</p>
        <h2>Buy plans based on your requirements</h2>
        <div style={containerStyle}>
          {memberships &&
            memberships.map((membership, index) => (
              <MembershipCard card={membership} key={index} user={getUser()} />
            ))}
        </div>
      </section>

      {/* reviews */}
      <section
        data-aos="fade-up"
        className="section-4"
        aria-labelledby="reviews"
      >
        <p className="review-text">See Our Review</p>
        <h2>What Our Users Say About Us</h2>
        <Slider {...settingsReview}>
          {reviews.map((review, index) => (
            <ReviewCard key={index} review={review} />
          ))}
        </Slider>
      </section>

      {/* subscribe */}
      <section
        data-aos="fade-up"
        className="section-5"
        aria-labelledby="subscribe"
      >
        <div className="content">
          <h1>
            Subscribe For More Info
            <br />
            And Update From The HomeDaze
          </h1>
          <form className="searchbar emailbar">
            <MdEmail className="email-icon" size={32} />
            <input
              type="text"
              placeholder="Your email here"
              onChange={(e) => setSubscriber(e.target.value)}
            />
            <Link type="submit" onClick={(e) => handleSubscribe(e)}>
              Subscribe
            </Link>
          </form>
        </div>
      </section>
      {/* footer */}
      <Footer />
    </div>
  );
}

function isEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export default Landing;
