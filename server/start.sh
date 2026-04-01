#!/bin/bash

echo "Starting ChromaDB..."
chroma run --path /app/chroma-data --host 0.0.0.0 --port 8000 &

echo "Waiting for ChromaDB..."
for i in $(seq 1 30); do
  if curl -s http://localhost:8000/api/v1/heartbeat > /dev/null 2>&1; then
    echo "ChromaDB ready!"
    break
  fi
  sleep 2
done

echo "Starting Express..."
node index.js