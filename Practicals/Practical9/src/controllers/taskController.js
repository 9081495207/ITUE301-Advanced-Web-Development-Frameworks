const Task = require('../../models/Task');
const mongoose = require('mongoose');
const {
  cache,
  getFromCache,
  setToCache,
  deleteFromCache,
  flushCache,
  getCacheMetrics,
  resetCacheMetrics
} = require('../config/cache');

/**
 * Helper to generate cache keys
 */
const getCacheKey = (type, userId, id = '') => {
  if (type === 'ALL') {
    return `all_tasks_${userId}`;
  }
  if (type === 'SINGLE') {
    return `task_${userId}_${id}`;
  }
  return `key_${type}_${id}`;
};

/**
 * @route   GET /tasks
 * @desc    Fetch all tasks for authenticated user with in-memory caching (node-cache)
 * @access  Private (JWT Protected)
 */
const getTasks = async (req, res, next) => {
  try {
    const userId = req.user._id;
    // Keys to check: user-scoped key and fallback step-3 key 'all_tasks'
    const cacheKey = getCacheKey('ALL', userId);
    const bypassCache = req.query.bypassCache === 'true' || req.query.nocache === 'true';

    // Step 3: Check cache first unless explicitly bypassed
    if (!bypassCache) {
      const cachedTasks = getFromCache(cacheKey) || getFromCache('all_tasks');
      if (cachedTasks) {
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('X-Cache-Key', cacheKey);
        return res.status(200).json({
          status: 200,
          cached: true,
          source: 'node-cache',
          count: cachedTasks.length,
          data: cachedTasks
        });
      }
    }

    // Cache Miss or Bypass -> Query Database
    const tasks = await Task.find({ user: userId }).sort({ createdAt: -1 });

    // Store in node-cache with TTL of 60 seconds (Step 2 & 3)
    setToCache(cacheKey, tasks, 60);
    setToCache('all_tasks', tasks, 60); // Step 3 explicit compliance

    res.setHeader('X-Cache', bypassCache ? 'BYPASS' : 'MISS');
    res.setHeader('X-Cache-Key', cacheKey);
    res.status(200).json({
      status: 200,
      cached: false,
      source: 'mongodb',
      count: tasks.length,
      data: tasks
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /tasks/:id
 * @desc    Fetch single task by ID with in-memory caching (Supplementary Problem)
 * @access  Private (JWT Protected)
 */
const getTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 400,
        error: 'Bad Request',
        message: `Invalid ObjectId format: '${id}'`
      });
    }

    const userId = req.user._id;
    const cacheKey = getCacheKey('SINGLE', userId, id);
    const bypassCache = req.query.bypassCache === 'true' || req.query.nocache === 'true';

    if (!bypassCache) {
      const cachedTask = getFromCache(cacheKey);
      if (cachedTask) {
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('X-Cache-Key', cacheKey);
        return res.status(200).json({
          status: 200,
          cached: true,
          source: 'node-cache',
          data: cachedTask
        });
      }
    }

    const task = await Task.findOne({ _id: id, user: userId });
    if (!task) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: `Task not found with ID '${id}'`
      });
    }

    // Cache single task for 60s
    setToCache(cacheKey, task, 60);

    res.setHeader('X-Cache', bypassCache ? 'BYPASS' : 'MISS');
    res.setHeader('X-Cache-Key', cacheKey);
    res.status(200).json({
      status: 200,
      cached: false,
      source: 'mongodb',
      data: task
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /tasks
 * @desc    Create new task & invalidate all cached task entries (Step 4)
 * @access  Private (JWT Protected)
 */
const createTask = async (req, res, next) => {
  try {
    const { title, description, completed, priority } = req.body;

    const task = await Task.create({
      user: req.user._id,
      title: title.trim(),
      description: description ? description.trim() : '',
      completed: Boolean(completed),
      priority: priority ? priority.toLowerCase() : 'medium'
    });

    // Step 4: Invalidate cache after write operation
    const userCacheKey = getCacheKey('ALL', req.user._id);
    deleteFromCache([userCacheKey, 'all_tasks']);

    res.status(201).json({
      status: 201,
      message: 'Task created successfully. Cache invalidated.',
      cacheInvalidated: true,
      data: task
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PUT /tasks/:id
 * @desc    Update existing task & invalidate single task + all tasks cache entries (Step 4)
 * @access  Private (JWT Protected)
 */
const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 400,
        error: 'Bad Request',
        message: `Invalid ObjectId format: '${id}'`
      });
    }

    const userId = req.user._id;
    const task = await Task.findOne({ _id: id, user: userId });
    if (!task) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: `Task not found with ID '${id}'`
      });
    }

    const { title, description, completed, priority } = req.body;
    if (title !== undefined) task.title = title.trim();
    if (description !== undefined) task.description = description.trim();
    if (completed !== undefined) task.completed = Boolean(completed);
    if (priority !== undefined) task.priority = priority.toLowerCase();

    const updatedTask = await task.save();

    // Step 4: Invalidate cache after write operation
    const allCacheKey = getCacheKey('ALL', userId);
    const singleCacheKey = getCacheKey('SINGLE', userId, id);
    deleteFromCache([allCacheKey, singleCacheKey, 'all_tasks']);

    res.status(200).json({
      status: 200,
      message: 'Task updated successfully. Cache invalidated.',
      cacheInvalidated: true,
      data: updatedTask
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   DELETE /tasks/:id
 * @desc    Delete task & invalidate cache entries (Step 4)
 * @access  Private (JWT Protected)
 */
const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 400,
        error: 'Bad Request',
        message: `Invalid ObjectId format: '${id}'`
      });
    }

    const userId = req.user._id;
    const task = await Task.findOneAndDelete({ _id: id, user: userId });
    if (!task) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: `Task not found with ID '${id}'`
      });
    }

    // Step 4: Invalidate cache after write operation
    const allCacheKey = getCacheKey('ALL', userId);
    const singleCacheKey = getCacheKey('SINGLE', userId, id);
    deleteFromCache([allCacheKey, singleCacheKey, 'all_tasks']);

    res.status(200).json({
      status: 200,
      message: 'Task deleted successfully. Cache invalidated.',
      cacheInvalidated: true,
      data: task
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /tasks/cache/stats
 * @desc    Debug endpoint exposing cache-hit/cache-miss statistics (Supplementary Problem)
 * @access  Private / Public
 */
const getCacheStats = (req, res) => {
  const stats = getCacheMetrics();
  res.status(200).json({
    status: 200,
    message: 'Cache Metrics and Statistics',
    cache: stats
  });
};

/**
 * @route   DELETE /tasks/cache/flush
 * @desc    Debug endpoint to clear all in-memory cache entries and reset stats
 * @access  Private / Public
 */
const clearCache = (req, res) => {
  flushCache();
  resetCacheMetrics();
  res.status(200).json({
    status: 200,
    message: 'Cache successfully flushed and metrics reset.'
  });
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getCacheStats,
  clearCache
};
