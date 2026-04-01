#!/bin/bash

echo "=== Checking ChromaDB installation ==="
which chroma || echo "chroma not found in PATH"
chroma --version || echo "chroma version check failed (safe to ignore)"

echo "=== Starting ChromaDB ==="
chroma run --path /app/chroma-data --host 0.0.0.0 --port 8000 2>&1 &
CHROMA_PID=$!

echo "=== ChromaDB PID: $CHROMA_PID ==="

# ✅ Wait until Chroma is actually ready (better than sleep)
echo "=== Waiting for ChromaDB to be ready ==="
until curl -s http://localhost:8000/api/v1/heartbeat > /dev/null; do
  echo "Waiting for ChromaDB..."
  sleep 2
done

echo "=== ChromaDB is ready ==="

# Check process still alive
if kill -0 $CHROMA_PID 2>/dev/null; then
  echo "=== ChromaDB process is running ==="
else
  echo "=== ERROR: ChromaDB process died ==="
  exit 1
fi

echo "=== Starting Express Server ==="
cd /app
node server/index.js