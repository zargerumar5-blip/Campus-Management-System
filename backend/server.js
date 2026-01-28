const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// --- IMPORT ROUTES ---
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const facultyRoutes = require('./routes/facultys'); 
const examRoutes = require('./routes/exams');
const dashboardRoutes = require('./routes/dashboard');
const courseRoutes = require('./routes/courses');
const scheduleRoutes = require('./routes/schedule');
const attendanceRoutes = require('./routes/attendance');
const uploadRoute = require('./routes/upload'); // <--- MISSING IMPORT

// Initialize App
dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

// Database
const MONGO_URI = 'mongodb://127.0.0.1:27017/student_management_system';
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully (Localhost)'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// --- CONNECT ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/attendance', attendanceRoutes); 
app.use('/api/upload', uploadRoute);// <--- ADD THIS LINE

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});