const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Links to the Login credentials
    required: true,
  },
  employeeId: {
    type: String,
    required: true,
    unique: true,
  },
  department: {
    type: String,
    required: true,
  },
  designation: {
    type: String,
    required: true,
  },
  qualifications: {
    type: String,
    required: true,
  },
  profileImg: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Faculty', facultySchema);