// src/hooks/useUploadedFiles.js
import { useState, useEffect } from "react";

const STORAGE_KEY = "study_uploaded_files";

export function useUploadedFiles() {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setFiles(JSON.parse(saved));
    } catch (_) {}
  }, []);

  const addFile = (fileInfo) => {
    const entry = {
      id: Date.now(),
      name: fileInfo.name,
      size: fileInfo.size,
      uploadedAt: new Date().toISOString(),
    };
    setFiles((prev) => {
      const updated = [entry, ...prev];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
    return entry;
  };

  const removeFile = (id) => {
    setFiles((prev) => {
      const updated = prev.filter((f) => f.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const clearFiles = () => {
    localStorage.removeItem(STORAGE_KEY);
    setFiles([]);
  };

  return { files, addFile, removeFile, clearFiles };
}