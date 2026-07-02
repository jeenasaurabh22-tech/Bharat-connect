import crypto from 'crypto';
import redisClient from '../config/redis.js';
import logger from '../config/logger.js';

class OtpService {
  // Generate a random 6-digit numeric OTP
  generateOTP() {
    return crypto.randomInt(100000, 999999).toString();
  }

  // Store OTP in Redis with a 5-minute (300 seconds) expiration time
  async storeOTP(email, otp) {
    const key = `otp:${email.toLowerCase()}`;
    try {
      await redisClient.setEx(key, 300, otp);
      logger.info(`Stored OTP in Redis for ${email}`);
      return true;
    } catch (error) {
      logger.error(`Error storing OTP in Redis: ${error.message}`);
      throw error;
    }
  }

  // Retrieve OTP and verify
  async verifyOTP(email, otp) {
    const key = `otp:${email.toLowerCase()}`;
    try {
      const storedOtp = await redisClient.get(key);
      if (!storedOtp) {
        logger.warn(`OTP verification failed: OTP expired or not found for ${email}`);
        return false;
      }
      
      const isMatch = storedOtp === otp;
      if (isMatch) {
        // Delete OTP from Redis once verified
        await redisClient.del(key);
        logger.info(`Verified & deleted OTP for ${email}`);
      } else {
        logger.warn(`OTP verification failed: Mismatched OTP for ${email}`);
      }
      return isMatch;
    } catch (error) {
      logger.error(`Error verifying OTP from Redis: ${error.message}`);
      throw error;
    }
  }
}

export default new OtpService();
