import geminiService from '../services/gemini.service.js';
import cacheService from '../services/cache.service.js';
import schemeRepository from '../repositories/SchemeRepository.js';
import documentRepository from '../repositories/DocumentRepository.js';
import ApiError from '../utils/ApiError.js';
import logger from '../config/logger.js';

// Helper to get chat history from Redis
const getChatHistory = async (userId) => {
  const historyKey = `chat:history:${userId}`;
  const history = await cacheService.get(historyKey);
  return history || [];
};

// Helper to save chat history in Redis with a 24-hour expiration
const saveChatHistory = async (userId, history) => {
  const historyKey = `chat:history:${userId}`;
  // Keep only the last 20 messages to avoid token bloat
  const trimmedHistory = history.slice(-20);
  await cacheService.set(historyKey, trimmedHistory, 86400);
};

export const chatWithAssistant = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message) {
      return next(new ApiError(400, 'Message is required'));
    }

    const userId = req.user._id;
    const userProfile = req.user.profile;
    const userName = req.user.name;

    // Fetch user's active documents to give the chatbot context about what documents they have
    const activeDocs = await documentRepository.findActiveByCitizenId(userId);
    const docTypes = activeDocs.map((doc) => doc.documentType).join(', ') || 'None';

    const systemInstruction = `
      You are BharatConnect AI, a helpful, intelligent virtual assistant for Indian citizens.
      Your goal is to guide citizens in discovering government schemes, understanding eligibility, and managing documents.
      
      User Info:
      - Name: ${userName}
      - Age: ${userProfile.age || 'Not specified'}
      - State: ${userProfile.state || 'Not specified'}
      - Income: Rs. ${userProfile.annualIncome || 'Not specified'} per year
      - Gender: ${userProfile.gender || 'Not specified'}
      - Category: ${userProfile.category || 'General'}
      - Disability Status: ${userProfile.isDisabled ? 'Disabled' : 'No Disability'}
      - Uploaded Documents: [${docTypes}]
      
      Guidelines:
      1. Always speak in a polite, supportive, and formal yet friendly tone.
      2. If asked about a scheme, provide accurate guidance.
      3. Encourage users to upload missing documents (like Aadhaar, PAN, Income or Caste certificates) to check eligibility.
      4. Avoid guessing scheme deadlines; warn them to check the official links.
      5. Keep responses concise, well-formatted (using markdown bullet points), and easy to understand for common citizens.
    `;

    // Retrieve previous chat history
    const history = await getChatHistory(userId);

    // Get response from Gemini
    const aiResponse = await geminiService.generateChatResponse(
      history,
      message,
      systemInstruction
    );

    // Save updated history
    const updatedHistory = [
      ...history,
      { role: 'user', parts: message },
      { role: 'model', parts: aiResponse },
    ];
    await saveChatHistory(userId, updatedHistory);

    res.status(200).json({
      reply: aiResponse,
    });
  } catch (error) {
    next(error);
  }
};

export const clearChatHistory = async (req, res, next) => {
  try {
    const historyKey = `chat:history:${req.user._id}`;
    await cacheService.del(historyKey);
    res.status(200).json({ message: 'Chat history cleared successfully' });
  } catch (error) {
    next(error);
  }
};

