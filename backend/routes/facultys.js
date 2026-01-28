const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Faculty = require('../models/Faculty');

// @route   POST /api/faculty/add
// @desc    Register a new Faculty member
router.post('/add', async (req, res) => {
  try {
    const { name, email, password, employeeId, department, designation, qualifications } = req.body;

    // 1. Create the Login User (Role: Faculty)
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name, email, password, role: 'faculty' });

    // 2. Create the Detailed Faculty Profile
    const faculty = await Faculty.create({
      userId: user._id,
      employeeId,
      department,
      designation,
      qualifications
    });

    res.status(201).json(faculty);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/faculty
// @desc    Get all faculty members
router.get('/', async (req, res) => {
  try {
    const faculty = await Faculty.find().populate('userId', 'name email');
    res.json(faculty);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/faculty/:id
// @desc    Delete a faculty member
router.delete('/:id', async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) return res.status(404).json({ message: 'Faculty not found' });

    // Delete the Login Account first
    await User.findByIdAndDelete(faculty.userId);
    // Then delete the Profile
    await Faculty.findByIdAndDelete(req.params.id);

    res.json({ message: 'Faculty Member Removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/faculty/:id
// @desc    Update faculty details
router.put('/:id', async (req, res) => {
  try {
    const { name, email, ...otherData } = req.body;
    
    // Update Faculty Profile
    const faculty = await Faculty.findByIdAndUpdate(req.params.id, otherData, { new: true });
    
    // Update Linked User Account (Name/Email)
    if (faculty && (name || email)) {
        await User.findByIdAndUpdate(faculty.userId, { name, email });
    }
    
    res.json(faculty);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

module.exports = router;