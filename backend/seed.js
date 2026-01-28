const mongoose = require('mongoose');
const dotenv = require('dotenv'); // ✅ Import dotenv
const User = require('./models/User');
const Student = require('./models/Student');

// ✅ Load Environment Variables (Taaki .env file padh sake)
dotenv.config();

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB for Seeding'))
  .catch((err) => {
    console.error('❌ DB Connection Error in Seed:', err);
    process.exit(1);
  });

const seedUsers = async () => {
  try {
    // 1. Clear existing data
    await User.deleteMany({});
    await Student.deleteMany({});
    console.log('🧹 Old data cleared!');

    // 2. Create Admin
    // NOTE: Naya Login Email/Pass yeh hoga:
    const adminUser = await User.create({
      name: 'Zargar Omar', 
      email: 'admin@svm.com', // Login ID
      password: 'admin123',   // Login Password
      role: 'admin'
    });
    console.log('👤 Admin Created: admin@svm.com / admin123');

    // 3. Create Faculty
    await User.create({
      name: 'Dr. Sharma',
      email: 'faculty@svm.com',
      password: 'faculty123',
      role: 'faculty'
    });

    // 4. Create Student
    const studentUser = await User.create({
      name: 'Pathan Fardin',
      email: 'student@svm.com',
      password: 'student123',
      role: 'student'
    });

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