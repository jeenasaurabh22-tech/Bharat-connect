import BaseRepository from './BaseRepository.js';
import Notification from '../models/Notification.model.js';

class NotificationRepository extends BaseRepository {
  constructor() {
    super(Notification);
  }

  async findUnreadByUserId(userId) {
    return this.find({ targetUser: userId, isRead: false }, '', { createdAt: -1 });
  }

  async findAllByUserId(userId, limit = 20) {
    return this.find({ targetUser: userId }, '', { createdAt: -1 }, limit);
  }

  async markAsRead(notificationId) {
    return this.update(notificationId, { isRead: true });
  }

  async markAllAsReadForUser(userId) {
    return this.model.updateMany({ targetUser: userId, isRead: false }, { isRead: true }).exec();
  }
}

export default new NotificationRepository();
