const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Get all associates (Manager only)
router.get('/associates', authMiddleware, roleMiddleware('manager'), userController.getAllAssociates);

module.exports = router;
