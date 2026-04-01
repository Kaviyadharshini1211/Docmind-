#!/bin/bash

# Start ChromaDB in background
echo "Starting ChromaDB..."
chroma run --path /app/chroma-data --host 0.0.0.0 --port 8000 &

# Wait until ChromaDB is ready
echo "Waiting for ChromaDB..."
for i in $(seq 1 30); do
  if curl -s http://localhost:8000/api/v1/heartbeat > /dev/null 2>&1; then
    echo "ChromaDB ready!"
    break
  fi
  sleep 2
done

# Start Express server
echo "Starting Express..."
cd /app/server
node index.js