const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const validateTaskId = require('../middleware/validateId');

router.get('/trigger-error', taskController.triggerServerError);
router.get('/', taskController.getAllTasks);
router.post('/', taskController.createTask);
router.get('/:id', validateTaskId, taskController.getTaskById);
router.put('/:id', validateTaskId, taskController.updateTask);
router.delete('/:id', validateTaskId, taskController.deleteTask);

module.exports = router;
