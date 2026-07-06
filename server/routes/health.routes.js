import express from 'express';
import mongoose from 'mongoose';
import redisClient from '../config/redis.js';
const router = express.Router();
router.get('/', async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'up' : 'down';
  let redisStatus = 'down';
  try {
    if (redisClient.isOpen) {
      await redisClient.ping();
      redisStatus = 'up';
    }
  } catch (error) {
    redisStatus = `down: ${error.message}`;
  }
  const status = dbStatus === 'up' && redisStatus === 'up' ? 200 : 503;
  res.status(status).json({
    status: status === 200 ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    services: {
      database: dbStatus,
      cache: redisStatus,
    },
    uptime: process.uptime(),
  });
});
export default router;