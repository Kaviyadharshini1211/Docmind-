FROM node:18-slim

# Install Python + pip for ChromaDB
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    curl \
    && rm -rf /var/lib/apt/lists/*

RUN pip3 install chromadb --break-system-packages

WORKDIR /app

# Install server dependencies
COPY package*.json ./
RUN npm install

# Install ai-service dependencies
COPY ai-service/package*.json ./ai-service/
RUN cd ai-service && npm install

# Copy all source code
COPY . .

# Create required folders
RUN mkdir -p uploads chroma-data

EXPOSE 5000

RUN chmod +x ./start.sh

CMD ["./start.sh"]