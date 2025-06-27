import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import Cookies from "js-cookie";
import "./Login.css";
import { IoClose } from "react-icons/io5";
import { FaGoogle } from "react-icons/fa";
import urlprovider from "../../utils/urlprovider";

function Login({ isOpen, setIsOpen, isAuth, setAuth }) {
  const [option, setOption] = useState(1);

  const types = [
    "Sign-in to your account",
    "Create an account",
    "Reset your password",
  ];

  useEffect(() => {
    // close login popup when we click outside (id login-popup)
    const overlay = document.querySelector(".overlay");
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        setIsOpen(false);
      }
    });
    // close login popup when we click the close button
    const close = document.querySelector(".close");
    close.addEventListener("click", () => {
      setIsOpen(false);
    });
  }, []);

  return (
    <div className="overlay" style={{ display: isOpen ? "flex" : "none" }}>
      <div className="container popup" id="login-popup">
        <IoClose className="close" onClick={() => setIsOpen(false)} />
        <header>
          <p>{types[option - 1]}</p>
        </header>
        <ul className="options">
          <li
            className={option === 1 ? "active" : ""}
            onClick={() => setOption(1)}
          >
            Sign in
          </li>
          <li
            className={option === 2 ? "active" : ""}
            onClick={() => setOption(2)}
          >
            Sign up
          </li>
          <li
            className={option === 3 ? "active" : ""}
            onClick={() => setOption(3)}
          >
            Forgot
          </li>
        </ul>
        <Form option={option} setIsOpen={setIsOpen} />
      </div>
    </div>
  );
}

function Form({ option, setIsOpen }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  //   handle submit
  const handleSubmit = async () => {
    const validateData = validate(email, password, username, name, option);
    if (password !== repeatPassword && option === 2) {
      toast.error("Passwords do not match");
    }
    if(validateData.status === false){
      toast.error(validateData.message)
      return;
    }
    setIsLoading(true);
    try {
      if (option === 1) {
        // SIGN IN
        const res = await axios({
          url: `${urlprovider()}/api/auth/login`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          data: {
            emailOrUsername: email,
            password: password,
          },
        });

        if (res.status === 200 || res.status === 201) {
          toast.success("Logged in successfully");
          Cookies.set("token", res.data.token, { expires: 1 });
          setEmail("");
          setPassword("");
          setIsOpen(false);
          location.reload(true);
        } else {
          toast.error(res.response.data.message);
        }
      } else if (option === 2) {
        // SIGN UP
        const res = await axios({
          url: `${urlprovider()}/api/auth/register`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          data: {
            name: name,
            username: username,
            email: email,
            password: password,
          },
        });

        if (res.status === 200) {
          toast.success(res.data.message);
          setName("");
          setEmail("");
          setPassword("");
          setUsername("");
          setRepeatPassword("");
        } else {
          toast.error(
            err.response
              ? err.response.data.message || err.response.statusText
              : "Error"
          );
        }
      } else if (option === 3) {
        // RESET PASSWORD
        const res = await axios.post(
          `${urlprovider()}/api/auth/forgot-password`,
          { emailOrUsername: email }
        );

        if (res.status === 200) {
          toast.success(
            "If an account with that email or username exists, a password reset link has been sent"
          );
          setEmail("");
        } else {
          toast.error("An error occurred");
        }
      }
    } catch (err) {
      if (err.response?.data?.message) {
        toast.error(err.response?.data?.message);
      } else {
        toast.error(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const res = await axios.get(
        `${urlprovider()}/api/auth/google-request`
      );
      window.location.href = res.data.url;
    } catch (err) {
      console.log(err.response.data.message);
      toast.error(err.response.data.message);
    }
  };

  return (
    <form className="account-form" onSubmit={(evt) => evt.preventDefault()}>
      <div
        className={
          "account-form-fields " +
          (option === 1 ? "sign-in" : option === 2 ? "sign-up" : "forgot")
        }
      >
        <input
          value={email}
          id="email"
          name="email"
          type="email"
          placeholder={option === 1 ? "Email or Username" : "Email"}
          required
          onChange={(e) => setEmail(e.target.value)}
        />
        {option === 2 ? (
          <input
            value={name}
            id="name"
            name="name"
            type="text"
            placeholder="Name"
            required
            onChange={(e) => setName((e.target.value))}
          />
        ) : null}
        <input
          value={password}
          id="password"
          name="password"
          type="password"
          placeholder="Password"
          required={option === 1 || option === 2 ? true : false}
          disabled={option === 3 ? true : false}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          value={username}
          id="username"
          name="username"
          type="text"
          placeholder="Username"
          required={option === 2 ? true : false}
          disabled={option === 1 || option === 3 ? true : false}
          onChange={(e) => setUsername((e.target.value).toLowerCase())}
        />
        <input
          value={repeatPassword}
          id="repeat-password"
          name="repeat-password"
          type="password"
          placeholder="Repeat password"
          required={option === 2 ? true : false}
          disabled={option === 1 || option === 3 ? true : false}
          onChange={(e) => setRepeatPassword(e.target.value)}
        />
      </div>
      <button
        className="btn-submit-form"
        type="submit"
        onClick={handleSubmit}
        disabled={isLoading}
      >
        {isLoading
          ? "Loading..."
          : option === 1
          ? "Sign in"
          : option === 2
          ? "Sign up"
          : "Reset password"}
      </button>
      {option === 1 || option === 2 ? (
        <div className="google-login" onClick={handleGoogleAuth}>
          <FaGoogle />
          <p>{option === 1 ? "Sign in" : "Sign up"} with Google</p>
        </div>
      ) : null}
    </form>
  );
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
const usernameRegex = /^[a-z0-9_.]{2,}$/;

// option 1 -> signin, option 2 -> signup, option 3 -> reset password

const validate = (email, password, username, name, option) => {
  if (!emailRegex.test(email)) {
    return { status: false, message: "Invalid email address" };
  }
  if (email.length <= 0) {
    return { status: false, message: "Email or Username is required" };
  }
  if (!passwordRegex.test(password) && (option === 1 || option === 2)) {
    return {
      status: false,
      message:
        "Password must be at least 8 characters long, contain at least one number, one special character, one uppercase and one lowercase letter",
    };
  }
  if (!usernameRegex.test(username) && option === 2) {
    return {
      status: false,
      message:
        "Username must be at least 2 characters long and can contain only letters, numbers, underscores, and periods",
    };
  }
  if(option === 2 && name.length <= 0){
    return { status: false, message: "Name is required" };
  }
  return { status: true, message: "Input validated" };
};

export default Login;
