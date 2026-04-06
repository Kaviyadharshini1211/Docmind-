FROM node:18-slim

WORKDIR /app

# Install server dependencies
COPY package*.json ./
RUN npm install

# Install ai-service dependencies
COPY ai-service/package*.json ./ai-service/
RUN cd ai-service && npm install

# Copy all source code
COPY . .

# Create uploads folder
RUN mkdir -p /app/uploads

EXPOSE 5000

CMD ["node", "index.js"]
