// src/pages/ChatPage.js
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import { api } from "../services/api";
import "./ChatPage.css";

const SUGGESTIONS = [
  "Summarize the main topics of the document",
  "What are the key concepts explained?",
  "List the most important points",
  "Explain the introduction in simple terms",
];

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit",
  });
}

export default function ChatPage({ files, history, onAddEntry, historyCount }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();
  const bottomRef = useRef();
  const textareaRef = useRef();

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Auto-resize textarea
  const handleInputChange = (e) => {
    setInput(e.target.value);
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 140) + "px";
    }
  };

  const sendMessage = async (question) => {
    const q = (question || input).trim();
    if (!q || loading) return;

    setInput("");
    setError("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    const userMsg = {
      id: Date.now(),
      role: "user",
      content: q,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const data = await api.ask(q);
      const assistantMsg = {
        id: Date.now() + 1,
        role: "assistant",
        content: data.answer,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      onAddEntry(q, data.answer);
    } catch (err) {
      setError(err.message);
      // Remove the user message if failed
      setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <Layout fileCount={files.length} historyCount={historyCount}>
      <div className="chat-layout">
        {/* Header */}
        <div className="page-header" style={{ borderBottom: "1px solid var(--border)", paddingBottom: 20 }}>
          <h1 className="page-title">Ask AI</h1>
          <p className="page-subtitle">
            Ask questions about your uploaded documents
            {files.length > 0 && (
              <span style={{ color: "var(--accent)", marginLeft: 8 }}>
                · {files.length} document{files.length > 1 ? "s" : ""} indexed
              </span>
            )}
          </p>
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="chat-welcome">
              <div className="chat-welcome-icon">🧠</div>
              <h2 className="chat-welcome-title">What do you want to learn?</h2>
              <p className="chat-welcome-sub">
                Ask anything about your uploaded PDFs. The AI will search your
                documents and generate a precise answer.
              </p>
              <div className="chat-suggestions">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    className="suggestion-chip"
                    onClick={() => sendMessage(s)}
                    disabled={loading}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`message ${msg.role}`}
              >
                <div className="message-avatar">
                  {msg.role === "user" ? initials : "🤖"}
                </div>
                <div>
                  <div className="message-bubble">{msg.content}</div>
                  <div className="message-time">{formatTime(msg.timestamp)}</div>
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="message assistant">
              <div className="message-avatar">🤖</div>
              <div className="typing-indicator">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="chat-input-area">
          {files.length === 0 && (
            <div className="no-doc-banner">
              ⚠ No documents indexed yet.{" "}
              <a onClick={() => navigate("/upload")}>Upload a PDF</a>
              {" "}first for best results.
            </div>
          )}

          {error && <div className="chat-error">⚠ {error}</div>}

          <div className="chat-input-wrap">
            <textarea
              ref={textareaRef}
              className="chat-input"
              placeholder="Ask a question about your documents… (Enter to send, Shift+Enter for newline)"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={loading}
            />
            <button
              className="send-btn"
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              title="Send message"
            >
              ↑
            </button>
          </div>
          <div className="chat-hint">
            Powered by Groq · llama-3.3-70b-versatile · ChromaDB RAG
          </div>
        </div>
      </div>
    </Layout>
  );
}