const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getCacheStats,
  clearCache
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const { validateTask } = require('../middleware/validationMiddleware');

// Debug endpoints for Cache Management (Exposed prior to parametric routes)
router.get('/cache/stats', protect, getCacheStats);
router.delete('/cache/flush', protect, clearCache);

// Protect ALL task CRUD routes with JWT Authentication Middleware
router.use(protect);

// Task Collection Endpoints
router.route('/')
  .get(getTasks)
  .post(validateTask, createTask);

// Task Instance Endpoints
router.route('/:id')
  .get(getTaskById)
  .put(validateTask, updateTask)
  .delete(deleteTask);

module.exports = router;
