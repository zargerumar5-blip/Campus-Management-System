const mongoose = require('mongoose');

// This is the blueprint for anyone who logs into the system
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // No two people can have the same email
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'faculty', 'student'], // Only these 3 roles are allowed
    default: 'student',
  },
}, { timestamps: true }); // Automatically saves when the user was created

module.exports = mongoose.model('User', userSchema);