export const explainSchemeEligibility = async (req, res, next) => {
  try {
    const { schemeId } = req.body;
    if (!schemeId) {
      return next(new ApiError(400, 'Scheme ID is required'));
    }

    const scheme = await schemeRepository.findById(schemeId);
    if (!scheme) {
      return next(new ApiError(404, 'Scheme not found'));
    }

    const userId = req.user._id;
    const userProfile = req.user.profile;

    // Fetch user documents to see if they have the required documents
    const activeDocs = await documentRepository.findActiveByCitizenId(userId);
    const uploadedDocTypes = activeDocs.map((d) => d.documentType);

    // Construct prompt with details
    const prompt = `
      Evaluate the eligibility of this citizen for the scheme:
      
      Scheme: ${scheme.title}
      Description: ${scheme.description}
      Stated Benefits: ${scheme.benefits}
      Required Documents: [${scheme.requiredDocuments.join(', ')}]
      Eligibility Rules:
      - Max Income Limit: ${scheme.eligibilityRules.maxIncome || 'No Limit'}
      - Min Age Limit: ${scheme.eligibilityRules.minAge || 'No Limit'}
      - Max Age Limit: ${scheme.eligibilityRules.maxAge || 'No Limit'}
      - Allowed Genders: ${scheme.eligibilityRules.genders.join(', ') || 'All'}
      - Allowed Caste Categories: ${scheme.eligibilityRules.categories.join(', ') || 'All'}
      - Allowed States: ${scheme.eligibilityRules.states.join(', ') || 'All'}
      - Disability Required: ${scheme.eligibilityRules.disabilityRequired ? 'Yes' : 'No'}

      Citizen Profile:
      - Age: ${userProfile.age || 'Not specified'}
      - Gender: ${userProfile.gender || 'Not specified'}
      - Annual Income: Rs. ${userProfile.annualIncome || 'Not specified'}
      - State of Residence: ${userProfile.state || 'Not specified'}
      - Category: ${userProfile.category || 'General'}
      - Disability Status: ${userProfile.isDisabled ? 'Disabled' : 'No Disability'}
      - Uploaded Documents: [${uploadedDocTypes.join(', ')}]

      Please:
      1. Calculate an Eligibility Status: "Eligible", "Likely Eligible", "Ineligible", or "Needs Information".
      2. Provide a simple, clear, bulleted breakdown of why they qualify or why they do not.
      3. List which of the required documents they have uploaded and which ones are STILL MISSING.
      4. Provide clear next steps to apply.
    `;

    const systemInstruction = `
      You are an expert Government Scheme Consultant. Your job is to analyze eligibility parameters strictly and explain them in simple terms.
      Format the output in a clean JSON structure:
      {
        "status": "Eligible" | "Likely Eligible" | "Ineligible" | "Needs Information",
        "explanation": "Markdown bullet points explaining matching/mismatched parameters",
        "matchingDocuments": ["Document Names"],
        "missingDocuments": ["Document Names"],
        "nextSteps": "What the user should do next"
      }
      Do NOT include any markdown code wrappers (like \`\`\`json) in your raw output. Return ONLY the JSON object.
    `;

    const aiResponse = await geminiService.generateContent(prompt, systemInstruction);

    // Safely parse JSON from AI
    let parsedResult;
    try {
      // Clean string in case Gemini includes markdown formatting
      const cleanJson = aiResponse.trim().replace(/^```json/, '').replace(/```$/, '').trim();
      parsedResult = JSON.parse(cleanJson);
    } catch (parseError) {
      logger.error(`Failed to parse eligibility JSON from Gemini: ${parseError.message}`);
      // Fallback response structure
      parsedResult = {
        status: 'Needs Information',
        explanation: aiResponse,
        matchingDocuments: [],
        missingDocuments: scheme.requiredDocuments,
        nextSteps: 'Please ensure your profile is fully complete and documents are uploaded.',
      };
    }

    res.status(200).json(parsedResult);
  } catch (error) {
    next(error);
  }
};

export const explainJargon = async (req, res, next) => {
  try {
    const { term } = req.body;
    if (!term) {
      return next(new ApiError(400, 'Term is required'));
    }

    const prompt = `Explain the following Indian government/legal term in simple terms for a common citizen: "${term}"`;
    const systemInstruction = `
      Explain government terms, acronyms, or clauses (e.g. "creamy layer OBC", "pucca house", "DBT", "domicile") in simple language.
      Keep it under 3 sentences. Use examples if helpful.
    `;

    const explanation = await geminiService.generateContent(prompt, systemInstruction);
    res.status(200).json({ term, explanation });
  } catch (error) {
    next(error);
  }
};

export const summarizeNotification = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) {
      return next(new ApiError(400, 'Notification text is required'));
    }

    const prompt = `Summarize this government notification or scheme announcement in simple terms: \n\n${text}`;
    const systemInstruction = `
      Create a bulleted summary of complex government circulars or notices.
      Highlight only:
      1. What changed / What is the announcement
      2. Who is affected / Beneficiary target
      3. Deadlines or key dates
      Keep it very readable.
    `;

    const summary = await geminiService.generateContent(prompt, systemInstruction);
    res.status(200).json({ summary });
  } catch (error) {
    next(error);
  }
};
