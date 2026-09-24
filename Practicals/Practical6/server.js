const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const { connectDB } = require('./src/config/db');

// Custom Middleware
const requestLogger = require('./src/middleware/logger');
const validateContentType = require('./src/middleware/contentTypeValidator');
const notFoundHandler = require('./src/middleware/notFoundHandler');
const globalErrorHandler = require('./src/middleware/errorHandler');

// Task Router
const taskRoutes = require('./src/routes/taskRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Configure CORS middleware for full-stack React frontend integration
app.use(cors());

// 2. Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// 3. Logger & Content-Type validator
app.use(requestLogger);
app.use(validateContentType);

// 4. JSON body parser
app.use(express.json());

// 5. Task REST API Router
app.use('/tasks', taskRoutes);

// 6. 404 handler
app.use(notFoundHandler);

// 7. Global Mongoose error handler
app.use(globalErrorHandler);

if (require.main === module) {
  const startServer = async (portToUse) => {
    try {
      await connectDB();

      const serverInstance = app.listen(portToUse, () => {
        console.log(`Server running on port ${portToUse}.`);
        console.log(`===================================================`);
        console.log(`🚀 Practical 6: Full Stack Task API running on port ${portToUse}`);
        console.log(`🌐 Base API Endpoint: http://localhost:${portToUse}/tasks`);
        console.log(`===================================================`);
      });

      serverInstance.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.warn(`[WARN] Port ${portToUse} in use, trying ${portToUse + 1}...`);
          startServer(portToUse + 1);
        } else {
          console.error("Server error:", err);
        }
      });
    } catch (err) {
      console.error("Failed to start server:", err);
      process.exit(1);
    }
  };

  startServer(PORT);
}

module.exports = app;
