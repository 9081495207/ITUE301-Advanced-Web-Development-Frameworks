const Task = require('../../models/Task');
const mongoose = require('mongoose');

/**
 * @route   GET /tasks
 * @desc    Fetch tasks for authenticated user
 * @access  Private (JWT Protected)
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
 * @desc    Fetch task by ID for authenticated user
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

    const task = await Task.findOne({ _id: id, user: req.user._id });
    if (!task) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: `Task not found with ID '${id}'`
      });
    }

    res.status(200).json({ status: 200, data: task });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /tasks
 * @desc    Create new task for authenticated user
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

    res.status(201).json({
      status: 201,
      message: 'Task created successfully.',
      data: task
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PUT /tasks/:id
 * @desc    Update task for authenticated user
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
      message: 'Task updated successfully.',
      data: updatedTask
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   DELETE /tasks/:id
 * @desc    Delete task for authenticated user
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

    const task = await Task.findOneAndDelete({ _id: id, user: req.user._id });
    if (!task) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: `Task not found with ID '${id}'`
      });
    }

    res.status(200).json({
      status: 200,
      message: 'Task deleted successfully.',
      data: task
    });
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
