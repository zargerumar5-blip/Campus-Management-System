const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  profileImg: {
    type: String,
    default: ''
  },
  department: {
    type: String,
    default: 'Administration'
  }
}, { timestamps: true });

module.exports = mongoose.model('Admin', AdminSchema);