// src/components/Layout.js
import React from "react";
import Sidebar from "./Sidebar";
import "./Layout.css";

export default function Layout({ children, fileCount, historyCount }) {
  return (
    <div className="layout">
      <Sidebar fileCount={fileCount} historyCount={historyCount} />
      <main className="layout-main">{children}</main>
    </div>
  );
}