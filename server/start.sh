#!/bin/bash

echo "=== Starting ChromaDB ==="
chroma run --path /app/chroma-data --host 0.0.0.0 --port 8000 &
CHROMA_PID=$!

echo "=== Waiting for ChromaDB to be ready ==="
READY=0
for i in $(seq 1 60); do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/v1/heartbeat 2>/dev/null)
  if [ "$STATUS" = "200" ]; then
    echo "=== ChromaDB is ready after ${i} attempts ==="
    READY=1
    break
  fi
  echo "Attempt $i/60 — ChromaDB not ready yet (status: $STATUS)..."
  sleep 3
done

if [ "$READY" = "0" ]; then
  echo "=== ERROR: ChromaDB failed to start after 60 attempts ==="
  echo "=== Checking ChromaDB process ==="
  ps aux | grep chroma
  exit 1
fi

echo "=== Starting Express Server ==="
cd /app/server
node index.js