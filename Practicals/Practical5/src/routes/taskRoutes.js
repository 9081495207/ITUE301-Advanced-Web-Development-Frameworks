const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const validateTaskId = require('../middleware/validateId');

// Route to test internal server error handler (must precede :id route)
router.get('/trigger-error', taskController.triggerServerError);

// Collection routes
router.get('/', taskController.getAllTasks);
router.post('/', taskController.createTask);

// Individual resource routes with MongoDB ObjectId validation
router.get('/:id', validateTaskId, taskController.getTaskById);
router.put('/:id', validateTaskId, taskController.updateTask);
router.delete('/:id', validateTaskId, taskController.deleteTask);

module.exports = router;
