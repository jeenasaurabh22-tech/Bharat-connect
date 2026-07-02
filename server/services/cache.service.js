import redisClient from '../config/redis.js';
import logger from '../config/logger.js';

class CacheService {
  // Get item from cache
  async get(key) {
    try {
      if (!redisClient.isOpen) return null;
      const data = await redisClient.get(key);
      if (data) {
        logger.debug(`Cache HIT for key: ${key}`);
        return JSON.parse(data);
      }
      logger.debug(`Cache MISS for key: ${key}`);
      return null;
    } catch (error) {
      logger.error(`Cache Get Error: ${error.message}`);
      return null;
    }
  }

  // Set item in cache with TTL (seconds)
  async set(key, value, ttl = 3600) {
    try {
      if (!redisClient.isOpen) return false;
      await redisClient.setEx(key, ttl, JSON.stringify(value));
      logger.debug(`Cache SET for key: ${key} with TTL: ${ttl}s`);
      return true;
    } catch (error) {
      logger.error(`Cache Set Error: ${error.message}`);
      return false;
    }
  }

  // Delete item from cache
  async del(key) {
    try {
      if (!redisClient.isOpen) return false;
      await redisClient.del(key);
      logger.debug(`Cache DEL for key: ${key}`);
      return true;
    } catch (error) {
      logger.error(`Cache Del Error: ${error.message}`);
      return false;
    }
  }

  // Clear all caches matching a prefix (e.g. schemes:search:*)
  async clearPrefix(prefix) {
    try {
      if (!redisClient.isOpen) return false;
      // Fetch keys using SCAN to prevent blocking the Redis event loop
      let cursor = 0;
      let count = 0;
      do {
        const reply = await redisClient.scan(cursor, {
          MATCH: `${prefix}*`,
          COUNT: 100,
        });
        cursor = reply.cursor;
        const keys = reply.keys;
        if (keys.length > 0) {
          await redisClient.del(keys);
          count += keys.length;
        }
      } while (cursor !== 0);

      logger.info(`Cleared ${count} cached items with prefix: ${prefix}`);
      return true;
    } catch (error) {
      logger.error(`Cache clearPrefix Error: ${error.message}`);
      return false;
    }
  }
}

export default new CacheService();
