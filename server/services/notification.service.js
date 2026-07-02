import notificationRepository from '../repositories/NotificationRepository.js';
import { getIo } from '../socket/index.js';
import logger from '../config/logger.js';

class NotificationService {
  /**
   * Create and send a notification to a specific user
   * @param {string} userId - Target User ID
   * @param {string} type - Notification Type ('Scheme Update' | 'Application Status' | 'Verification Alert' | 'System Alert')
   * @param {string} message - Notification Message
   * @param {object} [relatedEntity] - Optional related database entity reference (entityId, entityModel)
   */
  async sendNotification(userId, type, message, relatedEntity = null) {
    try {
      // 1. Save notification in Database
      const notification = await notificationRepository.create({
        targetUser: userId,
        type,
        message,
        relatedEntity,
      });

      logger.info(`Saved notification in DB for user ${userId}: "${message}"`);

      // 2. Emit real-time socket event if Socket.IO is initialized
      try {
        const io = getIo();
        io.to(`user:${userId}`).emit('notification', notification);
        logger.info(`Dispatched Socket.IO notification alert to user room: user:${userId}`);
      } catch (socketError) {
        // Log but don't fail, as socket might not be attached in test or CLI scripts
        logger.debug(`Socket.IO not ready or offline: ${socketError.message}`);
      }

      return notification;
    } catch (error) {
      logger.error(`Failed to send notification: ${error.message}`);
      throw error;
    }
  }

  /**
   * Broadcast a system-wide notification to all users
   */
  async broadcastNotification(type, message, relatedEntity = null) {
    // Currently, we don't save a single broadcast notification record for everyone (that would bloat DB).
    // Instead, we just emit a real-time socket message to everyone or we can save it for admins.
    try {
      const io = getIo();
      io.emit('broadcast_notification', { type, message, relatedEntity, createdAt: new Date() });
      logger.info(`Broadcasted system notification to all sockets: "${message}"`);
    } catch (socketError) {
      logger.debug(`Socket.IO broadcast failed: ${socketError.message}`);
    }
  }
}

export default new NotificationService();
