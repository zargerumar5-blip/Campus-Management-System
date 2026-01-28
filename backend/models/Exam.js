const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true, 
  },
  date: {
    type: Date,
    required: true,
  },
  subject: {
    type: String,
    required: true, 
  },
  batch: {
    type: String,
    required: true,
  },
  
  // --- UPDATED: TIME RANGE & ROOM ---
  startTime: {
    type: String,   // e.g., "10:00"
    required: true,
  },
  endTime: {
    type: String,   // e.g., "13:00"
    required: true,
  },
  room: {
    type: String,   // e.g., "Hall 404"
    required: true,
  },
  // ----------------------------------

  results: [
    {
      studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
      },
      marksObtained: {
        type: Number,
        default: 0,
      },
      status: {
        type: String,
        enum: ['Pass', 'Fail', 'Pending'],
        default: 'Pending',
      }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Exam', examSchema);