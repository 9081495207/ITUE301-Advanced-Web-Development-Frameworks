# Stage 1: Build React Vite Application
FROM node:18-alpine AS build

WORKDIR /app

# Copy package requirements
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code and build production distribution bundle
COPY . .
RUN npm run build

# Stage 2: Serve using Lightweight Nginx Web Server
FROM nginx:alpine

# Copy built production assets from Stage 1 to Nginx default html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration for SPA routing & API reverse proxying
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

# Start Nginx in foreground mode
CMD ["nginx", "-g", "daemon off;"]
