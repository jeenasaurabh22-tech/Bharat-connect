import api from './api.js';
export const chatWithAssistant = async (message) => {
  const response = await api.post('/ai/chat', { message });
  return response.data;
};
export const getChatHistory = async () => {
  const response = await api.get('/ai/chat/history');
  return response.data;
};
export const clearChatHistory = async () => {
  const response = await api.delete('/ai/chat/history');
  return response.data;
};
export const explainSchemeEligibility = async (schemeId) => {
  const response = await api.post('/ai/eligibility', { schemeId });
  return response.data;
};
export const explainJargon = async (term) => {
  const response = await api.post('/ai/jargon', { term });
  return response.data;
};
export const translateSchemeContent = async (title, description, benefits, targetLanguage) => {
  const response = await api.post('/ai/translate', { title, description, benefits, targetLanguage });
  return response.data;
};