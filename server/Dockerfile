FROM node:18-slim

# Install Python, pip, curl, procps
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    curl \
    procps \
    && rm -rf /var/lib/apt/lists/*

# Install ChromaDB and verify it installed correctly
RUN pip3 install "chromadb==0.4.24" --break-system-packages
RUN pip3 show chromadb
RUN which chroma && chroma --version

WORKDIR /app

# Install server dependencies
COPY package*.json ./
RUN npm install

# Install ai-service dependencies
COPY ai-service/package*.json ./ai-service/
RUN cd ai-service && npm install

# Copy all source
COPY . .

# Create folders
RUN mkdir -p /app/chroma-data /app/uploads

RUN chmod +x ./start.sh

EXPOSE 5000

CMD ["./start.sh"]
