import React, { useState } from "react";
import "../aashiq-styles/Login.css";

export default function Login() {
  const [values, setValues] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Replace this with your login logic
    console.log("Form submitted:", values);
  };

  return (
    <div className="login-root">
      <div className="login-paper">
        <h1 className="login-title">Sign in</h1>
        <p className="login-subtitle">Use your account to continue</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <label htmlFor="email" className="login-label">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="login-input"
              value={values.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="password" className="login-label">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="login-input"
              value={values.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="login-options">
            <label className="login-remember">
              <input
                type="checkbox"
                name="remember"
                checked={values.remember}
                onChange={handleChange}
              />
              <span>Remember me</span>
            </label>

            <button
              type="button"
              className="login-link-button"
              onClick={() => alert("Forgot password flow here")}
            >
              Forgot password?
            </button>
          </div>

          <button type="submit" className="login-button">
            Sign in
          </button>
        </form>

        <p className="login-footer-text">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            className="login-link-button"
            onClick={() => alert("Go to signup")}
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}
