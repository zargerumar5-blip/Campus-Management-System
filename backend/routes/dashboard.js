const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');

// @route   GET /api/dashboard/stats
// @desc    Get counts for Admin Dashboard
router.get('/stats', async (req, res) => {
  try {
    const studentCount = await Student.countDocuments();
    const facultyCount = await Faculty.countDocuments();

    // --- NEW CALCULATION LOGIC ---
    // Sum up the 'feesPaidAmount' of ALL students
    const feesData = await Student.aggregate([
      {
        $group: {
          _id: null,
          totalCollected: { $sum: "$feesPaidAmount" }
        }
      }
    ]);
    
    const totalFees = feesData.length > 0 ? feesData[0].totalCollected : 0;
    // -----------------------------

    res.json({
      students: studentCount,
      faculty: facultyCount,
      totalFees: totalFees
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;