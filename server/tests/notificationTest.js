import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import redisClient from '../config/redis.js';
import User from '../models/User.model.js';
import Document from '../models/Document.model.js';
import Notification from '../models/Notification.model.js';
import logger from '../config/logger.js';
dotenv.config();
const API_URL = 'http://localhost:5000/api';
const dummyPngBuffer = Buffer.from(
  'iVBOR0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64'
);
const runNotificationTest = async () => {
  logger.info('Starting Socket.IO & Notification System Integration Tests...');
  await mongoose.connect(process.env.MONGODB_URI);
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
  const email = 'testnotification@gmail.com';
  await User.deleteOne({ email });
  try {
    logger.info('Registering test citizen...');
    const regRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test Notification User', email, password: 'password123' }),
    });
    await regRes.json();
    const otp = await redisClient.get(`otp:${email}`);
    await fetch(`${API_URL}/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });
  } catch (err) {
    logger.error(`Register failed: ${err.message}`);
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
  const tempFilePath = path.join(process.cwd(), 'temp_test_notification.png');
  fs.writeFileSync(tempFilePath, dummyPngBuffer);
  const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
  const fileHeader = `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="temp_test_notification.png"\r\nContent-Type: image/png\r\n\r\n`;
  const fieldHeader = `\r\n--${boundary}\r\nContent-Disposition: form-data; name="documentType"\r\n\r\nAadhaar\r\n--${boundary}--\r\n`;
  const payload = Buffer.concat([
    Buffer.from(fileHeader, 'utf-8'),
    dummyPngBuffer,
    Buffer.from(fieldHeader, 'utf-8')
  ]);
  try {
    logger.info('Uploading Aadhaar document to queue background OCR processing...');
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
      throw new Error(`Upload failed with status ${uploadRes.status}: ${uploadData.message}`);
    }
    logger.info('Waiting 2.5 seconds for background OCR Worker & Notification dispatch...');
    await new Promise((resolve) => setTimeout(resolve, 2500));
    if (uploadData.document.cloudinaryUrl.includes('/uploads/')) {
      const filename = path.basename(uploadData.document.cloudinaryUrl);
      const localDiskPath = path.join('./uploads', filename);
      if (fs.existsSync(localDiskPath)) {
        fs.unlinkSync(localDiskPath);
      }
    }
    logger.info('Testing Fetch Notifications API ("GET /api/notifications")...');
    const notifyRes = await fetch(`${API_URL}/notifications`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const notifyData = await notifyRes.json();
    if (!notifyRes.ok) throw new Error(notifyData.message);
    logger.info(`Notifications List: Found ${notifyData.notifications.length} alerts.`);
    if (notifyData.notifications.length === 0) {
      throw new Error('No notifications found for citizen! Background worker did not dispatch.');
    }
    const latestNotification = notifyData.notifications[0];
    logger.info(`Latest Alert Type: "${latestNotification.type}"`);
    logger.info(`Latest Alert Message: "${latestNotification.message}"`);
    logger.info(`Latest Alert Read Status: ${latestNotification.isRead}`);
    if (latestNotification.type !== 'Verification Alert' || !latestNotification.message.includes('Aadhaar')) {
      throw new Error('Notification type or content mismatch!');
    }
    const notificationId = latestNotification._id;
    logger.info(`Testing Mark Notification Read ("PATCH /api/notifications/:id/read")...`);
    const readRes = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const readData = await readRes.json();
    if (!readRes.ok) throw new Error(readData.message);
    logger.info(`Read API Response: ${readData.message}`);
    logger.info(`Read status in response: ${readData.notification.isRead}`);
    if (!readData.notification.isRead) {
      throw new Error('Notification status remains unread in API response!');
    }
  } catch (err) {
    logger.error(`Notification System integration test failed: ${err.message}`);
    if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
    await Document.deleteMany({ citizen: citizenId });
    await Notification.deleteMany({ targetUser: citizenId });
    await User.deleteOne({ email });
    process.exit(1);
  }
  if (fs.existsSync(tempFilePath)) {
    fs.unlinkSync(tempFilePath);
  }
  await Document.deleteMany({ citizen: citizenId });
  await Notification.deleteMany({ targetUser: citizenId });
  await User.deleteOne({ email });
  await mongoose.disconnect();
  await redisClient.disconnect();
  logger.info('Socket.IO & Notification System Integration Tests Finished Successfully!');
  process.exit(0);
};
runNotificationTest();