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

      {/* ── LEFT: Intro ── */}
      <div className="auth-intro">
        <div className="auth-intro-logo">
          <div className="auth-intro-icon">📚</div>
          <span className="auth-intro-brand">DocMind AI</span>
        </div>

        <h1 className="auth-intro-heading">
          Your documents,<br />
          <span className="auth-intro-highlight">now intelligent.</span>
        </h1>

        <p className="auth-intro-desc">
          Upload any academic PDF and start asking questions in plain English.
          DocMind AI retrieves the most relevant content from your documents and
          generates precise, grounded answers — no hallucinations, no guesswork.
        </p>

        <div className="auth-features">
          <div className="auth-feature">
            <div className="auth-feature-icon">⚡</div>
            <div>
              <div className="auth-feature-title">Instant Answers</div>
              <div className="auth-feature-desc">
                Powered by LLaMA 3.3 70B on Groq — responses in seconds
              </div>
            </div>
          </div>

          <div className="auth-feature">
            <div className="auth-feature-icon">🔒</div>
            <div>
              <div className="auth-feature-title">Private & Isolated</div>
              <div className="auth-feature-desc">
                Your documents are stored in your own personal vector namespace
              </div>
            </div>
          </div>

          <div className="auth-feature">
            <div className="auth-feature-icon">🎯</div>
            <div>
              <div className="auth-feature-title">Context-Aware RAG</div>
              <div className="auth-feature-desc">
                Semantic search retrieves only what's relevant — 85%+ accuracy
              </div>
            </div>
          </div>

          <div className="auth-feature">
            <div className="auth-feature-icon">📄</div>
            <div>
              <div className="auth-feature-title">Multi-Document</div>
              <div className="auth-feature-desc">
                Upload multiple PDFs and query across your entire library
              </div>
            </div>
          </div>
        </div>

        <div className="auth-stats">
          <div className="auth-stat">
            <span className="auth-stat-num">85%+</span>
            <span className="auth-stat-label">Answer Accuracy</span>
          </div>
          <div className="auth-stat-divider" />
          <div className="auth-stat">
            <span className="auth-stat-num">60%</span>
            <span className="auth-stat-label">Faster Retrieval</span>
          </div>
          <div className="auth-stat-divider" />
          <div className="auth-stat">
            <span className="auth-stat-num">RAG</span>
            <span className="auth-stat-label">Powered Pipeline</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT: Auth Form ── */}
      <div className="auth-form-side">
        <div className="auth-card">
          <div className="auth-logo">
            <div className="auth-logo-icon">📚</div>
            <span className="auth-logo-text">DocMind AI</span>
          </div>

          <h2 className="auth-title">
            {tab === "login" ? "Welcome back" : "Create account"}
          </h2>
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
    </div>
  );
}