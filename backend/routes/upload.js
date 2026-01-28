const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Models
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Admin = require('../models/Admin'); // ✅ Ensure this is here

// Storage Engine
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function(req, file, cb){
    cb(null, 'profile-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if(mimetype && extname) return cb(null, true);
    cb('Error: Images Only!');
  }
}).single('profileImg');

// Route
router.post('/:role/:userId', (req, res) => {
  upload(req, res, async (err) => {
    if(err) return res.status(400).json({ msg: err });
    if(!req.file) return res.status(400).json({ msg: 'No File Selected!' });

    const filePath = `/uploads/${req.file.filename}`;
    const { role, userId } = req.params;

    try {
      let Model;
      if (role === 'student') Model = Student;
      else if (role === 'faculty') Model = Faculty;
      else if (role === 'admin') Model = Admin; // ✅ Enable Admin

      if(Model) {
         const updatedProfile = await Model.findOneAndUpdate(
           { userId: userId }, 
           { profileImg: filePath },
           { new: true, upsert: true } // upsert: true creates it if missing
         );
         res.json({ filePath, msg: 'File Uploaded!' });
      } else {
         res.status(400).json({ msg: 'Invalid Role' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: 'Server Error' });
    }
  });
});

module.exports = router;