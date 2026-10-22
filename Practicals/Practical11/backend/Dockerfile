# Dockerfile for Node/Express Backend (Practical 11)
FROM node:18-alpine

# Set working directory inside container
WORKDIR /app

# Copy package descriptors first to leverage layer caching
COPY package*.json ./

# Install production dependencies
RUN npm install --omit=dev

# Copy application source code
COPY . .

# Expose backend port
EXPOSE 5000

# Set environment variables default
ENV PORT=5000
ENV NODE_ENV=production

# Command to start backend server
CMD ["node", "server.js"]
