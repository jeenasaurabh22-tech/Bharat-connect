import mongoose from 'mongoose';
const AuditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      index: true,
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { createdAt: 'timestamp', updatedAt: false },
  }
);
const AuditLog = mongoose.model('AuditLog', AuditLogSchema);
export default AuditLog;