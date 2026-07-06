import { Queue } from 'bullmq';
import { queueConnection } from '../config/queue.js';
import logger from '../config/logger.js';
const emailQueue = new Queue('email-queue', {
  connection: queueConnection,
});
export const addEmailJob = async (emailData) => {
  try {
    const job = await emailQueue.add('send-email', emailData, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
    });
    logger.info(`Added email job ${job.id} to queue for ${emailData.to}`);
    return job;
  } catch (error) {
    logger.error(`Failed to add email job to queue: ${error.message}`);
    throw error;
  }
};
export default emailQueue;