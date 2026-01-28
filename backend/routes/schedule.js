const express = require('express');
const router = express.Router();
const Schedule = require('../models/Schedule');

// @route   POST /api/schedule
// @desc    Add a class
router.post('/', async (req, res) => {
  try {
    const { day, startTime, endTime, subject, batch, room, facultyName } = req.body;
    const newClass = new Schedule({ day, startTime, endTime, subject, batch, room, facultyName });
    await newClass.save();
    res.json(newClass);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/schedule
// @desc    Get ALL classes
router.get('/', async (req, res) => {
  try {
    const schedule = await Schedule.find();
    res.json(schedule);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/schedule/batch/:batchName
// @desc    Get schedule (Fuzzy Match Fixed)
router.get('/batch/:batchName', async (req, res) => {
  try {
    const batchName = req.params.batchName;
    
    // Using $or to match strictly OR partially
    const schedule = await Schedule.find({
      $or: [
        { batch: batchName }, // Exact Match
        { batch: { $regex: batchName, $options: 'i' } } // Partial Match
      ]
    });
    
    res.json(schedule);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- NEW UPDATE ROUTE (REQUIRED FOR EDIT BUTTON) ---
// @route   PUT /api/schedule/:id
// @desc    Update a class
router.put('/:id', async (req, res) => {
  try {
    const updatedClass = await Schedule.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedClass);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
// ---------------------------------------------------

// @route   DELETE /api/schedule/:id
router.delete('/:id', async (req, res) => {
  try {
    await Schedule.findByIdAndDelete(req.params.id);
    res.json({ message: 'Class deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;