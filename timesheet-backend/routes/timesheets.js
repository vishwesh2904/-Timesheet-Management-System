const express = require('express');
const router = express.Router();
const timesheetController = require('../controllers/timesheetController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Save timesheet as draft (Associate only)
router.post('/save', authMiddleware, roleMiddleware('associate'), timesheetController.saveTimesheet);

// Submit timesheet (Associate only)
router.post('/submit', authMiddleware, roleMiddleware('associate'), timesheetController.submitTimesheet);

// Get my timesheets (Associate)
router.get('/my', authMiddleware, roleMiddleware('associate'), timesheetController.getMyTimesheets);

// Get all timesheets (Manager)
router.get('/all', authMiddleware, roleMiddleware('manager'), timesheetController.getAllTimesheets);

module.exports = router;
