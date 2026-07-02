import { Queue } from 'bullmq';
import { queueConnection } from '../config/queue.js';
import logger from '../config/logger.js';

const ocrQueue = new Queue('ocr-queue', {
  connection: queueConnection,
});

export const addOcrJob = async (ocrData) => {
  try {
    const job = await ocrQueue.add('process-ocr', ocrData, {
      attempts: 2,
      backoff: {
        type: 'fixed',
        delay: 10000, // wait 10s before retrying
      },
    });
    logger.info(`Added OCR job ${job.id} to queue for document ${ocrData.documentId}`);
    return job;
  } catch (error) {
    logger.error(`Failed to add OCR job to queue: ${error.message}`);
    throw error;
  }
};

export default ocrQueue;
