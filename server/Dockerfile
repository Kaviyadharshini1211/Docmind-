FROM node:18-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    curl \
    procps \
    && rm -rf /var/lib/apt/lists/*

# ✅ Fix: Install compatible numpy + chromadb
RUN pip3 install --no-cache-dir "numpy<2.0" "chromadb==0.4.24" --break-system-packages

# Optional check (safe)
RUN which chroma || echo "chroma not found"

WORKDIR /app

# Install backend dependencies
COPY package*.json ./
RUN npm install

# Install AI service dependencies
COPY ai-service/package*.json ./ai-service/
RUN cd ai-service && npm install

# Copy full project
COPY . .

# Create required directories
RUN mkdir -p /app/chroma-data /app/uploads

# Make start script executable
RUN chmod +x ./start.sh

EXPOSE 5000

CMD ["./start.sh"]