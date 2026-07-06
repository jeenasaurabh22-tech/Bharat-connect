import mongoose from 'mongoose';
const NotificationSchema = new mongoose.Schema(
  {
    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['Scheme Update', 'Application Status', 'Verification Alert', 'System Alert'],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    relatedEntity: {
      entityId: { type: mongoose.Schema.Types.ObjectId },
      entityModel: { type: String },
    },
  },
  {
    timestamps: true,
  }
);
const Notification = mongoose.model('Notification', NotificationSchema);
export default Notification;