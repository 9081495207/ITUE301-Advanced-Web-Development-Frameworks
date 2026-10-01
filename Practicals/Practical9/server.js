const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const { connectDB } = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const taskRoutes = require('./src/routes/taskRoutes');

const app = express();
const PORT = process.env.PORT || 5002;

// 1. CORS Middleware
app.use(cors());

// 2. Request Logger with Response Time Tracking
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const cacheHeader = res.getHeader('X-Cache') || 'N/A';
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms [Cache: ${cacheHeader}]`);
  });
  next();
});

// 3. Express JSON Body Parser
app.use(express.json());

// 4. Mount API Routes
app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);

// 5. Root Endpoint & Health Check
app.get('/', (req, res) => {
  res.status(200).json({
    status: 200,
    message: 'Practical 9: In-Memory Caching & Query Optimization API',
    endpoints: {
      auth: ['POST /auth/register', 'POST /auth/login', 'GET /auth/me'],
      tasks: ['GET /tasks', 'POST /tasks', 'GET /tasks/:id', 'PUT /tasks/:id', 'DELETE /tasks/:id'],
      cache: ['GET /tasks/cache/stats', 'DELETE /tasks/cache/flush']
    }
  });
});

// 6. 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    status: 404,
    error: 'Not Found',
    message: `The requested endpoint '${req.originalUrl}' does not exist on this server.`
  });
});

// 7. Global Mongoose & Express Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Global Error Handler caught:", err);

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: statusCode,
    error: err.name || 'Internal Server Error',
    message: err.message || 'An unexpected error occurred on the server.'
  });
});

if (require.main === module) {
  const startServer = async () => {
    try {
      await connectDB();

      const listenOnPort = (portToUse) => {
        const serverInstance = app.listen(portToUse, () => {
          console.log(`===================================================`);
          console.log(`🚀 Practical 9: In-Memory Caching API on port ${portToUse}`);
          console.log(`🔑 Auth Endpoint: http://localhost:${portToUse}/auth`);
          console.log(`⚡ Task & Cache API: http://localhost:${portToUse}/tasks`);
          console.log(`📊 Cache Stats: http://localhost:${portToUse}/tasks/cache/stats`);
          console.log(`===================================================`);
        });

        serverInstance.on('error', (err) => {
          if (err.code === 'EADDRINUSE') {
            console.warn(`[WARN] Port ${portToUse} in use, trying ${portToUse + 1}...`);
            listenOnPort(portToUse + 1);
          } else {
            console.error("Server error:", err);
          }
        });
      };

      listenOnPort(PORT);
    } catch (err) {
      console.error("Failed to start server:", err);
      process.exit(1);
    }
  };

  startServer();
}

module.exports = app;
