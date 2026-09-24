const express = require('express');
const path = require('path');
require('dotenv').config();

const { connectDB } = require('./src/config/db');

// Import Custom Middleware Pipeline Components
const requestLogger = require('./src/middleware/logger');
const validateContentType = require('./src/middleware/contentTypeValidator');
const notFoundHandler = require('./src/middleware/notFoundHandler');
const globalErrorHandler = require('./src/middleware/errorHandler');

// Import Task Router
const taskRoutes = require('./src/routes/taskRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Serve Interactive Visual API Web Client
app.use(express.static(path.join(__dirname, 'public')));

// CORS Middleware for React frontend cross-origin access
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// 2. Global Request Logger Middleware
app.use(requestLogger);

// 3. Header Content-Type Validation Middleware for POST/PUT requests
app.use(validateContentType);

// 4. Express Built-in JSON Body Parsing Middleware
app.use(express.json());

// 5. Mount Task REST API Router with Mongoose Operations
app.use('/tasks', taskRoutes);

// 6. 404 Middleware Handler for Undefined Routes
app.use(notFoundHandler);

// 7. Global Mongoose Error Handling Middleware (Registered last)
app.use(globalErrorHandler);

// Connect to MongoDB and Start Server
if (require.main === module) {
  const startServer = async (portToUse) => {
    try {
      await connectDB();

      const serverInstance = app.listen(portToUse, () => {
        console.log(`Server running on port ${portToUse}.`);
        console.log(`===================================================`);
        console.log(`🚀 Practical 5: Task API (Mongoose & MongoDB) running on port ${portToUse}`);
        console.log(`🌐 Visual API Dashboard: http://localhost:${portToUse}`);
        console.log(`📡 Base API Endpoint:    http://localhost:${portToUse}/tasks`);
        console.log(`===================================================`);
      });

      serverInstance.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.warn(`[WARN] Port ${portToUse} is in use. Retrying on port ${portToUse + 1}...`);
          startServer(portToUse + 1);
        } else {
          console.error("Server error:", err);
        }
      });
    } catch (err) {
      console.error("Failed to start server due to database connection error:", err);
      process.exit(1);
    }
  };

  startServer(PORT);
}

module.exports = app;
