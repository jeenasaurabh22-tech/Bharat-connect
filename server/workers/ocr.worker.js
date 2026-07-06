import { Worker } from 'bullmq';
import { queueConnection } from '../config/queue.js';
import documentRepository from '../repositories/DocumentRepository.js';
import ocrService from '../services/ocr.service.js';
import logger from '../config/logger.js';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import notificationService from '../services/notification.service.js';
const initWorkerDb = async () => {
  if (mongoose.connection.readyState === 0) {
    await connectDB();
  }
};
const ocrWorker = new Worker(
  'ocr-queue',
  async (job) => {
    logger.info(`Processing OCR job ${job.id} for document ${job.data.documentId}`);
    const { documentId, filePath, documentType } = job.data;
    await initWorkerDb();
    const document = await documentRepository.findById(documentId);
    if (!document) {
      logger.error(`OCR Worker: Document ${documentId} not found in database.`);
      return;
    }
    try {
      const ocrResult = await ocrService.extractText(filePath);
      const { parsedFields, missingInfoDetected } = ocrService.parseDocumentData(documentType, ocrResult.text);
      const hasCriticalInfoMissing = missingInfoDetected.length > 0;
      const status = hasCriticalInfoMissing ? 'Flagged' : 'Verified';
      document.verifiedStatus = status;
      document.ocrMetadata = {
        parsedFields,
        confidence: ocrResult.confidence,
        rawText: ocrResult.text,
        missingInfoDetected,
      };
      await document.save();
      logger.info(`OCR Worker: Document ${documentId} processed. Status set to ${status}.`);
      const alertMsg = status === 'Verified'
        ? `Your ${documentType} was successfully verified.`
        : `Your ${documentType} was flagged. Missing information detected: ${missingInfoDetected.join(', ')}`;
      await notificationService.sendNotification(
        document.citizen,
        'Verification Alert',
        alertMsg,
        { entityId: document._id, entityModel: 'Document' }
      );
    } catch (err) {
      logger.error(`OCR Worker processing failed: ${err.message}`);
      document.verifiedStatus = 'Flagged';
      await document.save();
      await notificationService.sendNotification(
        document.citizen,
        'Verification Alert',
        `OCR analysis failed for your ${documentType}. Please re-upload a clear file.`,
        { entityId: documentId, entityModel: 'Document' }
      );
      throw err;
    }
  },
  {
    connection: queueConnection,
    concurrency: 2,
  }
);
ocrWorker.on('completed', (job) => {
  logger.info(`OCR job ${job.id} completed successfully.`);
});
ocrWorker.on('failed', (job, err) => {
  logger.error(`OCR job ${job.id} failed: ${err.message}`);
});
export default ocrWorker;