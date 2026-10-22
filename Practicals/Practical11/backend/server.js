const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { connectDB } = require('./src/config/db');
const { initTaskListeners } = require('./src/events/taskListeners');
const authRoutes = require('./src/routes/authRoutes');
const taskRoutes = require('./src/routes/taskRoutes');
const aiRoutes = require('./src/routes/aiRoutes');   // Practical 13: AI Integration

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Event-Driven Architecture Listeners
initTaskListeners();

// 1. CORS Middleware
app.use(cors());

// 2. Request Logger with Duration Tracking
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// 3. Express JSON Body Parser
app.use(express.json());

// 4. Mount API Routes
app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);
app.use('/api/ai', aiRoutes);  // Practical 13: AI endpoint (key is server-side only)

// 5. Root Endpoint & Practical Summary
app.get('/', (req, res) => {
  res.status(200).json({
    status: 200,
    message: 'Practical 11: Containerized Full-Stack Task Management API',
    container: 'Docker & Docker Compose Stack',
    database: process.env.MONGO_URI || 'In-Memory Fallback',
    endpoints: {
      auth: ['POST /auth/register', 'POST /auth/login', 'GET /auth/me'],
      tasks: ['GET /tasks', 'POST /tasks', 'GET /tasks/:id', 'PUT /tasks/:id', 'DELETE /tasks/:id']
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

// 7. Global Error Handler
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

      app.listen(PORT, () => {
        console.log(`========================================================================`);
        console.log(`🚀 Practical 11: Containerized API running on port ${PORT}`);
        console.log(`🔑 Auth Endpoint: http://localhost:${PORT}/auth`);
        console.log(`⚡ Task API Endpoint: http://localhost:${PORT}/tasks`);
        console.log(`========================================================================`);
      });
    } catch (err) {
      console.error("Failed to start server:", err);
      process.exit(1);
    }
  };

  startServer();
}

module.exports = app;
