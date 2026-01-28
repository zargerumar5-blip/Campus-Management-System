const express = require('express');
const router = express.Router();
const User = require('../models/User');
// --- IMPORT MODELS TO FETCH PROFILE IMAGES ---
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Admin = require('../models/Admin');

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = await User.create({ name, email, password, role });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Login user & get access
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    // Simple password check (We will make this more secure later)
    if (user && user.password === password) {
      
      // --- NEW: FETCH PROFILE IMAGE BASED ON ROLE ---
      let profileImg = '';
      try {
        if (user.role === 'student') {
          const profile = await Student.findOne({ userId: user._id });
          if (profile) profileImg = profile.profileImg;
        } else if (user.role === 'faculty') {
          const profile = await Faculty.findOne({ userId: user._id });
          if (profile) profileImg = profile.profileImg;
        } else if (user.role === 'admin') {
          const profile = await Admin.findOne({ userId: user._id });
          if (profile) profileImg = profile.profileImg;
        }
      } catch (err) {
        console.error("Error fetching profile image during login:", err);
      }
      // ----------------------------------------------

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImg: profileImg // <--- SEND IMAGE TO FRONTEND
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/auth/update/:id
// @desc    Update user profile
router.put('/update/:id', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.findById(req.params.id);

    if (user) {
      user.name = name || user.name;
      user.email = email || user.email;
      if (password) {
        user.password = password; 
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;