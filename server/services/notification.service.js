import notificationRepository from '../repositories/NotificationRepository.js';
import { getIo } from '../socket/index.js';
import logger from '../config/logger.js';
class NotificationService {
  async sendNotification(userId, type, message, relatedEntity = null) {
    try {
      const notification = await notificationRepository.create({
        targetUser: userId,
        type,
        message,
        relatedEntity,
      });
      logger.info(`Saved notification in DB for user ${userId}: "${message}"`);
      try {
        const io = getIo();
        io.to(`user:${userId}`).emit('notification', notification);
        logger.info(`Dispatched Socket.IO notification alert to user room: user:${userId}`);
      } catch (socketError) {
        logger.debug(`Socket.IO not ready or offline: ${socketError.message}`);
      }
      return notification;
    } catch (error) {
      logger.error(`Failed to send notification: ${error.message}`);
      throw error;
    }
  }
  async broadcastNotification(type, message, relatedEntity = null) {
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