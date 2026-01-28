const mongoose = require('mongoose');
const User = require('./models/User');
const Student = require('./models/Student');

// Database Connection
const MONGO_URI = 'mongodb://127.0.0.1:27017/student_management_system';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB for Seeding'))
  .catch((err) => console.error(err));

const seedUsers = async () => {
  try {
    // 1. Clear existing data to avoid duplicates
    await User.deleteMany({});
    await Student.deleteMany({});
    console.log('🧹 Old data cleared!');

    // 2. Create an Admin
    const adminUser = await User.create({
      name: 'Zargar Omar', // Project Leader Name
      email: 'admin@svm.com',
      password: 'admin123', // Simple password for testing
      role: 'admin'
    });
    console.log('👤 Admin Created: admin@svm.com / admin123');

    // 3. Create a Faculty
    await User.create({
      name: 'Dr. Sharma',
      email: 'faculty@svm.com',
      password: 'faculty123',
      role: 'faculty'
    });
    console.log('👨‍🏫 Faculty Created: faculty@svm.com / faculty123');

    // 4. Create a Student (User Account + Student Details)
    const studentUser = await User.create({
      name: 'Pathan Fardin', // Team Member Name
      email: 'student@svm.com',
      password: 'student123',
      role: 'student'
    });

    // Create the detailed student record linked to the user above
    await Student.create({
      userId: studentUser._id,
      rollNum: 'CS-2024-001',
      course: 'B.Sc. CS',
      batch: '2023-2024',
      feesPaid: true
    });
    console.log('🎓 Student Created: student@svm.com / student123');

    console.log('✅ Database Seeding Complete!');
    process.exit();

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedUsers();