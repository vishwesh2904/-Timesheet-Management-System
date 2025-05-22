const Task = require('../models/Task');

// Assign a task (Manager only)
exports.assignTask = async (req, res) => {
  try {
    const { description, estimatedHours, date, assignedTo } = req.body;
    if (!description || !estimatedHours || !date || !assignedTo) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    // Only managers can assign tasks
    if (req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Access denied.' });
    }
    const task = new Task({
      description,
      estimatedHours,
      date,
      assignedTo,
      createdBy: req.user.userId,
    });
    await task.save();
    res.status(201).json({ message: 'Task assigned successfully.', task });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get all tasks for a manager (all assigned tasks)
exports.getAllTasks = async (req, res) => {
  try {
    if (req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Access denied.' });
    }
    const tasks = await Task.find().populate('assignedTo');
    res.json({ tasks });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get tasks for an associate (only their tasks)
exports.getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user.userId });
    res.json({ tasks });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};
