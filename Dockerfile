FROM node:18-slim

# Install Python + pip for ChromaDB
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install ChromaDB
RUN pip3 install chromadb --break-system-packages

WORKDIR /app

# Install server dependencies
COPY server/package*.json ./server/
RUN cd server && npm install

# Install ai-service dependencies
COPY ai-service/package*.json ./ai-service/
RUN cd ai-service && npm install

# Copy source code
COPY server/ ./server/
COPY ai-service/ ./ai-service/

# Create required folders
RUN mkdir -p uploads chroma-data

EXPOSE 5000

COPY start.sh ./start.sh
RUN chmod +x ./start.sh

CMD ["./start.sh"]