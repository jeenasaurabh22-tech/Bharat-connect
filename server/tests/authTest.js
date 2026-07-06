import mongoose from 'mongoose';
import dotenv from 'dotenv';
import redisClient from '../config/redis.js';
import User from '../models/User.model.js';
import logger from '../config/logger.js';
dotenv.config();
const API_URL = 'http://localhost:5000/api';
const runAuthTest = async () => {
  logger.info('Starting Auth System Integration Test (using native fetch)...');
  await mongoose.connect(process.env.MONGODB_URI);
  await User.deleteOne({ email: 'testcitizen@gmail.com' });
  logger.info('Cleaned existing test user from MongoDB.');
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
  try {
    logger.info('Testing User Registration...');
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Citizen',
        email: 'testcitizen@gmail.com',
        password: 'password123',
        role: 'citizen',
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    logger.info(`Registration Response: ${data.message}`);
  } catch (error) {
    logger.error(`Registration failed: ${error.message}`);
    process.exit(1);
  }
  let otp;
  try {
    otp = await redisClient.get('otp:testcitizen@gmail.com');
    logger.info(`Retrieved OTP from Redis: ${otp}`);
    if (!otp) throw new Error('OTP not found in Redis!');
  } catch (error) {
    logger.error(`Failed to get OTP: ${error.message}`);
    process.exit(1);
  }
  try {
    logger.info('Testing Email Verification...');
    const response = await fetch(`${API_URL}/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testcitizen@gmail.com',
        otp,
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    logger.info(`Verification Response: ${data.message}`);
  } catch (error) {
    logger.error(`Verification failed: ${error.message}`);
    process.exit(1);
  }
  let accessToken;
  try {
    logger.info('Testing Login...');
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testcitizen@gmail.com',
        password: 'password123',
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    logger.info(`Login Response: ${data.message}`);
    accessToken = data.accessToken;
    logger.info('Obtained access token successfully.');
  } catch (error) {
    logger.error(`Login failed: ${error.message}`);
    process.exit(1);
  }
  try {
    logger.info('Testing Get Profile (/me)...');
    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    logger.info(`Profile Fetch Success! User: ${data.user.name}, Role: ${data.user.role}`);
  } catch (error) {
    logger.error(`Profile fetch failed: ${error.message}`);
    process.exit(1);
  }
  try {
    logger.info('Testing Logout...');
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ refreshToken: 'mock' }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    logger.info(`Logout Response: ${data.message}`);
  } catch (error) {
    logger.error(`Logout failed: ${error.message}`);
    process.exit(1);
  }
  await User.deleteOne({ email: 'testcitizen@gmail.com' });
  await mongoose.disconnect();
  await redisClient.disconnect();
  logger.info('Auth System Integration Test Completed Successfully!');
  process.exit(0);
};
runAuthTest();