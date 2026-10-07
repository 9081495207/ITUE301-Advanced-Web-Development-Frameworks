const Task = require('../../models/Task');
const mongoose = require('mongoose');
const taskEvents = require('../../events');

/**
 * @route   GET /tasks
 * @desc    Fetch all tasks for authenticated user
 * @access  Private
 */
const getTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({
      status: 200,
      count: tasks.length,
      data: tasks
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /tasks/:id
 * @desc    Fetch single task by ID
 * @access  Private
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

    const task = await Task.findOne({ _id: id, user: req.user._id });
    if (!task) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: `Task not found with ID '${id}'`
      });
    }

    res.status(200).json({
      status: 200,
      data: task
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /tasks
 * @desc    Create new task & emit 'task-created' event (Step 3 & Architecture Diagram)
 * @access  Private
 */
const createTask = async (req, res, next) => {
  try {
    const { title, description, completed, priority, delayMs } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({
        status: 400,
        error: 'Bad Request',
        message: 'Task title is required'
      });
    }

    // 1. Save task to MongoDB
    const task = await Task.create({
      user: req.user._id,
      title: title.trim(),
      description: description ? description.trim() : '',
      completed: Boolean(completed),
      priority: priority ? priority.toLowerCase() : 'medium'
    });

    const apiTimestamp = new Date().toISOString();
    console.log(`[API] Response sent at ${apiTimestamp}`);

    // Attach optional delayMs to task object passed to listener for demonstration testing
    const taskEventData = task.toObject();
    if (delayMs !== undefined) taskEventData.delayMs = delayMs;

    // 2. Respond immediately to the client
    res.status(201).json({
      status: 201,
      message: 'Task created successfully',
      apiResponseTimestamp: apiTimestamp,
      data: task
    });

    // 3. Emit asynchronous event AFTER sending response (or right after save)
    taskEvents.emit('task-created', taskEventData);
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PUT /tasks/:id
 * @desc    Update task details
 * @access  Private
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

    const task = await Task.findOne({ _id: id, user: req.user._id });
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

    res.status(200).json({
      status: 200,
      message: 'Task updated successfully',
      data: updatedTask
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   DELETE /tasks/:id
 * @desc    Delete task & emit 'task-deleted' event (Supplementary Problem 1)
 * @access  Private
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

    const task = await Task.findOneAndDelete({ _id: id, user: req.user._id });
    if (!task) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: `Task not found with ID '${id}'`
      });
    }

    const apiTimestamp = new Date().toISOString();
    console.log(`[API] Delete response sent at ${apiTimestamp}`);

    res.status(200).json({
      status: 200,
      message: 'Task deleted successfully',
      apiResponseTimestamp: apiTimestamp,
      data: task
    });

    // Emit 'task-deleted' event for background handling (Supplementary Problem 1)
    taskEvents.emit('task-deleted', task.toObject());
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
};
