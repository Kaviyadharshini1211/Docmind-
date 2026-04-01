FROM node:18-slim

# Install Python, pip, curl for ChromaDB
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install ChromaDB
RUN pip3 install "chromadb==0.4.24" --break-system-packages

WORKDIR /app

# Install server dependencies
# (Dockerfile is inside server/, so . = server/)
COPY package*.json ./
RUN npm install

# Install ai-service dependencies
COPY ai-service/package*.json ./ai-service/
RUN cd ai-service && npm install

# Copy all server source code
# . here means everything in server/ (the build context)
COPY . .

# Create required folders
RUN mkdir -p /app/chroma-data /app/uploads

RUN chmod +x ./start.sh

EXPOSE 5000

CMD ["./start.sh"]