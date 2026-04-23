const Query = require('../models/Query');
const { queryAI } = require('../services/aiProxy');
const { queryGroq } = require('../services/groqService');
const { detectLanguage } = require('../services/aiProxy');
const env = require('../config/env');
const { success, created, badRequest, notFound } = require('../utils/responseHelper');

/**
 * Offline fallback responses for when AI engine is unavailable
 */
const offlineFallbacks = {
  en: {
    agriculture: "I'm in offline mode. Here's a quick tip: For best crop yields, ensure proper soil testing before sowing and use organic fertilizers when possible.",
    health: "I'm in offline mode. Remember: Wash hands regularly, drink clean water, and consult a doctor for any persistent symptoms.",
    schemes: "I'm in offline mode. Check the Schemes page for available government schemes that you can browse offline.",
    mandi: "I'm in offline mode. Check the Mandi Prices page for cached price data.",
    general: "I'm in offline mode. Please reconnect to the internet for full AI assistance. In the meantime, explore the available offline features.",
  },
  hi: {
    agriculture: "मैं ऑफ़लाइन मोड में हूं। एक त्वरित सुझाव: बुवाई से पहले मिट्टी की जांच करें और जैविक खाद का उपयोग करें।",
    health: "मैं ऑफ़लाइन मोड में हूं। याद रखें: नियमित रूप से हाथ धोएं, साफ पानी पिएं और किसी भी लगातार लक्षण के लिए डॉक्टर से परामर्श लें।",
    schemes: "मैं ऑफ़लाइन मोड में हूं। उपलब्ध सरकारी योजनाओं के लिए योजना पृष्ठ देखें।",
    mandi: "मैं ऑफ़लाइन मोड में हूं। कैश्ड मूल्य डेटा के लिए मंडी मूल्य पृष्ठ देखें।",
    general: "मैं ऑफ़लाइन मोड में हूं। कृपया पूर्ण AI सहायता के लिए इंटरनेट से पुनः कनेक्ट करें।",
  },
  kn: {
    agriculture: "ನಾನು ಆಫ್‌ಲೈನ್ ಮೋಡ್‌ನಲ್ಲಿದ್ದೇನೆ. ತ್ವರಿತ ಸಲಹೆ: ಬಿತ್ತನೆ ಮಾಡುವ ಮೊದಲು ಮಣ್ಣು ಪರೀಕ್ಷೆ ಮಾಡಿಸಿ ಮತ್ತು ಸಾವಯವ ಗೊಬ್ಬರಗಳನ್ನು ಬಳಸಿ.",
    health: "ನಾನು ಆಫ್‌ಲೈನ್ ಮೋಡ್‌ನಲ್ಲಿದ್ದೇನೆ. ನೆನಪಿಡಿ: ನಿಯಮಿತವಾಗಿ ಕೈ ತೊಳೆಯಿರಿ, ಶುದ್ಧ ನೀರು ಕುಡಿಯಿರಿ ಮತ್ತು ಯಾವುದೇ ರೋಗ ಲಕ್ಷಣಗಳಿಗೆ ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ.",
    schemes: "ನಾನು ಆಫ್‌ಲೈನ್ ಮೋಡ್‌ನಲ್ಲಿದ್ದೇನೆ. ಲಭ್ಯವಿರುವ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳಿಗಾಗಿ ಯೋಜನೆಗಳ ಪುಟವನ್ನು ನೋಡಿ.",
    mandi: "ನಾನು ಆಫ್‌ಲೈನ್ ಮೋಡ್‌ನಲ್ಲಿದ್ದೇನೆ. ಕ್ಯಾಶ್ ಮಾಡಿದ ಬೆಲೆ ಡೇಟಾಕ್ಕಾಗಿ ಮಂಡಿ ಬೆಲೆಗಳ ಪುಟವನ್ನು ನೋಡಿ.",
    general: "ನಾನು ಆಫ್‌ಲೈನ್ ಮೋಡ್‌ನಲ್ಲಿದ್ದೇನೆ. ಸಂಪೂರ್ಣ AI ಸಹಾಯಕ್ಕಾಗಿ ದಯವಿಟ್ಟು ಇಂಟರ್ನೆಟ್‌ಗೆ ಮರುಸಂಪರ್ಕಿಸಿ.",
  },
};

/**
 * Process a chat query
 */
const processQuery = async (req, res, next) => {
  try {
    const { question, language = 'en', category = 'general', useGroq = false } = req.body;
    const userId = req.user?.id;

    let aiResponse;
    let source = 'ai-engine';
    let confidence = 0;

    // Primary: Try Groq AI first (intelligent LLM responses)
    try {
      if (env.groqApiKey) {
        aiResponse = await queryGroq(question, language, category);
        source = 'groq-ai';
        confidence = aiResponse.confidence || 0.85;
      } else {
        throw new Error('Groq API key not configured');
      }
    } catch (groqError) {
      console.log('Groq AI unavailable, trying AI Engine:', groqError.message);
      try {
        aiResponse = await queryAI(question, language, category);
        source = 'ai-engine';
        confidence = aiResponse.confidence || 0;
      } catch (aiError) {
        // Final fallback to offline response
        console.log('AI Engine unavailable, using offline fallback:', aiError.message);
        source = 'offline-fallback';
        confidence = 0.3;
        aiResponse = {
          answer: offlineFallbacks[language]?.[category] || offlineFallbacks.en.general,
          category,
          relatedQuestions: [],
        };
      }
    }

    // Save query to database if user is authenticated
    if (userId) {
      try {
        await Query.create({
          userId,
          question,
          response: aiResponse.answer,
          language,
          category: aiResponse.category || category,
          confidence,
          source,
        });
      } catch (dbError) {
        console.error('Failed to save query to DB:', dbError.message);
        // Don't fail the request if DB save fails
      }
    }

    return success(res, {
      response: aiResponse.answer,
      confidence,
      category: aiResponse.category || category,
      source,
      relatedQuestions: aiResponse.relatedQuestions || [],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get user's chat history
 */
const getHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, category, saved } = req.query;

    const query = { userId };
    if (category) query.category = category;
    if (saved === 'true') query.isSaved = true;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Query.countDocuments(query);

    const queries = await Query.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    return success(res, { queries }, 'History retrieved', 200, {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Save/unsave a query
 */
const toggleSave = async (req, res, next) => {
  try {
    const query = await Query.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!query) {
      return notFound(res, 'Query not found');
    }

    query.isSaved = !query.isSaved;
    await query.save();

    return success(res, { query }, query.isSaved ? 'Query saved' : 'Query unsaved');
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a query
 */
const deleteQuery = async (req, res, next) => {
  try {
    const query = await Query.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!query) {
      return notFound(res, 'Query not found');
    }

    return success(res, null, 'Query deleted');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  processQuery,
  getHistory,
  toggleSave,
  deleteQuery,
};
