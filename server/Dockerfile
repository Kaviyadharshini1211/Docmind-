FROM node:18-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    curl \
    procps \
    && rm -rf /var/lib/apt/lists/*

# Fix numpy issue
RUN pip3 install --no-cache-dir "numpy<2.0" "chromadb==1.5.5" --break-system-packages

RUN which chroma || echo "chroma not found"

# Already inside server context
WORKDIR /server

# ✅ NO "server/" prefix here
COPY package*.json ./
RUN npm install

COPY ai-service/package*.json ./ai-service/
RUN cd ai-service && npm install
RUN cd ai-service && npm install @chroma-core/default-embed
RUN cd ai-service && npm install chromadb@latest

# Copy everything from server folder
COPY . .

RUN mkdir -p /server/chroma-data /server/uploads

RUN chmod +x ./start.sh

EXPOSE 5000

CMD ["./start.sh"]
