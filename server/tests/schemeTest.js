import mongoose from 'mongoose';
import dotenv from 'dotenv';
import redisClient from '../config/redis.js';
import Scheme from '../models/Scheme.model.js';
import logger from '../config/logger.js';
dotenv.config();
const API_URL = 'http://localhost:5000/api';
const runSchemeTest = async () => {
  logger.info('Starting Scheme Search, Filtering & Caching Integration Tests...');
  await mongoose.connect(process.env.MONGODB_URI);
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
  await redisClient.flushAll();
  logger.info('Flushed Redis Cache for clean cache test.');
  try {
    logger.info('Testing Paginated Scheme Fetching...');
    const response = await fetch(`${API_URL}/schemes?limit=5&page=1`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    logger.info(`Fetched ${data.schemes.length} schemes. Total in DB: ${data.total}, Total Pages: ${data.totalPages}`);
    if (data.schemes.length !== 5 || data.total < 500) {
      throw new Error(`Pagination metadata mismatch! Expected 5 schemes, got ${data.schemes.length}. Total: ${data.total}`);
    }
  } catch (err) {
    logger.error(`Pagination test failed: ${err.message}`);
    process.exit(1);
  }
  try {
    logger.info('Testing Keyword Text Search ("Kisan")...');
    const response = await fetch(`${API_URL}/schemes?search=Kisan&searchType=keyword`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    logger.info(`Found ${data.schemes.length} keyword matches for "Kisan".`);
    const hasKisan = data.schemes.some((s) => s.title.includes('Kisan'));
    if (!hasKisan) throw new Error('Search result did not contain "Kisan" scheme!');
  } catch (err) {
    logger.error(`Keyword search failed: ${err.message}`);
    process.exit(1);
  }
  try {
    logger.info('Testing Multi-Criteria Filters (Maharashtra, Education, Age=18, Income=100000)...');
    const response = await fetch(
      `${API_URL}/schemes?state=Maharashtra&category=Education&age=18&income=100000`
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    logger.info(`Found ${data.schemes.length} matching schemes for filtered criteria.`);
    data.schemes.forEach((s) => {
      if (s.state !== 'Maharashtra') throw new Error(`State filter mismatch! Expected Maharashtra, got ${s.state}`);
      if (s.category !== 'Education') throw new Error(`Category filter mismatch! Expected Education, got ${s.category}`);
      if (s.eligibilityRules.maxIncome && s.eligibilityRules.maxIncome < 100000) {
        throw new Error(`Income limit mismatch! Scheme maxIncome is ${s.eligibilityRules.maxIncome} for user income 100000`);
      }
    });
    logger.info('Multi-criteria filters verified successfully.');
  } catch (err) {
    logger.error(`Filter test failed: ${err.message}`);
    process.exit(1);
  }
  try {
    logger.info('Testing Semantic Search ("free cooking gas cylinders for poor women")...');
    const response = await fetch(
      `${API_URL}/schemes?search=free cooking gas cylinders for poor women&searchType=semantic&limit=3`
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    logger.info(`Semantic search results returned ${data.schemes.length} schemes.`);
    data.schemes.forEach((s, idx) => {
      logger.info(`[Rank ${idx + 1}] Similarity: ${s.similarityScore.toFixed(4)} - ${s.title}`);
    });
    if (data.schemes.length === 0 || !data.schemes[0].similarityScore) {
      throw new Error('Semantic similarity scores missing or empty results!');
    }
  } catch (err) {
    logger.error(`Semantic search failed: ${err.message}`);
    process.exit(1);
  }
  try {
    const baseResponse = await fetch(`${API_URL}/schemes?limit=1`);
    const baseData = await baseResponse.json();
    const testSchemeId = baseData.schemes[0]._id;
    logger.info(`Testing Single Scheme Cache for Scheme ID: ${testSchemeId}...`);
    const res1 = await fetch(`${API_URL}/schemes/${testSchemeId}`);
    const data1 = await res1.json();
    const redisValue = await redisClient.get(`scheme:${testSchemeId}`);
    logger.info(`Redis check for scheme:${testSchemeId}: ${redisValue ? 'Found in Redis!' : 'Missing in Redis!'}`);
    if (!redisValue) throw new Error('Scheme was not written to Redis cache on read!');
    const res2 = await fetch(`${API_URL}/schemes/${testSchemeId}`);
    const data2 = await res2.json();
    if (data1.scheme.title !== data2.scheme.title) {
      throw new Error('Mismatched scheme details returned in cache verify!');
    }
    logger.info('Redis single item cache verified successfully.');
  } catch (err) {
    logger.error(`Caching test failed: ${err.message}`);
    process.exit(1);
  }
  await mongoose.disconnect();
  await redisClient.disconnect();
  logger.info('Scheme Search, Filtering & Caching Integration Tests Finished Successfully!');
  process.exit(0);
};
runSchemeTest();