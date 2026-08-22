const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Settings = require('./models/Settings');

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fashion-fusion');
    console.log('Connected to MongoDB');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@fashionsfusion.com';
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      console.error('ADMIN_PASSWORD environment variable is required');
      process.exit(1);
    }

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('Admin user already exists');
    } else {
      await User.create({
        name: 'Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        phone: '',
      });
      console.log('Admin user created successfully');
    }

    const existingSettings = await Settings.findOne();
    if (!existingSettings) {
      await Settings.create({});
      console.log('Default settings created');
    } else {
      console.log('Settings already exist');
    }

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Seed admin failed:', error.message);
    process.exit(1);
  }
}

seedAdmin();
