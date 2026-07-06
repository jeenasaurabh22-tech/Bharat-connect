import express from 'express';
import { protect, restrictTo } from '../middleware/auth.js';
import { upload } from '../config/storage.js';
import {
  uploadDocument,
  getDocuments,
  deleteDocument,
  getAllDocuments,
  verifyDocumentByOfficer,
} from '../controllers/document.controller.js';
const router = express.Router();
router.post('/upload', protect, upload.single('file'), uploadDocument);
router.get('/', protect, getDocuments);
router.delete('/:id', protect, deleteDocument);
router.get('/all', protect, restrictTo('officer', 'admin'), getAllDocuments);
router.patch('/:id/verify', protect, restrictTo('officer', 'admin'), verifyDocumentByOfficer);
export default router;