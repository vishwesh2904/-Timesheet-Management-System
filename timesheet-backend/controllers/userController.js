const User = require('../models/User');

// Get all associates (Manager only)
exports.getAllAssociates = async (req, res) => {
  try {
    const associates = await User.find({ role: 'associate' }).select('-passwordHash');
    res.json({ associates });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};
