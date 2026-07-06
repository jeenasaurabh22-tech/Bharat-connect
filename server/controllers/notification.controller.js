import notificationRepository from '../repositories/NotificationRepository.js';
import ApiError from '../utils/ApiError.js';
export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await notificationRepository.findAllByUserId(req.user._id);
    res.status(200).json({ notifications });
  } catch (error) {
    next(error);
  }
};
export const markNotificationRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await notificationRepository.findById(id);
    if (!notification) {
      return next(new ApiError(404, 'Notification not found'));
    }
    if (notification.targetUser.toString() !== req.user._id.toString()) {
      return next(new ApiError(403, 'Unauthorized to access this notification'));
    }
    notification.isRead = true;
    await notification.save();
    res.status(200).json({ message: 'Notification marked as read', notification });
  } catch (error) {
    next(error);
  }
};
export const markAllNotificationsRead = async (req, res, next) => {
  try {
    await notificationRepository.markAllAsReadForUser(req.user._id);
    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};