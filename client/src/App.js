// src/App.js
import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { useChatHistory } from "./hooks/useChatHistory";
import { useUploadedFiles } from "./hooks/useUploadedFiles";

import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import ChatPage from "./pages/ChatPage";
import UploadPage from "./pages/UploadPage";
import HistoryPage from "./pages/HistoryPage";

import "./styles/globals.css";

// Protects routes — redirects to login if not authenticated
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg-base)",
          color: "var(--text-muted)",
          fontFamily: "var(--font-mono)",
          fontSize: 13,
          gap: 10,
        }}
      >
        <span
          style={{
            display: "inline-block",
            width: 16,
            height: 16,
            border: "2px solid var(--accent)",
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "spin 0.7s linear infinite",
          }}
        />
        Loading…
      </div>
    );
  }

  return user ? children : <Navigate to="/" replace />;
}

// Inner app with shared state — must be inside AuthProvider
function AppRoutes() {
  const { history, addEntry, clearHistory } = useChatHistory();
  const { files, addFile, removeFile, clearFiles } = useUploadedFiles();

  const sharedProps = {
    files,
    history,
    historyCount: history.length,
  };

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<AuthPage />} />

      {/* Protected */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <DashboardPage {...sharedProps} />
          </PrivateRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <PrivateRoute>
            <ChatPage
              {...sharedProps}
              onAddEntry={addEntry}
            />
          </PrivateRoute>
        }
      />
      <Route
        path="/upload"
        element={
          <PrivateRoute>
            <UploadPage
              {...sharedProps}
              onAddFile={addFile}
              onRemoveFile={removeFile}
            />
          </PrivateRoute>
        }
      />
      <Route
        path="/history"
        element={
          <PrivateRoute>
            <HistoryPage
              {...sharedProps}
              onClearHistory={() => { clearHistory(); clearFiles(); }}
            />
          </PrivateRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}