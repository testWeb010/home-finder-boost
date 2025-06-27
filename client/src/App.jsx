import { useEffect, useState } from "react";
import "./App.css";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import Header from "./components/header/Header";
import Landing from "./pages/Landing";
import Login from "./components/popup/Login";
import EmailVerification from "./pages/EmailVerification";
import AdPost from "./pages/AdPost";
import AddMedia from "./pages/AddMedia";
import GoogleSuccess from "./pages/GoogleSuccess";
import { Toaster } from "react-hot-toast";
import AllProperties from "./pages/AllProperties";
import Property from "./pages/Property";
import ResetPassword from "./pages/ResetPassword";
import Checkout from "./pages/Checkout";
import Logo from "./assets/images/logo.webp";
import Profile from "./pages/Profile";
import Subscription from "./components/popup/Subscription";
import AdminPanel from "./pages/admin/AdminPanel";
import EditPost from "./pages/EditPost";
import TermsAndConditions from "./pages/TermsAndConditions";
import CancellationPolicy from "./pages/CancellationPolicy";
import ContactUs from "./pages/ContactUs";
import AboutUs from "./pages/AboutUs";

function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAuth, setIsAuth] = useState(false);

  const [loading, setLoading] = useState(true);

  // Get the current location of the app (URL path)
  const location = useLocation();

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 3000);
  }, []);

  // Track page views on route change
  useEffect(() => {
    if (window.gtag) {
      window.gtag('config', 'G-YHJFJ711HN', {
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);

  return (
    <div>
      {loading && (
        <div className="main-loader">
          <img src={Logo} alt="logo" />
        </div>
      )}
      <Toaster
        toastOptions={{
          position: "top-center",
          style: {
            top: "50px",
            zIndex: 999,
          },
        }}
        richcolors
      />
      <Header
        isOpen={isLoginOpen}
        setIsOpen={setIsLoginOpen}
        isAuth={isAuth}
        setAuth={setIsAuth}
        loading={loading}
      />
      <Login
        isOpen={isLoginOpen}
        setIsOpen={setIsLoginOpen}
        isAuth={isAuth}
        setAuth={setIsAuth}
      />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/new-post" element={<AdPost />} />
        <Route path="/add-media/:postid" element={<AddMedia />} />
        <Route path="/all-properties/:location?" element={<AllProperties />} />
        <Route path="/property/:id" element={<Property />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/verify-email/:token" element={<EmailVerification />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/google-auth-success" element={<GoogleSuccess />} />
        <Route path="*subscription" element={<Subscription />} />
        <Route path="/subscriptions" element={<Subscription />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
        <Route path="/cancellation-policy" element={<CancellationPolicy />} />
        {/* admin panel */}
        <Route path="/admin-panel" element={<AdminPanel />} />
      </Routes>
    </div>
  );
}

export default function AppWithRouter() {
  return (
    <Router>
      <App />
    </Router>
  );
}