const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const ADMIN = {
  name: 'Admin',
  email: 'admin@gramaai.com',
  password: 'Admin@1234',
  role: 'admin',
};

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI);
  const User = require('../models/User');

  const existing = await User.findOne({ email: ADMIN.email });
  if (existing) {
    if (existing.role !== 'admin') {
      await User.updateOne({ email: ADMIN.email }, { role: 'admin' });
      console.log('Existing user promoted to admin.');
    } else {
      console.log('Admin already exists.');
    }
    await mongoose.disconnect();
    return;
  }

  // Let the User model's pre('save') hook handle hashing
  const user = new User(ADMIN);
  await user.save();
  console.log('Admin created successfully.');
  console.log('Email   :', ADMIN.email);
  console.log('Password:', ADMIN.password);
  await mongoose.disconnect();
}

createAdmin().catch((err) => { console.error(err); process.exit(1); });
