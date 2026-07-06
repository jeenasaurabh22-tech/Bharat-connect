import express from 'express';
import { protect, restrictTo } from '../middleware/auth.js';
import { getAuditLogs, getAnalytics } from '../controllers/admin.controller.js';
const router = express.Router();
router.get('/analytics', protect, restrictTo('officer', 'admin'), getAnalytics);
router.get('/audit-logs', protect, restrictTo('admin'), getAuditLogs);
export default router;