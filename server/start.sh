#!/bin/bash

echo "=== Checking ChromaDB installation ==="
which chroma || echo "chroma not found in PATH"
chroma --version || echo "chroma version failed"

echo "=== Starting ChromaDB ==="
chroma run --path /app/chroma-data --host 0.0.0.0 --port 8000 2>&1 &
CHROMA_PID=$!

echo "=== ChromaDB PID: $CHROMA_PID ==="
echo "=== Waiting 30 seconds for ChromaDB to start ==="
sleep 30

echo "=== Checking if ChromaDB process is still running ==="
if kill -0 $CHROMA_PID 2>/dev/null; then
  echo "=== ChromaDB process is running ==="
else
  echo "=== ERROR: ChromaDB process died ==="
  exit 1
fi

echo "=== Starting Express Server ==="
cd /app
node server/index.js