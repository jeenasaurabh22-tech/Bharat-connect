import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { connectRedis } from '../config/redis.js';
import redisClient from '../config/redis.js';
import User from '../models/User.model.js';
import Scheme from '../models/Scheme.model.js';
import logger from '../config/logger.js';
dotenv.config();
const runTest = async () => {
  try {
    logger.info('Starting DB & Redis Connection Test...');
    await connectDB();
    await connectRedis();
    if (redisClient.isOpen) {
      await redisClient.set('test_key', 'BharatConnect_AI_Ready');
      const val = await redisClient.get('test_key');
      logger.info(`Redis check successful. Read test_key: ${val}`);
      await redisClient.del('test_key');
    }
    const userCount = await User.countDocuments();
    const schemeCount = await Scheme.countDocuments();
    logger.info(`Database connectivity test succeeded.`);
    logger.info(`Current database stats - Users: ${userCount}, Schemes: ${schemeCount}`);
    await mongoose.disconnect();
    await redisClient.disconnect();
    logger.info('Test completed successfully and connections closed.');
    process.exit(0);
  } catch (error) {
    logger.error(`Test failed with error: ${error.message}`);
    process.exit(1);
  }
};
runTest();