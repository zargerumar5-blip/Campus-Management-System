const express = require('express');
const router = express.Router();
const Course = require('../models/Course'); // This path must match the file you made in Step 1

// @route   GET /api/courses
// @desc    Get all courses
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/courses/add
// @desc    Add a new course
router.post('/add', async (req, res) => {
  try {
    const { name, code, description } = req.body;
    const newCourse = await Course.create({ name, code, description });
    res.status(201).json(newCourse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   DELETE /api/courses/:id
// @desc    Delete a course
router.delete('/:id', async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: 'Course Deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/courses/:id
// @desc    Update a course
router.put('/:id', async (req, res) => {
  try {
    const updatedCourse = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedCourse);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

module.exports = router;