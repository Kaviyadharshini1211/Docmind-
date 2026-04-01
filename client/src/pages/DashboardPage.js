// src/pages/DashboardPage.js
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import "./DashboardPage.css";

function formatBytes(bytes) {
  if (!bytes) return "—";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function DashboardPage({ files, history }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const recentFiles = files.slice(0, 5);
  const recentHistory = history.slice(0, 4);
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <Layout fileCount={files.length} historyCount={history.length}>
      <div className="page-header">
        <h1 className="page-title">
          {greeting}, {user?.name?.split(" ")[0] || "Scholar"} 👋
        </h1>
        <p className="page-subtitle">Here's what's happening in your study session</p>
      </div>

      <div className="page-content">
        {/* Stats */}
        <div className="dashboard-stats">
          <div className="stat-card">
            <span className="stat-icon">📄</span>
            <div className="stat-value stat-accent">{files.length}</div>
            <div className="stat-label">Documents</div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">💬</span>
            <div className="stat-value stat-accent">{history.length}</div>
            <div className="stat-label">Questions Asked</div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🧠</span>
            <div className="stat-value stat-accent">
              {files.length > 0 ? "Active" : "Idle"}
            </div>
            <div className="stat-label">AI Status</div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">⚡</span>
            <div className="stat-value stat-accent">Groq</div>
            <div className="stat-label">LLM Engine</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="section-title">Quick Actions</div>
        <div className="quick-actions-grid">
          <button className="quick-action-card" onClick={() => navigate("/upload")}>
            <span className="qa-icon">📤</span>
            <div className="qa-title">Upload a Document</div>
            <div className="qa-desc">Add a PDF to your knowledge base</div>
          </button>
          <button className="quick-action-card" onClick={() => navigate("/chat")}>
            <span className="qa-icon">💬</span>
            <div className="qa-title">Ask a Question</div>
            <div className="qa-desc">Query your uploaded documents with AI</div>
          </button>
          <button className="quick-action-card" onClick={() => navigate("/history")}>
            <span className="qa-icon">◷</span>
            <div className="qa-title">View History</div>
            <div className="qa-desc">Browse your past questions & answers</div>
          </button>
        </div>

        <div className="dashboard-grid">
          {/* Recent Files */}
          <div>
            <div className="section-title">Recent Documents</div>
            {recentFiles.length === 0 ? (
              <div className="empty-state">
                <span className="empty-state-icon">📭</span>
                No documents yet. Upload a PDF to get started.
              </div>
            ) : (
              <div className="files-list">
                {recentFiles.map((f) => (
                  <div className="file-row" key={f.id}>
                    <span className="file-icon">📄</span>
                    <div className="file-info">
                      <div className="file-name">{f.name}</div>
                      <div className="file-meta">
                        {formatBytes(f.size)} · {timeAgo(f.uploadedAt)}
                      </div>
                    </div>
                    <span className="file-badge">indexed</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent History */}
          <div>
            <div className="section-title">Recent Questions</div>
            {recentHistory.length === 0 ? (
              <div className="empty-state">
                <span className="empty-state-icon">💭</span>
                No questions asked yet. Start chatting!
              </div>
            ) : (
              <div className="files-list">
                {recentHistory.map((h) => (
                  <div
                    className="file-row"
                    key={h.id}
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate("/history")}
                  >
                    <span className="file-icon">💬</span>
                    <div className="file-info">
                      <div className="file-name">{h.question}</div>
                      <div className="file-meta">{timeAgo(h.timestamp)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}