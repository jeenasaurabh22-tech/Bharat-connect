import express from 'express';
import { protect, restrictTo } from '../middleware/auth.js';
import {
  submitApplication,
  getMyApplications,
  getApplications,
  getApplicationById,
  updateApplicationStatus,
} from '../controllers/application.controller.js';
const router = express.Router();
router.post('/', protect, submitApplication);
router.get('/my', protect, getMyApplications);
router.get('/:id', protect, getApplicationById);
router.get('/', protect, restrictTo('officer', 'admin'), getApplications);
router.patch('/:id/status', protect, restrictTo('officer', 'admin'), updateApplicationStatus);
export default router;