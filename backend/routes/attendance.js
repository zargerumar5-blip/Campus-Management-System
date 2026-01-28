const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');

// @route   POST /api/attendance
// @desc    Faculty saves attendance (Daily Basis) - Creates or Updates
router.post('/', async (req, res) => {
  try {
    const { studentId, date, status, batch } = req.body;

    // Check if record already exists for this Student + Date
    let attendance = await Attendance.findOne({ studentId, date });

    if (attendance) {
      // Update existing record
      attendance.status = status;
      attendance.batch = batch; // Update batch if changed
      await attendance.save();
    } else {
      // Create new record
      attendance = new Attendance({
        studentId,
        date,
        status,
        batch
      });
      await attendance.save();
    }

    res.json(attendance);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/attendance/user/:userId
// @desc    Student views their own attendance
router.get('/user/:userId', async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.params.userId });
    if (!student) return res.status(404).json({ msg: 'Student profile not found' });

    const records = await Attendance.find({ studentId: student._id }).sort({ date: -1 });
    res.json(records);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/attendance/batch/:batch/:date
// @desc    Get Daily Attendance (For Faculty Edit Mode)
router.get('/batch/:batch/:date', async (req, res) => {
  try {
    const { batch, date } = req.params;
    const records = await Attendance.find({ batch, date });
    res.json(records);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- NEW ROUTE: Get Monthly Report ---
// @route   GET /api/attendance/report/:batch/:month
// @desc    Get All records for a batch in a specific month (YYYY-MM)
router.get('/report/:batch/:month', async (req, res) => {
  try {
    const { batch, month } = req.params; // month format: 'YYYY-MM'
    
    // Find records where batch matches and date starts with the month string
    // e.g., date "2026-01-19" starts with "2026-01"
    const records = await Attendance.find({
      batch,
      date: { $regex: `^${month}` }
    });
    
    res.json(records);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;