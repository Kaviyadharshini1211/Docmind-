// src/pages/UploadPage.js
import React, { useState, useRef } from "react";
import Layout from "../components/Layout";
import { api } from "../services/api";
import "./UploadPage.css";

function formatBytes(bytes) {
  if (!bytes) return "—";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

export default function UploadPage({ files, onAddFile, onRemoveFile, historyCount }) {
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState(null);
  const [status, setStatus] = useState(null); // { type, msg }
  const [uploading, setUploading] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);
  const inputRef = useRef();

  const handleFile = async (file) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      setStatus({ type: "error", msg: "Only PDF files are supported." });
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setStatus({ type: "error", msg: "File too large. Maximum size is 20MB." });
      return;
    }

    setCurrentFile(file.name);
    setUploading(true);
    setStatus({ type: "processing", msg: "Uploading and indexing your document…" });
    setProgress(0);

    try {
      const data = await api.uploadFile(file, setProgress);
      onAddFile({ name: file.name, size: file.size });
      setStatus({ type: "success", msg: `✓ "${file.name}" indexed successfully!` });
    } catch (err) {
      setStatus({ type: "error", msg: err.message });
    } finally {
      setUploading(false);
      setProgress(null);
      setCurrentFile(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  return (
    <Layout fileCount={files.length} historyCount={historyCount}>
      <div className="page-header">
        <h1 className="page-title">Upload Documents</h1>
        <p className="page-subtitle">Add PDFs to your personal knowledge base</p>
      </div>

      <div className="page-content">
        {/* Drop zone */}
        <div
          className={`upload-zone ${dragOver ? "drag-over" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => !uploading && inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf"
            style={{ display: "none" }}
            onChange={(e) => handleFile(e.target.files[0])}
          />
          <span className="upload-icon">📤</span>
          <div className="upload-title">
            {dragOver ? "Drop it here!" : "Drop your PDF here"}
          </div>
          <p className="upload-desc">
            Your document will be chunked, embedded, and stored in your personal vector database
          </p>
          <button className="upload-btn" disabled={uploading}>
            {uploading ? "Processing…" : "Browse Files"}
          </button>
          <div className="upload-hint">PDF only · Max 20MB</div>
        </div>

        {/* Progress */}
        {uploading && progress !== null && (
          <div className="upload-progress-card">
            <div className="upload-file-name">📄 {currentFile}</div>
            <div className="progress-bar-wrap">
              <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="progress-text">
              <span>Uploading…</span>
              <span>{progress}%</span>
            </div>
          </div>
        )}

        {/* Status */}
        {status && (
          <div className={`upload-status ${status.type}`}>
            {status.type === "processing" && (
              <span style={{ display: "inline-block", animation: "spin 0.7s linear infinite" }}>⟳</span>
            )}
            {status.msg}
          </div>
        )}

        {/* Files list */}
        <div className="section-title" style={{ marginBottom: 12 }}>
          Your Documents ({files.length})
        </div>

        {files.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">📭</span>
            No documents uploaded yet. Drop a PDF above to get started.
          </div>
        ) : (
          <div className="files-table">
            <div className="files-table-header">
              <span>Name</span>
              <span>Size</span>
              <span>Uploaded</span>
              <span></span>
            </div>
            {files.map((f, i) => (
              <div
                className="files-table-row"
                key={f.id}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="file-row-name">
                  <span>📄</span>
                  <span>{f.name}</span>
                </div>
                <span className="file-row-size">{formatBytes(f.size)}</span>
                <span className="file-row-date">{formatDate(f.uploadedAt)}</span>
                <button
                  className="delete-btn"
                  onClick={() => onRemoveFile(f.id)}
                  title="Remove from list"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}