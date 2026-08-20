const express = require('express');
const path = require('path');

// Import Custom Middleware Pipeline Components
const requestLogger = require('./src/middleware/logger');
const validateContentType = require('./src/middleware/contentTypeValidator');
const notFoundHandler = require('./src/middleware/notFoundHandler');
const globalErrorHandler = require('./src/middleware/errorHandler');

// Import Task Router
const taskRoutes = require('./src/routes/taskRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Static file server for interactive visual API web client
app.use(express.static(path.join(__dirname, 'public')));

// 2. Global Request Logging Middleware
app.use(requestLogger);

// 3. Header Content-Type Validation Middleware (requires application/json on POST/PUT)
app.use(validateContentType);

// 4. Express Built-in JSON Body Parsing Middleware
app.use(express.json());

// 5. Mount Task REST API Router
app.use('/tasks', taskRoutes);

// 6. 404 Middleware Handler for Undefined Routes
app.use(notFoundHandler);

// 7. Global Error Handling Middleware (Must be registered last)
app.use(globalErrorHandler);

// Start Express Server
if (require.main === module) {
  const startServer = (portToUse) => {
    const serverInstance = app.listen(portToUse, () => {
      console.log(`===================================================`);
      console.log(`🚀 Task Manager API Server running on port ${portToUse}`);
      console.log(`🌐 Visual API Dashboard: http://localhost:${portToUse}`);
      console.log(`📡 Base API Endpoint:    http://localhost:${portToUse}/tasks`);
      console.log(`===================================================`);
    });

    serverInstance.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.warn(`[WARN] Port ${portToUse} is in use (e.g. macOS AirPlay/ControlCenter). Retrying on port ${portToUse + 1}...`);
        startServer(portToUse + 1);
      } else {
        console.error("Server error:", err);
      }
    });
  };

  startServer(PORT);
}

module.exports = app;
