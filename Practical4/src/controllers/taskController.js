const tasksStore = require('../data/tasksStore');

/**
 * Controller: GET /tasks
 * Retrieve all tasks
 */
const getAllTasks = (req, res) => {
  const tasks = tasksStore.getAll();
  res.status(200).json({
    status: 200,
    count: tasks.length,
    data: tasks
  });
};

/**
 * Controller: GET /tasks/:id
 * Retrieve single task by ID
 */
const getTaskById = (req, res) => {
  const task = tasksStore.getById(req.taskId);
  if (!task) {
    return res.status(404).json({
      status: 404,
      error: "Not Found",
      message: `Task with ID ${req.taskId} not found.`
    });
  }
  res.status(200).json({
    status: 200,
    data: task
  });
};

/**
 * Controller: POST /tasks
 * Create a new task
 */
const createTask = (req, res) => {
  const { title, description, completed } = req.body || {};

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({
      status: 400,
      error: "Bad Request",
      message: "Field 'title' is required and must be a non-empty string."
    });
  }

  const newTask = tasksStore.create({
    title: title.trim(),
    description,
    completed
  });

  res.status(201).json({
    status: 201,
    message: "Task created successfully.",
    data: newTask
  });
};

/**
 * Controller: PUT /tasks/:id
 * Update an existing task by ID
 */
const updateTask = (req, res) => {
  const existingTask = tasksStore.getById(req.taskId);
  if (!existingTask) {
    return res.status(404).json({
      status: 404,
      error: "Not Found",
      message: `Task with ID ${req.taskId} not found.`
    });
  }

  const { title, description, completed } = req.body || {};

  if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
    return res.status(400).json({
      status: 400,
      error: "Bad Request",
      message: "Field 'title', if provided, must be a non-empty string."
    });
  }

  const updatedTask = tasksStore.update(req.taskId, {
    title: title ? title.trim() : undefined,
    description,
    completed
  });

  res.status(200).json({
    status: 200,
    message: "Task updated successfully.",
    data: updatedTask
  });
};

/**
 * Controller: DELETE /tasks/:id
 * Delete a task by ID
 */
const deleteTask = (req, res) => {
  const existingTask = tasksStore.getById(req.taskId);
  if (!existingTask) {
    return res.status(404).json({
      status: 404,
      error: "Not Found",
      message: `Task with ID ${req.taskId} not found.`
    });
  }

  tasksStore.remove(req.taskId);

  res.status(200).json({
    status: 200,
    message: `Task with ID ${req.taskId} deleted successfully.`,
    data: existingTask
  });
};

/**
 * Controller: GET /tasks/error-test
 * Endpoint specifically designed to test global 500 error handler middleware
 */
const triggerServerError = (req, res, next) => {
  try {
    throw new Error("Simulated unhandled internal server error for testing global error middleware.");
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
