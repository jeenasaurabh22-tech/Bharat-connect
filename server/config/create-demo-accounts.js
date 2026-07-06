import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Citizen, Officer, Admin } from '../models/RoleModels.js';
import { connectDB } from './db.js';
dotenv.config();
const accounts = [
  {
    Model: Citizen,
    collection: 'citizens',
    data: {
      name: 'Demo Citizen',
      email: 'citizen@bharatconnect.in',
      password: 'Citizen@123',
      isVerified: true,
      profile: {
        age: 28, gender: 'Male', annualIncome: 180000,
        occupation: 'Farmer', education: '10th Pass',
        state: 'Maharashtra', district: 'Pune',
        category: 'OBC', isDisabled: false,
      },
    },
  },
  {
    Model: Officer,
    collection: 'officers',
    data: {
      name: 'Review Officer',
      email: 'officer@bharatconnect.in',
      password: 'Officer@123',
      isVerified: true,
      employeeId: 'GOV-2024-OFF01',
      department: 'Ministry of Agriculture',
      state: 'Maharashtra',
    },
  },
  {
    Model: Admin,
    collection: 'admins',
    data: {
      name: 'Platform Admin',
      email: 'admin@bharatconnect.in',
      password: 'Admin@123',
      isVerified: true,
    },
  },
];
const run = async () => {
  await connectDB();
  console.log('\n🚀  Creating demo accounts in separate collections...\n');
  for (const { Model, collection, data } of accounts) {
    const existing = await Model.findOne({ email: data.email });
    if (existing) {
      existing.isVerified = true;
      await existing.save();
      console.log(`♻️   Updated  [${collection}] → ${data.email}`);
    } else {
      await Model.create(data);
      console.log(`✅  Created  [${collection}] → ${data.email}`);
    }
  }
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋  Demo Credentials (must select correct role on login page)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('👤  CITIZEN  (select Citizen on login)');
  console.log('    Email    : citizen@bharatconnect.in');
  console.log('    Password : Citizen@123');
  console.log('');
  console.log('🏛️   OFFICER  (select Officer on login)');
  console.log('    Email    : officer@bharatconnect.in');
  console.log('    Password : Officer@123');
  console.log('');
  console.log('👑  ADMIN    (select Admin on login)');
  console.log('    Email    : admin@bharatconnect.in');
  console.log('    Password : Admin@123');
  console.log('');
  console.log('⚠️   If you use Citizen email but select Officer role → login FAILS');
  console.log('    Each role checks ONLY its own collection.');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  await mongoose.disconnect();
};
run().catch((e) => { console.error('❌', e.message); process.exit(1); });