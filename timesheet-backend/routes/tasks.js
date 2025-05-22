const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Assign a task (Manager only)
router.post('/assign', authMiddleware, roleMiddleware('manager'), taskController.assignTask);

// Get all tasks (Manager only)
router.get('/all', authMiddleware, roleMiddleware('manager'), taskController.getAllTasks);

// Get my tasks (Associate)
router.get('/my', authMiddleware, roleMiddleware('associate'), taskController.getMyTasks);

module.exports = router;
