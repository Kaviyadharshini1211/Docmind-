#!/bin/bash

echo "=== Checking ChromaDB installation ==="
which chroma || echo "chroma not found in PATH"
chroma --version || echo "chroma version check failed"

echo "=== Starting ChromaDB ==="
chroma run --path /server/chroma-data --host 0.0.0.0 --port 8000 2>&1 &
CHROMA_PID=$!

echo "=== Waiting for ChromaDB ==="
until curl -s http://localhost:8000/api/v1/heartbeat > /dev/null; do
  echo "Waiting..."
  sleep 2
done

echo "=== ChromaDB ready ==="

node index.js