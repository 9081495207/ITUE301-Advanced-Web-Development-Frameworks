const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const validateTaskId = require('../middleware/validateId');

// Route to simulate 500 server error (registered before :id parameter route)
router.get('/trigger-error', taskController.triggerServerError);

// CRUD Routes
router.get('/', taskController.getAllTasks);
router.post('/', taskController.createTask);

// Routes requiring task ID validation
router.get('/:id', validateTaskId, taskController.getTaskById);
router.put('/:id', validateTaskId, taskController.updateTask);
router.delete('/:id', validateTaskId, taskController.deleteTask);

module.exports = router;
