import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  chatWithAssistant,
  clearChatHistory,
  explainSchemeEligibility,
  explainJargon,
  summarizeNotification,
} from '../controllers/ai.controller.js';

const router = express.Router();

router.post('/chat', protect, chatWithAssistant);
router.post('/clear-chat', protect, clearChatHistory);
router.post('/explain-eligibility', protect, explainSchemeEligibility);
router.post('/explain-jargon', explainJargon);
router.post('/summarize-notification', summarizeNotification);

export default router;
