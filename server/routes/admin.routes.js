import express from 'express';
import { protect, restrictTo } from '../middleware/auth.js';
import { getAuditLogs, getAnalytics } from '../controllers/admin.controller.js';

const router = express.Router();

// Administrative metrics (Admins and Officers can view system stats)
router.get('/analytics', protect, restrictTo('officer', 'admin'), getAnalytics);

// System security audit logs (Only Super Admins can access)
router.get('/audit-logs', protect, restrictTo('admin'), getAuditLogs);

export default router;
