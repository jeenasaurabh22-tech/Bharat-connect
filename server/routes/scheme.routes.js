import express from 'express';
import { protect, restrictTo } from '../middleware/auth.js';
import {
  getSchemes,
  getSchemeById,
  createScheme,
  updateScheme,
  deleteScheme,
} from '../controllers/scheme.controller.js';

const router = express.Router();

// Publicly readable scheme list & detail endpoints for discoverability
router.get('/', getSchemes);
router.get('/:id', getSchemeById);

// Admin-only write operations
router.post('/', protect, restrictTo('admin'), createScheme);
router.put('/:id', protect, restrictTo('admin'), updateScheme);
router.delete('/:id', protect, restrictTo('admin'), deleteScheme);

export default router;
