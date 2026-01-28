const express = require('express');
const router = express.Router();
const Exam = require('../models/Exam');
const Student = require('../models/Student');

// @route   POST /api/exams/schedule
// @desc    Schedule a new exam (Updated for Time Range)
router.post('/schedule', async (req, res) => {
  try {
    // 1. Get all fields including startTime and endTime
    const { title, date, subject, batch, room, startTime, endTime } = req.body;
    
    // 2. Save to database
    const newExam = await Exam.create({ 
      title, 
      date, 
      subject, 
      batch, 
      room, 
      startTime, 
      endTime 
    });
    
    res.status(201).json(newExam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/exams
router.get('/', async (req, res) => {
  try {
    const exams = await Exam.find().sort({ date: 1 });
    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/exams/:id
router.put('/:id', async (req, res) => {
  try {
    const updatedExam = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedExam);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// @route   DELETE /api/exams/:id
router.delete('/:id', async (req, res) => {
  try {
    await Exam.findByIdAndDelete(req.params.id);
    res.json({ message: 'Exam Deleted Successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/exams/upload-result
router.post('/upload-result', async (req, res) => {
  try {
    const { examId, studentRoll, marks } = req.body;
    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });

    const student = await Student.findOne({ rollNum: studentRoll });
    if (!student) return res.status(404).json({ message: 'Student roll number not found' });

    const existingResultIndex = exam.results.findIndex(r => r.studentId.toString() === student._id.toString());
    const resultData = { studentId: student._id, marksObtained: marks, status: marks >= 40 ? 'Pass' : 'Fail' };

    if (existingResultIndex !== -1) {
      exam.results[existingResultIndex] = resultData;
    } else {
      exam.results.push(resultData);
    }
    await exam.save();
    res.json({ message: 'Result Uploaded Successfully', exam });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;