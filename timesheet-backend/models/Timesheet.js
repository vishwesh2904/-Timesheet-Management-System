const mongoose = require('mongoose');

const timesheetEntrySchema = new mongoose.Schema({
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  date: { type: Date, required: true },
  actualHours: { type: Number, required: true },
});

const timesheetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  weekStart: { type: Date, required: true },
  entries: [timesheetEntrySchema],
  status: { type: String, enum: ['draft', 'submitted'], default: 'draft' },
}, { timestamps: true });

module.exports = mongoose.model('Timesheet', timesheetSchema);
