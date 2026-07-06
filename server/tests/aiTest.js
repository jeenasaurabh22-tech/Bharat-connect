import mongoose from 'mongoose';
import dotenv from 'dotenv';
import redisClient from '../config/redis.js';
import User from '../models/User.model.js';
import Scheme from '../models/Scheme.model.js';
import logger from '../config/logger.js';
dotenv.config();
const API_URL = 'http://localhost:5000/api';
const runAiTest = async () => {
  logger.info('Starting AI Eligibility & Chatbot Services Integration Tests...');
  await mongoose.connect(process.env.MONGODB_URI);
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
  try {
    logger.info('Testing Jargon Explainer ("/api/ai/explain-jargon")...');
    const response = await fetch(`${API_URL}/ai/explain-jargon`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ term: 'creamy layer OBC' }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    logger.info(`Jargon Response - Term: "${data.term}", Explanation: "${data.explanation}"`);
    if (!data.explanation || !data.explanation.includes('Mock AI Response')) {
      throw new Error('Jargon explainer failed to return mock AI content!');
    }
  } catch (err) {
    logger.error(`Jargon explainer test failed: ${err.message}`);
    process.exit(1);
  }
  try {
    logger.info('Testing Notification Summarizer ("/api/ai/summarize-notification")...');
    const response = await fetch(`${API_URL}/ai/summarize-notification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'The Ministry of Finance announced a revision of interest rates on small savings schemes for Q2 2026. The rate for Sukanya Samriddhi Account scheme is raised to 8.4%. The deadline for linking Aadhaar cards to savings bank accounts remains extended to September 30, 2026.',
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    logger.info(`Summarizer Response: "${data.summary.substring(0, 150)}..."`);
    if (!data.summary || !data.summary.includes('Mock AI Response')) {
      throw new Error('Summarizer failed to return mock summary content!');
    }
  } catch (err) {
    logger.error(`Notification summarizer test failed: ${err.message}`);
    process.exit(1);
  }
  const email = 'testai@gmail.com';
  await User.deleteOne({ email });
  const regRes = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test AI User', email, password: 'password123' }),
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
  const token = loginData.accessToken;
  const userId = loginData.user._id;
  try {
    logger.info('Testing Chatbot Endpoint ("/api/ai/chat")...');
    const chatRes = await fetch(`${API_URL}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message: 'Hello! I need help with central schemes.' }),
    });
    const chatData = await chatRes.json();
    if (!chatRes.ok) throw new Error(chatData.message);
    logger.info(`Chatbot Reply: "${chatData.reply}"`);
    const historyVal = await redisClient.get(`chat:history:${userId}`);
    logger.info(`Redis chat history verification: ${historyVal ? 'Found history!' : 'Missing history!'}`);
    if (!historyVal) throw new Error('Chat history key not created in Redis!');
    const parsedHistory = JSON.parse(historyVal);
    logger.info(`History size: ${parsedHistory.length} messages.`);
    if (parsedHistory[0].parts !== 'Hello! I need help with central schemes.') {
      throw new Error('Chat history content mismatch!');
    }
    logger.info('Testing Clear Chat History...');
    const clearRes = await fetch(`${API_URL}/ai/clear-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const clearData = await clearRes.json();
    logger.info(`Clear Chat Response: ${clearData.message}`);
    const clearedVal = await redisClient.get(`chat:history:${userId}`);
    if (clearedVal) throw new Error('Chat history was not deleted from Redis after clear request!');
    logger.info('Clear chat history verified successfully.');
  } catch (err) {
    logger.error(`Chatbot test failed: ${err.message}`);
    await User.deleteOne({ email });
    process.exit(1);
  }
  try {
    const scheme = await Scheme.findOne({ title: /Kisan/ });
    if (!scheme) throw new Error('Seeded scheme PM-KISAN not found!');
    logger.info(`Testing Eligibility Explainer for Scheme: "${scheme.title}"...`);
    const eligibilityRes = await fetch(`${API_URL}/ai/explain-eligibility`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ schemeId: scheme._id }),
    });
    const eligData = await eligibilityRes.json();
    if (!eligibilityRes.ok) throw new Error(eligData.message);
    logger.info(`Eligibility Status Output: "${eligData.status}"`);
    logger.info(`Eligibility Explanation: \n${eligData.explanation}`);
    logger.info(`Matching Documents: [${eligData.matchingDocuments.join(', ')}]`);
    logger.info(`Missing Documents: [${eligData.missingDocuments.join(', ')}]`);
    logger.info(`Next Steps: "${eligData.nextSteps}"`);
    if (!eligData.status || !eligData.explanation || !eligData.nextSteps) {
      throw new Error('Eligibility response fields are incomplete!');
    }
  } catch (err) {
    logger.error(`Eligibility explainer test failed: ${err.message}`);
    await User.deleteOne({ email });
    process.exit(1);
  }
  await User.deleteOne({ email });
  await mongoose.disconnect();
  await redisClient.disconnect();
  logger.info('AI Eligibility & Chatbot Integration Tests Finished Successfully!');
  process.exit(0);
};
runAiTest();