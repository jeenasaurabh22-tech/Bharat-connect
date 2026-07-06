import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.model.js';
import { connectDB } from './db.js';
dotenv.config();
const email = process.argv[2];
if (!email) {
  console.error('❌  Usage: node config/make-admin.js <email>');
  process.exit(1);
}
const run = async () => {
  await connectDB();
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    console.error(`❌  No user found with email: ${email}`);
    process.exit(1);
  }
  const oldRole = user.role;
  user.role = 'admin';
  await user.save();
  console.log(`✅  Role updated!`);
  console.log(`   Name  : ${user.name}`);
  console.log(`   Email : ${user.email}`);
  console.log(`   Role  : ${oldRole} → admin`);
  console.log(`\n   Now log out and log back in to access /admin`);
  await mongoose.disconnect();
  process.exit(0);
};
run().catch((err) => {
  console.error('❌  Error:', err.message);
  process.exit(1);
});