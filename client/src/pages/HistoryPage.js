// src/pages/HistoryPage.js
import React, { useState } from "react";
import Layout from "../components/Layout";
import "./HistoryPage.css";

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function HistoryPage({ history, onClearHistory, files }) {
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch] = useState("");

  const filtered = history.filter((h) =>
    h.question.toLowerCase().includes(search.toLowerCase()) ||
    h.answer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout fileCount={files.length} historyCount={history.length}>
      <div className="page-header">
        <h1 className="page-title">Question History</h1>
        <p className="page-subtitle">All your past questions and AI answers</p>
      </div>

      <div className="page-content">
        <div className="history-controls">
          <input
            className="history-search"
            placeholder="Search questions & answers…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {history.length > 0 && (
            <button
              className="btn-danger"
              onClick={() => {
                if (window.confirm("Clear all history?")) onClearHistory();
              }}
            >
              ✕ Clear All
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">💭</span>
            No questions asked yet. Head to the Chat page to get started.
          </div>
        ) : filtered.length === 0 ? (
          <div className="no-results">No results for "{search}"</div>
        ) : (
          <div className="history-list">
            {filtered.map((entry, i) => (
              <div
                key={entry.id}
                className={`history-entry ${expanded === entry.id ? "expanded" : ""}`}
                style={{ animationDelay: `${i * 0.04}s` }}
                onClick={() =>
                  setExpanded(expanded === entry.id ? null : entry.id)
                }
              >
                <div className="history-entry-header">
                  <div className="history-q-icon">Q</div>
                  <div className="history-q-text">
                    <div className="history-question">{entry.question}</div>
                    <div className="history-meta">
                      {formatDate(entry.timestamp)} · {timeAgo(entry.timestamp)}
                    </div>
                  </div>
                  <span className="expand-icon">
                    {expanded === entry.id ? "▲" : "▼"}
                  </span>
                </div>

                {expanded === entry.id && (
                  <div className="history-answer">{entry.answer}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}