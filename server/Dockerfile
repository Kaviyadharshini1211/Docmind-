FROM node:18-slim

# Install Python, pip, curl
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install ChromaDB — pin version for stability
RUN pip3 install "chromadb==0.4.24" --break-system-packages

WORKDIR /app

# Install server dependencies
COPY server/package*.json ./server/
RUN cd server && npm install

# Install ai-service dependencies
COPY server/ai-service/package*.json ./server/ai-service/
RUN cd server/ai-service && npm install

# Copy all source
COPY server/ ./server/

# Create required folders
RUN mkdir -p /app/chroma-data /app/uploads

# Copy and permission start script
COPY start.sh ./start.sh
RUN chmod +x ./start.sh

EXPOSE 5000

CMD ["./start.sh"]