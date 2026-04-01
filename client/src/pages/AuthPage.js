// src/pages/AuthPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import "./AuthPage.css";

export default function AuthPage() {
  const [tab, setTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (tab === "register") {
        await api.register(form.name, form.email, form.password);
        setTab("login");
        setError("");
        setForm((p) => ({ ...p, password: "" }));
        return;
      }

      const data = await api.login(form.email, form.password);
      login(data.token, data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">📚</div>
          <span className="auth-logo-text">DocMind </span>
        </div>

        <h1 className="auth-title">
          {tab === "login" ? "Welcome back" : "Create account"}
        </h1>
        <p className="auth-subtitle">
          {tab === "login"
            ? "Sign in to continue your study session"
            : "Start learning smarter with AI"}
        </p>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${tab === "login" ? "active" : ""}`}
            onClick={() => { setTab("login"); setError(""); }}
          >
            Sign In
          </button>
          <button
            className={`auth-tab ${tab === "register" ? "active" : ""}`}
            onClick={() => { setTab("register"); setError(""); }}
          >
            Register
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {tab === "register" && (
            <div className="form-group animate-fade-in">
              <label className="form-label">Full Name</label>
              <input
                className="form-input"
                name="name"
                type="text"
                placeholder="John Doe"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          {error && <div className="auth-error">⚠ {error}</div>}

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? (
              <><span className="spinner" /> Processing…</>
            ) : tab === "login" ? (
              "Sign In →"
            ) : (
              "Create Account →"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}