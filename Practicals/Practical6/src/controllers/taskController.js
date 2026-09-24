const Task = require('../../models/Task');

const getAllTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.status(200).json({
      status: 200,
      count: tasks.length,
      data: tasks
    });
  } catch (err) {
    next(err);
  }
};

const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.taskId);
    if (!task) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: `Task with ID ${req.taskId} not found in database.`
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

const createTask = async (req, res, next) => {
  try {
    const { title, description, completed, priority } = req.body || {};

    const newTask = await Task.create({
      title,
      description,
      completed,
      priority
    });

    res.status(201).json({
      status: 201,
      message: 'Task created successfully.',
      data: newTask
    });
  } catch (err) {
    next(err);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const { title, description, completed, priority } = req.body || {};

    const updateFields = {};
    if (title !== undefined) updateFields.title = typeof title === 'string' ? title.trim() : title;
    if (description !== undefined) updateFields.description = description;
    if (completed !== undefined) updateFields.completed = completed;
    if (priority !== undefined) updateFields.priority = priority;

    const updatedTask = await Task.findByIdAndUpdate(
      req.taskId,
      updateFields,
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: `Task with ID ${req.taskId} not found in database.`
      });
    }

    res.status(200).json({
      status: 200,
      message: 'Task updated successfully.',
      data: updatedTask
    });
  } catch (err) {
    next(err);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.taskId);

    if (!deletedTask) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: `Task with ID ${req.taskId} not found in database.`
      });
    }

    res.status(200).json({
      status: 200,
      message: `Task with ID ${req.taskId} deleted successfully.`,
      data: deletedTask
    });
  } catch (err) {
    next(err);
  }
};

const triggerServerError = (req, res, next) => {
  try {
    throw new Error('Simulated unhandled internal server error for testing.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  triggerServerError
};
