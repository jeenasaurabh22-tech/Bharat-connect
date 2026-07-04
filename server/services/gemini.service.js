import { GoogleGenerativeAI } from '@google/generative-ai';
import logger from '../config/logger.js';
import dotenv from 'dotenv';

dotenv.config();

const hasApiKey =
  process.env.GEMINI_API_KEY &&
  process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here' &&
  process.env.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE';

let genAI = null;
if (hasApiKey) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  logger.info('Gemini Service: Google Gen AI client initialized.');
} else {
  logger.info('Gemini Service: Running in MOCK mode. Mock responses will be generated.');
}

class GeminiService {
  // Generate 768-dimension vector embedding using text-embedding-004
  async generateEmbedding(text) {
    if (!genAI) {
      // Mock embedding: Generate a deterministic vector based on text hashing
      logger.info('Gemini Service: Generating deterministic mock embedding...');
      const vector = [];
      let hash = 0;
      for (let i = 0; i < text.length; i++) {
        hash = text.charCodeAt(i) + ((hash << 5) - hash);
      }
      for (let i = 0; i < 768; i++) {
        const value = Math.sin(hash + i) * 0.5;
        vector.push(value);
      }
      return vector;
    }

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-embedding-2' });
      const result = await model.embedContent(text);
      if (result && result.embedding && result.embedding.values) {
        return result.embedding.values;
      }
      throw new Error('Invalid embedding response format');
    } catch (error) {
      logger.error(`Failed to generate Gemini embedding: ${error.message}`);
      throw error;
    }
  }

  // General text generation helper using gemini-1.5-flash
  async generateContent(prompt, systemInstruction = '') {
    if (!genAI) {
      logger.info('Gemini Service: Generating mock content response...');
      return `[Mock AI Response for prompt: "${prompt.substring(0, 50)}..."]\n\nBased on the mock evaluation, this citizen meets the eligible annual income, state, and age requirements. We suggest uploading your Caste Certificate to secure the benefits under the dynamic scheme profile.`;
    }

    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-3.5-flash',
        systemInstruction: systemInstruction || undefined,
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      logger.error(`Gemini generateContent failed: ${error.message}`);
      throw error;
    }
  }

  // Chat completion helper with history context using gemini-1.5-pro
  async generateChatResponse(history, newMessage, systemInstruction = '') {
    if (!genAI) {
      logger.info('Gemini Service: Generating mock chat response...');
      return `Thank you for your question. As an AI Assistant, I can confirm that for the Pradhan Mantri Awas Yojana, your annual income must be under Rs. 3,00,000 to qualify for the EWS category. Let me know if you would like me to review your uploaded income certificate!`;
    }

    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-3.5-flash',
        systemInstruction: systemInstruction || undefined,
      });

      const chat = model.startChat({
        history: history.map((msg) => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.parts }],
        })),
      });

      const result = await chat.sendMessage(newMessage);
      const response = await result.response;
      return response.text();
    } catch (error) {
      logger.error(`Gemini generateChatResponse failed: ${error.message}`);
      throw error;
    }
  }

  // Vector Cosine Similarity calculator
  cosineSimilarity(vecA, vecB) {
    let dotProduct = 0.0;
    let normA = 0.0;
    let normB = 0.0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}

export default new GeminiService();
