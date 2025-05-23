const Timesheet = require('../models/Timesheet');

// Create or update timesheet entry (Associate only, draft mode)
exports.saveTimesheet = async (req, res) => {
  try {
    const { weekStart, entries } = req.body;
    if (!weekStart || !entries || !Array.isArray(entries)) {
      return res.status(400).json({ message: 'weekStart and entries are required.' });
    }
    let timesheet = await Timesheet.findOne({ userId: req.user.userId, weekStart });
    if (timesheet && timesheet.status === 'submitted') {
      return res.status(400).json({ message: 'Timesheet already submitted and cannot be edited.' });
    }
    if (!timesheet) {
      timesheet = new Timesheet({ userId: req.user.userId, weekStart, entries, status: 'draft' });
    } else {
      timesheet.entries = entries;
    }
    await timesheet.save();
    res.status(200).json({ message: 'Timesheet saved as draft.', timesheet });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Submit timesheet (Associate only)
exports.submitTimesheet = async (req, res) => {
  try {
    const { weekStart } = req.body;
    let timesheet = await Timesheet.findOne({ userId: req.user.userId, weekStart });
    if (!timesheet) {
      return res.status(404).json({ message: 'Timesheet not found.' });
    }
    if (timesheet.status === 'submitted') {
      return res.status(400).json({ message: 'Timesheet already submitted.' });
    }
    timesheet.status = 'submitted';
    await timesheet.save();
    res.status(200).json({ message: 'Timesheet submitted successfully.', timesheet });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get my timesheets (Associate)
exports.getMyTimesheets = async (req, res) => {
  try {
    const timesheets = await Timesheet.find({ userId: req.user.userId });
    res.json({ timesheets });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get all timesheets (Manager)
exports.getAllTimesheets = async (req, res) => {
  try {
    const timesheets = await Timesheet.find()
      .populate('userId') // Populate userId
      .populate({
        path: 'entries.taskId', // Populate taskId inside each entry
      });

    res.json({ timesheets });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};
