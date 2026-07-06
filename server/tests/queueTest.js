import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import redisClient from '../config/redis.js';
import User from '../models/User.model.js';
import Document from '../models/Document.model.js';
import logger from '../config/logger.js';
dotenv.config();
const API_URL = 'http://localhost:5000/api';
const dummyPngBuffer = Buffer.from(
  'iVBOR0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64'
);
const runQueueTest = async () => {
  logger.info('Starting BullMQ Asynchronous Queues Integration Tests...');
  await mongoose.connect(process.env.MONGODB_URI);
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
  const email = 'testqueue@gmail.com';
  await User.deleteOne({ email });
  try {
    logger.info('Testing Async Registration & Email Queue enqueuing...');
    const regRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test Queue User', email, password: 'password123' }),
    });
    const regData = await regRes.json();
    if (!regRes.ok) throw new Error(regData.message);
    logger.info(`Async Register Response: ${regData.message}`);
    logger.info('Waiting 1.5 seconds for background email worker...');
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const otp = await redisClient.get(`otp:${email}`);
    logger.info(`Retrieved OTP written to Redis: ${otp}`);
    if (!otp) throw new Error('OTP was not found in Redis, background email worker may not have executed!');
    await fetch(`${API_URL}/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });
  } catch (err) {
    logger.error(`Email Queue integration test failed: ${err.message}`);
    await User.deleteOne({ email });
    process.exit(1);
  }
  const loginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'password123' }),
  });
  const loginData = await loginRes.json();
  const token = loginData.accessToken;
  const citizenId = loginData.user._id;
  const tempFilePath = path.join(process.cwd(), 'temp_test_queue.png');
  fs.writeFileSync(tempFilePath, dummyPngBuffer);
  const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
  const fileHeader = `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="temp_test_queue.png"\r\nContent-Type: image/png\r\n\r\n`;
  const fieldHeader = `\r\n--${boundary}\r\nContent-Disposition: form-data; name="documentType"\r\n\r\nPAN\r\n--${boundary}--\r\n`;
  const payload = Buffer.concat([
    Buffer.from(fileHeader, 'utf-8'),
    dummyPngBuffer,
    Buffer.from(fieldHeader, 'utf-8')
  ]);
  try {
    logger.info('Testing Document Upload (expecting immediate 202 Accepted response)...');
    const uploadRes = await fetch(`${API_URL}/documents/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
      body: payload,
    });
    const uploadData = await uploadRes.json();
    if (uploadRes.status !== 202) {
      throw new Error(`Expected HTTP 202 Accepted, got HTTP ${uploadRes.status}: ${uploadData.message}`);
    }
    logger.info(`Immediate API Response: "${uploadData.message}"`);
    logger.info(`Initial Document Status: "${uploadData.document.verifiedStatus}" (Expected: Pending)`);
    if (uploadData.document.verifiedStatus !== 'Pending') {
      throw new Error('Document status was not Pending immediately after upload!');
    }
    const documentId = uploadData.document._id;
    logger.info('Waiting 2 seconds for background OCR Worker to process...');
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const updatedDoc = await Document.findById(documentId);
    logger.info(`Updated Document Status from DB: "${updatedDoc.verifiedStatus}"`);
    logger.info(`OCR confidence read: ${updatedDoc.ocrMetadata.confidence}%`);
    logger.info(`Parsed fields in DB: ${JSON.stringify(updatedDoc.ocrMetadata.parsedFields)}`);
    if (updatedDoc.verifiedStatus !== 'Verified' && updatedDoc.verifiedStatus !== 'Flagged') {
      throw new Error('Background OCR worker failed to process and update document status!');
    }
    logger.info('Background OCR Queue processed document successfully.');
    if (uploadData.document.cloudinaryUrl.includes('/uploads/')) {
      const filename = path.basename(uploadData.document.cloudinaryUrl);
      const localDiskPath = path.join('./uploads', filename);
      if (fs.existsSync(localDiskPath)) {
        fs.unlinkSync(localDiskPath);
      }
    }
  } catch (err) {
    logger.error(`OCR Queue integration test failed: ${err.message}`);
    if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
    await Document.deleteMany({ citizen: citizenId });
    await User.deleteOne({ email });
    process.exit(1);
  }
  if (fs.existsSync(tempFilePath)) {
    fs.unlinkSync(tempFilePath);
  }
  await Document.deleteMany({ citizen: citizenId });
  await User.deleteOne({ email });
  await mongoose.disconnect();
  await redisClient.disconnect();
  logger.info('BullMQ Asynchronous Queues Integration Tests Finished Successfully!');
  process.exit(0);
};
runQueueTest();