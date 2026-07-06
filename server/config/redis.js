import { createClient } from 'redis';
import dotenv from 'dotenv';
import logger from './logger.js';
dotenv.config();
let rawRedisUrl = process.env.REDIS_URL;
if (rawRedisUrl && (rawRedisUrl.includes('redis://') || rawRedisUrl.includes('rediss://'))) {
  const match = rawRedisUrl.match(/(rediss?:\/\/[^\s'"]+)/);
  if (match) {
    rawRedisUrl = match[1];
  }
}
const redisClient = rawRedisUrl
  ? createClient({ url: rawRedisUrl })
  : createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      },
      password: process.env.REDIS_PASSWORD || undefined,
    });
redisClient.on('connect', () => {
  logger.info('Redis client connecting...');
});
redisClient.on('ready', () => {
  logger.info('Redis client connected and ready.');
});
redisClient.on('error', (err) => {
  logger.error(`Redis Client Error: ${err.message}`);
});
redisClient.on('end', () => {
  logger.info('Redis client connection closed.');
});
export const connectRedis = async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    logger.error(`Failed to connect to Redis: ${error.message}`);
  }
};
export default redisClient;