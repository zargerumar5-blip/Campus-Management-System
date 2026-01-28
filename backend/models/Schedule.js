const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
  day: { type: String, required: true }, // e.g., "Monday"
  startTime: { type: String, required: true }, // e.g., "10:00 AM"
  endTime: { type: String, required: true },   // e.g., "11:00 AM"
  subject: { type: String, required: true },
  batch: { type: String, required: true }, // e.g., "Batch A" or "Computer Science"
  room: { type: String, required: true },
  facultyName: { type: String, default: 'Faculty' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Schedule', ScheduleSchema);