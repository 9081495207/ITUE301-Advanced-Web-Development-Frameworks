const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const { connectDB } = require('./src/config/db');

// Auth & Task Routers
const authRoutes = require('./src/routes/authRoutes');
const taskRoutes = require('./src/routes/taskRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

// 1. CORS Middleware for Full-Stack Integration
app.use(cors());

// 2. Static files
app.use(express.static(path.join(__dirname, 'public')));

// 3. Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - IP: ${req.ip}`);
  next();
});

// 4. Express Built-in JSON Body Parsing Middleware
app.use(express.json());

// 5. Mount Authentication & Protected Task REST API Routes
app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);

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
          console.log(`🚀 Practical 7: JWT Auth & Task API running on port ${portToUse}`);
          console.log(`🔑 Auth Endpoint: http://localhost:${portToUse}/auth`);
          console.log(`🔒 Task Endpoint: http://localhost:${portToUse}/tasks`);
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
