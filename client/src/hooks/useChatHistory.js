// src/hooks/useChatHistory.js
import { useState, useEffect } from "react";

const STORAGE_KEY = "study_chat_history";

export function useChatHistory() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setHistory(JSON.parse(saved));
    } catch (_) {}
  }, []);

  const addEntry = (question, answer) => {
    const entry = {
      id: Date.now(),
      question,
      answer,
      timestamp: new Date().toISOString(),
    };
    setHistory((prev) => {
      const updated = [entry, ...prev].slice(0, 100); // keep last 100
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
    return entry;
  };

  const clearHistory = () => {
    localStorage.removeItem(STORAGE_KEY);
    setHistory([]);
  };

  return { history, addEntry, clearHistory };
}