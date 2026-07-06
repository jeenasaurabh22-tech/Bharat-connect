import { Worker } from 'bullmq';
import { queueConnection } from '../config/queue.js';
import emailService from '../services/email.service.js';
import logger from '../config/logger.js';
const emailWorker = new Worker(
  'email-queue',
  async (job) => {
    const { type, email, otp, to, subject, html, text } = job.data;
    logger.info(`Processing email job ${job.id} of type [${type || 'generic'}]`);
    if (type === 'verification') {
      await emailService.sendVerificationOTP(email, otp);
    } else if (type === 'reset') {
      await emailService.sendPasswordResetOTP(email, otp);
    } else {
      await emailService.sendEmail({ to, subject, html, text });
    }
  },
  {
    connection: queueConnection,
    concurrency: 5,
  }
);
emailWorker.on('completed', (job) => {
  logger.info(`Email job ${job.id} has completed successfully.`);
});
emailWorker.on('failed', (job, err) => {
  logger.error(`Email job ${job.id} failed with error: ${err.message}`);
});
export default emailWorker;