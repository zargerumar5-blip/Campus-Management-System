const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rollNum: { type: String, required: true, unique: true },
  course: { type: String, required: true },
  batch: { type: String, required: true }, 
  dob: { type: Date },
  profileImg: { type: String },
  
  // --- MARKS SECTION (Critical for this to work) ---
  examMarks: [{
    exam: String,   
    subject: String,
    marks: Number,
    total: Number
  }],
  // ------------------------------------------------

  feesPaid: { type: Boolean, default: false },
  feesTotal: { type: Number, default: 50000 },
  feesPaidAmount: { type: Number, default: 0 },
  attendance: [{
    date: String,
    status: String
  }]
});

module.exports = mongoose.model('Student', StudentSchema);