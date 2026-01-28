const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  status: { type: String, enum: ['Present', 'Absent'], required: true },
  batch: { type: String }, 
  timestamp: { type: Date, default: Date.now }
});

// Removed 'subject' field from above

module.exports = mongoose.model('Attendance', AttendanceSchema);