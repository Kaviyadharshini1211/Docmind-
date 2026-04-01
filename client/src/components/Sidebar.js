// src/components/Sidebar.js
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Sidebar.css";

const navItems = [
  { icon: "⊞", label: "Dashboard", path: "/dashboard" },
  { icon: "💬", label: "Ask AI", path: "/chat" },
  { icon: "↑", label: "Upload PDF", path: "/upload" },
  { icon: "◷", label: "History", path: "/history" },
];

export default function Sidebar({ fileCount = 0, historyCount = 0 }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo-icon">📚</div>
        <span className="sidebar-logo-text">DocMind</span>
      </div>

      <nav className="sidebar-nav">
        <span className="nav-section-label">Menu</span>

        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const badge =
            item.path === "/upload"
              ? fileCount > 0 ? fileCount : null
              : item.path === "/history"
              ? historyCount > 0 ? historyCount : null
              : null;

          return (
            <button
              key={item.path}
              className={`nav-link ${isActive ? "active" : ""}`}
              onClick={() => navigate(item.path)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
              {badge && <span className="nav-badge">{badge}</span>}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="user-card">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <div className="user-name">{user?.name || "User"}</div>
            <div className="user-role">student</div>
          </div>
          <button
            className="logout-btn"
            onClick={handleLogout}
            title="Sign out"
          >
            ⎋
          </button>
        </div>
      </div>
    </aside>
  );
}