import mongoose from 'mongoose';
import dotenv from 'dotenv';
import redisClient from '../config/redis.js';
import User from '../models/User.model.js';
import Scheme from '../models/Scheme.model.js';
import Document from '../models/Document.model.js';
import Application from '../models/Application.model.js';
import Notification from '../models/Notification.model.js';
import AuditLog from '../models/AuditLog.model.js';
import logger from '../config/logger.js';
dotenv.config();
const API_URL = 'http://localhost:5000/api';
const setupUser = async (name, email, role = 'citizen') => {
  await User.deleteOne({ email });
  const regRes = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password: 'password123', role }),
  });
  await regRes.json();
  const otp = await redisClient.get(`otp:${email}`);
  await fetch(`${API_URL}/auth/verify-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp }),
  });
  const loginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'password123' }),
  });
  const loginData = await loginRes.json();
  return {
    id: loginData.user._id,
    token: loginData.accessToken,
  };
};
const runAdminTest = async () => {
  logger.info('Starting Admin & Officer Workflow Integration Tests...');
  await mongoose.connect(process.env.MONGODB_URI);
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
  const citizen = await setupUser('Citizen Act', 'citizentest@gmail.com', 'citizen');
  const officer = await setupUser('Officer Act', 'officertest@gmail.com', 'officer');
  const admin = await setupUser('Admin Act', 'admintest@gmail.com', 'admin');
  logger.info('Actor profiles registered and verified successfully.');
  const scheme = await Scheme.findOne({ title: /Kisan/ });
  if (!scheme) {
    logger.error('Pre-requisite PM-KISAN scheme not found. Run seeder first!');
    process.exit(1);
  }
  logger.info(`Found Scheme: ${scheme.title}. Required Docs: [${scheme.requiredDocuments.join(', ')}]`);
  await Document.deleteMany({ citizen: citizen.id });
  const docsToSeed = scheme.requiredDocuments.map((docType) => ({
    citizen: citizen.id,
    documentType: docType,
    cloudinaryUrl: 'http://localhost/mock-doc.png',
    cloudinaryPublicId: 'mock-public-id',
    verifiedStatus: 'Verified',
    isActive: true,
  }));
  await Document.insertMany(docsToSeed);
  logger.info(`Pre-seeded ${docsToSeed.length} verified documents for test citizen.`);
  let applicationId = '';
  try {
    logger.info('Testing Application Submission (Citizen role)...');
    const submitRes = await fetch(`${API_URL}/applications`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${citizen.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ schemeId: scheme._id }),
    });
    const submitData = await submitRes.json();
    if (!submitRes.ok) throw new Error(submitData.message);
    logger.info(`Submission Success! Application Status: "${submitData.application.status}"`);
    logger.info(`Auto-Filled Fields Count: ${Object.keys(submitData.application.autoFilledData || {}).length}`);
    applicationId = submitData.application._id;
  } catch (err) {
    logger.error(`Application submit test failed: ${err.message}`);
    await cleanup();
    process.exit(1);
  }
  try {
    logger.info('Testing Fetch Applications (Officer role)...');
    const listRes = await fetch(`${API_URL}/applications?status=Submitted`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${officer.token}`,
        'Content-Type': 'application/json',
      },
    });
    const listData = await listRes.json();
    if (!listRes.ok) throw new Error(listData.message);
    logger.info(`Officer found ${listData.total} submitted applications in queue.`);
    logger.info(`Testing Application Status Review ("Approved" - Officer role)...`);
    const reviewRes = await fetch(`${API_URL}/applications/${applicationId}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${officer.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'Approved',
        comment: 'All documents verified via citizen OCR vault. Details matched successfully.',
      }),
    });
    const reviewData = await reviewRes.json();
    if (!reviewRes.ok) throw new Error(reviewData.message);
    logger.info(`Officer Review Success: ${reviewData.message}`);
    logger.info(`Timeline length: ${reviewData.application.statusTimeline.length} events.`);
  } catch (err) {
    logger.error(`Officer review workflow failed: ${err.message}`);
    await cleanup();
    process.exit(1);
  }
  try {
    logger.info('Testing Fetch Audit Logs (Admin role)...');
    const auditRes = await fetch(`${API_URL}/admin/audit-logs?limit=5`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${admin.token}`,
        'Content-Type': 'application/json',
      },
    });
    const auditData = await auditRes.json();
    if (!auditRes.ok) throw new Error(auditData.message);
    logger.info(`Audit Log Fetch Success: Found ${auditData.total} total trails.`);
    const hasAuditTrail = auditData.logs.some((l) => l.action === 'APPLICATION_SUBMIT');
    logger.info(`Security Verification: APPLICATION_SUBMIT audit trail exists: ${hasAuditTrail}`);
    if (!hasAuditTrail) throw new Error('Audit log failed to capture APPLICATION_SUBMIT action!');
  } catch (err) {
    logger.error(`Audit logging verification failed: ${err.message}`);
    await cleanup();
    process.exit(1);
  }
  try {
    logger.info('Testing Fetch System Dashboard Analytics (Admin role)...');
    const analyticsRes = await fetch(`${API_URL}/admin/analytics`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${admin.token}`,
        'Content-Type': 'application/json',
      },
    });
    const analyticsData = await analyticsRes.json();
    if (!analyticsRes.ok) throw new Error(analyticsData.message);
    logger.info('Analytics Data Output:');
    logger.info(`- Users: Citizens (${analyticsData.metrics.users.citizen}), Officers (${analyticsData.metrics.users.officer}), Admins (${analyticsData.metrics.users.admin})`);
    logger.info(`- Applications: Total (${analyticsData.metrics.applications.total}), Approved (${analyticsData.metrics.applications.Approved})`);
    logger.info(`- Schemes: Total (${analyticsData.metrics.schemes.total})`);
    logger.info(`- Registration Trends: Found ${analyticsData.registrationTrends.length} months data.`);
    if (analyticsData.metrics.users.officer === 0 || analyticsData.metrics.applications.Approved === 0) {
      throw new Error('Analytics aggregation mismatch!');
    }
  } catch (err) {
    logger.error(`Analytics aggregation test failed: ${err.message}`);
    await cleanup();
    process.exit(1);
  }
  await cleanup();
  logger.info('Admin & Officer Workflow Integration Tests Finished Successfully!');
  process.exit(0);
};
const cleanup = async () => {
  logger.info('Cleaning up database actor records...');
  const emails = ['citizentest@gmail.com', 'officertest@gmail.com', 'admintest@gmail.com'];
  const users = await User.find({ email: { $in: emails } });
  const userIds = users.map((u) => u._id);
  await Application.deleteMany({ citizen: { $in: userIds } });
  await Document.deleteMany({ citizen: { $in: userIds } });
  await Notification.deleteMany({ targetUser: { $in: userIds } });
  await AuditLog.deleteMany({ actor: { $in: userIds } });
  await User.deleteMany({ email: { $in: emails } });
  await mongoose.disconnect();
  await redisClient.disconnect();
};
runAdminTest();