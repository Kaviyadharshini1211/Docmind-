FROM node:18-slim

WORKDIR /app

# Install server dependencies
COPY server/package*.json ./
RUN npm install

# Install ai-service dependencies
COPY server/ai-service/package*.json ./ai-service/
RUN cd ai-service && npm install

# Copy all source code
COPY server/ .

# Create uploads folder
RUN mkdir -p /app/uploads

EXPOSE 5000

CMD ["node", "index.js"]
