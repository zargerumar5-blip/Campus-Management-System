const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const User = require('../models/User');

// @route   GET /api/students
// @desc    Get all students
router.get('/', async (req, res) => {
  try {
    const students = await Student.find().populate('userId', 'name email');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/students/add
// @desc    Add a student
router.post('/add', async (req, res) => {
  try {
    const { userId, rollNum, course, batch, dob, feesTotal } = req.body;
    const existingStudent = await Student.findOne({ rollNum });
    if (existingStudent) {
      return res.status(400).json({ message: 'Roll Number already exists' });
    }
    const newStudent = new Student({ 
      userId, rollNum, course, batch, dob,
      feesTotal: feesTotal || 50000 
    });
    await newStudent.save();
    res.status(201).json(newStudent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   GET /api/students/profile/:userId
// @desc    Get Single Student Profile
router.get('/profile/:userId', async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.params.userId }).populate('userId', 'name email');
    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    const profile = {
      _id: student._id,
      name: student.userId.name,
      email: student.userId.email,
      course: student.course,
      batch: student.batch,
      rollNum: student.rollNum,
      examMarks: student.examMarks || [],
      feesTotal: student.feesTotal,
      feesPaidAmount: student.feesPaidAmount,
      feesPaid: student.feesPaid
    };
    res.json(profile);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// --- NEW EDIT ROUTE (Fixes the 404) ---
// @route   PUT /api/students/:id
// @desc    Update Student Details (Name, Roll, Batch, Course)
router.put('/:id', async (req, res) => {
  try {
    const { name, rollNum, course, batch } = req.body;
    
    // 1. Find Student
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    // 2. Update Student Fields
    if (rollNum) student.rollNum = rollNum;
    if (course) student.course = course;
    if (batch) student.batch = batch;
    await student.save();

    // 3. Update Linked User Fields (Name)
    if (name) {
      const user = await User.findById(student.userId);
      if (user) {
        user.name = name;
        await user.save();
      }
    }

    res.json({ message: 'Student Updated Successfully', student });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});
// --------------------------------------

// @route   PUT /api/students/fees/:id
// @desc    Update Fees Paid Amount
router.put('/fees/:id', async (req, res) => {
  try {
    const { amount } = req.body;
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const payment = Number(amount);
    if (isNaN(payment) || payment <= 0) return res.status(400).json({ message: 'Invalid Amount' });

    student.feesPaidAmount = (student.feesPaidAmount || 0) + payment;
    if (student.feesPaidAmount >= student.feesTotal) student.feesPaid = true;

    await student.save();
    res.json({ message: 'Fees Updated', student });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/students/marks
router.post('/marks', async (req, res) => {
  try {
    const { studentId, exam, subject, marks, total } = req.body;
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const existingIndex = student.examMarks.findIndex((m) => m.exam === exam && m.subject === subject);
    if (existingIndex > -1) {
      student.examMarks[existingIndex].marks = marks;
      student.examMarks[existingIndex].total = total;
    } else {
      student.examMarks.push({ exam, subject, marks, total });
    }
    await student.save();
    res.json({ message: 'Marks updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/students/update/:id (User Profile Update)
router.put('/update/:id', async (req, res) => {
  try {
    const { email, password } = req.body;
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    const user = await User.findById(student.userId);
    
    if (email) user.email = email;
    if (password) user.password = password; 
    await user.save();
    res.json({ message: 'Profile Updated', user });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   DELETE /api/students/:id
router.delete('/:id', async (req, res) => {
    try {
      const student = await Student.findById(req.params.id);
      if (!student) return res.status(404).json({ message: 'Student not found' });
      await User.findByIdAndDelete(student.userId);
      await Student.findByIdAndDelete(req.params.id);
      res.json({ message: 'Student Deleted Successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
});

module.exports = router;