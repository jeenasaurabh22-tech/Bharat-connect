import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  chatWithAssistant,
  clearChatHistory,
  getChatHistoryController,
  explainSchemeEligibility,
  explainJargon,
  summarizeNotification,
} from '../controllers/ai.controller.js';
const router = express.Router();
router.post('/chat', protect, chatWithAssistant);
router.get('/chat/history', protect, getChatHistoryController);
router.post('/clear-chat', protect, clearChatHistory);
router.delete('/chat/history', protect, clearChatHistory);
router.post('/explain-eligibility', protect, explainSchemeEligibility);
router.post('/eligibility', protect, explainSchemeEligibility);
router.post('/explain-jargon', explainJargon);
router.post('/jargon', explainJargon);
router.post('/summarize-notification', summarizeNotification);
export default router;