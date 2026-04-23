const Groq = require('groq-sdk');
const env = require('../config/env');

/**
 * Groq AI Service
 * Provides intelligent responses using Groq's LLM API
 * Falls back gracefully if the API is unavailable
 */

const groq = new Groq({
  apiKey: env.groqApiKey,
});

/**
 * Language-specific boundary guards with refusal messages in the user's language
 */
const BOUNDARY_GUARDS = {
  en: `

CRITICAL RULES - YOU MUST FOLLOW BOTH:
1. LANGUAGE RULE: The user selected English. You MUST ALWAYS respond in English only. Never mix languages. Never switch to Hindi or Kannada.
2. SCOPE RULE: You are ONLY allowed to answer questions related to rural Indian services (agriculture, health, government schemes, mandi prices, rural life). If a user asks about ANY topic OUTSIDE these categories (coding, technology, entertainment, politics, sports, movies, general knowledge, mathematics, science unrelated to farming/health, etc.), you MUST politely refuse by saying: "I'm sorry, I can only assist with questions related to rural services like agriculture, health, government schemes, and market prices. Please ask me something about these topics." DO NOT answer questions outside your scope.`,

  hi: `

अनिवार्य नियम - आपको इनका पालन करना ही होगा:
1. भाषा नियम: उपयोगकर्ता ने हिंदी चुनी है। आपको केवल हिंदी में ही उत्तर देना है। कभी भी अंग्रेज़ी या कन्नड़ का उपयोग न करें।
2. दायरा नियम: आप केवल ग्रामीण भारतीय सेवाओं (कृषि, स्वास्थ्य, सरकारी योजनाएं, मंडी मूल्य, ग्रामीण जीवन) से संबंधित प्रश्नों का उत्तर दे सकते हैं। यदि कोई उपयोगकर्ता इन श्रेणियों से बाहर का प्रश्न पूछता है (कोडिंग, तकनीक, मनोरंजन, राजनीति, खेल, फिल्में, सामान्य ज्ञान, गणित, विज्ञान), तो आपको विनम्रतापूर्वक मना करना होगा: "क्षमा करें, मैं केवल कृषि, स्वास्थ्य, सरकारी योजनाओं और बाजार मूल्यों जैसी ग्रामीण सेवाओं से संबंधित प्रश्नों में सहायता कर सकता हूं। कृपया मुझसे इन विषयों के बारे में पूछें।" अपने दायरे से बाहर के प्रश्नों का उत्तर न दें।`,

  kn: `

ಕಡ್ಡಾಯ ನಿಯಮಗಳು - ನೀವು ಇವುಗಳನ್ನು ಪಾಲಿಸಲೇಬೇಕು:
1. ಭಾಷಾ ನಿಯಮ: ಬಳಕೆದಾರರು ಕನ್ನಡವನ್ನು ಆಯ್ಕೆ ಮಾಡಿದ್ದಾರೆ. ನೀವು ಕೇವಲ ಕನ್ನಡದಲ್ಲಿ ಮಾತ್ರ ಉತ್ತರಿಸಬೇಕು. ಎಂದಿಗೂ ಇಂಗ್ಲಿಷ್ ಅಥವಾ ಹಿಂದಿಯನ್ನು ಬಳಸಬೇಡಿ.
2. ವ್ಯಾಪ್ತಿ ನಿಯಮ: ನೀವು ಗ್ರಾಮೀಣ ಭಾರತೀಯ ಸೇವೆಗಳಿಗೆ (ಕೃಷಿ, ಆರೋಗ್ಯ, ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು, ಮಂಡಿ ಬೆಲೆಗಳು, ಗ್ರಾಮೀಣ ಜೀವನ) ಸಂಬಂಧಿಸಿದ ಪ್ರಶ್ನೆಗಳಿಗೆ ಮಾತ್ರ ಉತ್ತರಿಸಬಹುದು. ಬಳಕೆದಾರರು ಈ ವ್ಯಾಪ್ತಿಯ ಹೊರಗಿನ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಿದರೆ (ಕೋಡಿಂಗ್, ತಂತ್ರಜ್ಞಾನ, ಮನರಂಜನೆ, ರಾಜಕೀಯ, ಕ್ರೀಡೆ, ಚಲನಚಿತ್ರಗಳು, ಸಾಮಾನ್ಯ ಜ್ಞಾನ, ಗಣಿತ, ವಿಜ್ಞಾನ), ನೀವು ವಿನಮ್ರವಾಗಿ ನಿರಾಕರಿಸಬೇಕು: "ಕ್ಷಮಿಸಿ, ನಾನು ಕೃಷಿ, ಆರೋಗ್ಯ, ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು ಮತ್ತು ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳಂತಹ ಗ್ರಾಮೀಣ ಸೇವೆಗಳಿಗೆ ಸಂಬಂಧಿಸಿದ ಪ್ರಶ್ನೆಗಳಿಗೆ ಮಾತ್ರ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ. ದಯವಿಟ್ಟು ಈ ವಿಷಯಗಳ ಬಗ್ಗೆ ನನ್ನನ್ನು ಕೇಳಿ." ನಿಮ್ಮ ವ್ಯಾಪ್ತಿಯ ಹೊರಗಿನ ಪ್ರಶ್ನೆಗಳಿಗೆ ಉತ್ತರಿಸಬೇಡಿ.`,
};

const systemPrompts = {
  en: {
    agriculture: `You are GramaAI, an expert agricultural assistant for Indian farmers. Provide practical, actionable advice about farming techniques, crop management, pest control, soil health, irrigation, and fertilizers. Keep responses concise (2-3 paragraphs max), use simple language, and focus on Indian agricultural context. Include specific numbers/quantities where helpful.${BOUNDARY_GUARDS.en}`,
    health: `You are GramaAI, a rural health assistant for Indian villages. Provide basic health information, first aid tips, disease prevention advice, and guidance on when to visit a doctor. Keep responses simple and practical. Always recommend consulting a doctor for serious conditions.${BOUNDARY_GUARDS.en}`,
    schemes: `You are GramaAI, an expert on Indian government schemes for farmers and rural citizens. Provide accurate information about PM-KISAN, Fasal Bima Yojana, Ayushman Bharat, and other schemes. Include eligibility, benefits, and application steps.${BOUNDARY_GUARDS.en}`,
    mandi: `You are GramaAI, a market price assistant for Indian farmers. Provide information about Minimum Support Prices (MSP), mandi prices, and market trends for various crops. Note that prices vary by state and season.${BOUNDARY_GUARDS.en}`,
    general: `You are GramaAI, a helpful rural assistant for Indian farmers and villagers. Answer questions about agriculture, health, government schemes, and daily life in rural India. Be friendly, practical, and use simple language.${BOUNDARY_GUARDS.en}`,
  },
  hi: {
    agriculture: `आप GramaAI हैं, भारतीय किसानों के लिए एक कृषि विशेषज्ञ सहायक। कृषि तकनीकों, फसल प्रबंधन, कीट नियंत्रण, मिट्टी स्वास्थ्य, सिंचाई और उर्वरकों के बारे में व्यावहारिक सलाह दें। उत्तर संक्षिप्त रखें (अधिकतम 2-3 पैराग्राफ), सरल भाषा का उपयोग करें और भारतीय कृषि संदर्भ पर ध्यान दें।${BOUNDARY_GUARDS.hi}`,
    health: `आप GramaAI हैं, भारतीय गांवों के लिए एक ग्रामीण स्वास्थ्य सहायक। बुनियादी स्वास्थ्य जानकारी, प्राथमिक उपचार टिप्स, रोग निवारण सलाह और डॉक्टर से कब मिलना चाहिए इसकी जानकारी दें। गंभीर बीमारियों के लिए डॉक्टर से परामर्श की सलाह दें।${BOUNDARY_GUARDS.hi}`,
    schemes: `आप GramaAI हैं, भारतीय किसानों और ग्रामीण नागरिकों के लिए सरकारी योजनाओं के विशेषज्ञ। PM-KISAN, फसल बीमा योजना, आयुष्मान भारत और अन्य योजनाओं के बारे में सटीक जानकारी दें।${BOUNDARY_GUARDS.hi}`,
    mandi: `आप GramaAI हैं, भारतीय किसानों के लिए बाजार मूल्य सहायक। विभिन्न फसलों के न्यूनतम समर्थन मूल्य (MSP), मंडी मूल्य और बाजार रुझानों के बारे में जानकारी दें।${BOUNDARY_GUARDS.hi}`,
    general: `आप GramaAI हैं, भारतीय किसानों और ग्रामीणों के लिए एक सहायक सहायक। कृषि, स्वास्थ्य, सरकारी योजनाओं और ग्रामीण भारत में दैनिक जीवन के बारे में सवालों के जवाब दें। मैत्रीपूर्ण और व्यावहारिक बनें।${BOUNDARY_GUARDS.hi}`,
  },
  kn: {
    agriculture: `ನೀವು GramaAI, ಭಾರತೀಯ ರೈತರಿಗಾಗಿ ಕೃಷಿ ತಜ್ಞ ಸಹಾಯಕ. ಕೃಷಿ ತಂತ್ರಗಳು, ಬೆಳೆ ನಿರ್ವಹಣೆ, ಕೀಟ ನಿಯಂತ್ರಣ, ಮಣ್ಣಿನ ಆರೋಗ್ಯ, ನೀರಾವರಿ ಮತ್ತು ರಸಗೊಬ್ಬರಗಳ ಬಗ್ಗೆ ಪ್ರಾಯೋಗಿಕ ಸಲಹೆ ನೀಡಿ. ಉತ್ತರಗಳನ್ನು ಸಂಕ್ಷಿಪ್ತವಾಗಿ ಇರಿಸಿ (ಗರಿಷ್ಠ 2-3 ಪ್ಯಾರಾಗಳು), ಸರಳ ಭಾಷೆ ಬಳಸಿ.${BOUNDARY_GUARDS.kn}`,
    health: `ನೀವು GramaAI, ಭಾರತೀಯ ಗ್ರಾಮಗಳಿಗಾಗಿ ಗ್ರಾಮೀಣ ಆರೋಗ್ಯ ಸಹಾಯಕ. ಮೂಲ ಆರೋಗ್ಯ ಮಾಹಿತಿ, ಪ್ರಥಮ ಚಿಕಿತ್ಸೆ ಸಲಹೆಗಳು, ರೋಗ ತಡೆಗಟ್ಟುವಿಕೆ ಮತ್ತು ವೈದ್ಯರನ್ನು ಯಾವಾಗ ಭೇಟಿ ಮಾಡಬೇಕು ಎಂಬ ಮಾರ್ಗದರ್ಶನ ನೀಡಿ.${BOUNDARY_GUARDS.kn}`,
    schemes: `ನೀವು GramaAI, ಭಾರತೀಯ ರೈತರು ಮತ್ತು ಗ್ರಾಮೀಣ ನಾಗರಿಕರಿಗಾಗಿ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ತಜ್ಞ. PM-KISAN, ಫಸಲ್ ಬೀಮಾ ಯೋಜನೆ, ಆಯುಷ್ಮಾನ್ ಭಾರತ ಮತ್ತು ಇತರ ಯೋಜನೆಗಳ ಬಗ್ಗೆ ನಿಖರ ಮಾಹಿತಿ ನೀಡಿ.${BOUNDARY_GUARDS.kn}`,
    mandi: `ನೀವು GramaAI, ಭಾರತೀಯ ರೈತರಿಗಾಗಿ ಮಾರುಕಟ್ಟೆ ಬೆಲೆ ಸಹಾಯಕ. ವಿವಿಧ ಬೆಳೆಗಳ ಕನಿಷ್ಠ ಬೆಂಬಲ ಬೆಲೆ (MSP), ಮಂಡಿ ಬೆಲೆಗಳು ಮತ್ತು ಮಾರುಕಟ್ಟೆ ಪ್ರವೃತ್ತಿಗಳ ಬಗ್ಗೆ ಮಾಹಿತಿ ನೀಡಿ.${BOUNDARY_GUARDS.kn}`,
    general: `ನೀವು GramaAI, ಭಾರತೀಯ ರೈತರು ಮತ್ತು ಗ್ರಾಮಸ್ಥರಿಗಾಗಿ ಸಹಾಯಕ ಸಹಾಯಕ. ಕೃಷಿ, ಆರೋಗ್ಯ, ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು ಮತ್ತು ಗ್ರಾಮೀಣ ಭಾರತದ ದೈನಂದಿನ ಜೀವನದ ಬಗ್ಗೆ ಪ್ರಶ್ನೆಗಳಿಗೆ ಉತ್ತರಿಸಿ. ಸ್ನೇಹಪರ ಮತ್ತು ಪ್ರಾಯೋಗಿಕವಾಗಿರಿ.${BOUNDARY_GUARDS.kn}`,
  },
};

/**
 * Query Groq AI with the user's question
 * @param {string} question - User's question
 * @param {string} language - Language code (en, hi, kn)
 * @param {string} category - Category (agriculture, health, schemes, mandi, general)
 * @returns {Promise<{answer: string, confidence: number, category: string, relatedQuestions: string[]}>}
 */
const queryGroq = async (question, language = 'en', category = 'general') => {
  try {
    const systemPrompt = systemPrompts[language]?.[category] || systemPrompts.en.general;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: question,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.1, // Lower temperature for strict accuracy
      top_p: 0.9,
      stream: false,
    });

    let answer = completion.choices[0]?.message?.content || '';

    if (!answer) {
      throw new Error('Empty response from Groq');
    }

    // Language verification and translation fallback for non-English (Pure JS detection)
    if (language !== 'en') {
      try {
        // Pure JS Unicode-based detection (more reliable)
        const detectedLang = (() => {
          if (/[\\u0C80-\\u0CFF]/.test(answer)) return 'kn';  // Kannada
          if (/[\\u0900-\\u097F]/.test(answer)) return 'hi';  // Devanagari/Hindi
          return 'en';
        })();
        
        console.log(`Groq response detected as: ${detectedLang}, requested: ${language}`);
        
        if (detectedLang !== language) {
          console.log(`Translating response from ${detectedLang} to ${language}`);
          
          const languageNames = { hi: 'Hindi', kn: 'Kannada' };
          const translationPrompt = `Translate the following text accurately to ${languageNames[language]} while preserving meaning, context, and rural Indian terminology. Do not add extra information or explanations. Respond ONLY with the translation:

Text to translate: "${answer}"

Translation:`;

          const translationCompletion = await groq.chat.completions.create({
            messages: [
              {
                role: 'system',
                content: 'You are an accurate translator for rural Indian languages. Translate precisely without adding or omitting information.',
              },
              {
                role: 'user',
                content: translationPrompt,
              },
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.1,
            top_p: 0.9,
            stream: false,
          });

          answer = translationCompletion.choices[0]?.message?.content?.trim() || answer;
        }
      } catch (translationError) {
        console.error('Translation fallback failed, using original response:', translationError.message);
        // Keep original answer if translation fails
      }
    }

    // Generate related questions based on the category
    const relatedQuestions = getRelatedQuestions(category, language);

    return {
      answer,
      confidence: 0.85, // High confidence for LLM responses
      category,
      relatedQuestions,
    };
  } catch (error) {
    console.error('Groq API error:', error.message);
    throw error;
  }
};

/**
 * Get related questions for a category
 */
const getRelatedQuestions = (category, language) => {
  const questions = {
    en: {
      agriculture: [
        'What is the best fertilizer for wheat?',
        'How to control pests organically?',
        'What crops are suitable for sandy soil?',
        'How to improve soil fertility?',
      ],
      health: [
        'What are symptoms of malaria?',
        'How to purify drinking water?',
        'What vaccines are needed for children?',
        'How to treat minor burns at home?',
      ],
      schemes: [
        'How to apply for PM-KISAN?',
        'What is Ayushman Bharat scheme?',
        'How to get crop insurance?',
        'What is the Kisan Credit Card?',
      ],
      mandi: [
        'What is the MSP for paddy?',
        'Current market price for tomatoes?',
        'How to check mandi prices online?',
        'What affects crop prices?',
      ],
      general: [
        'Tell me about organic farming',
        'How to start a kitchen garden?',
        'What are the best water conservation methods?',
        'How to get a farmer ID card?',
      ],
    },
    hi: {
      agriculture: ['गेहूं के लिए सबसे अच्छा उर्वरक क्या है?', 'जैविक रूप से कीटों को कैसे नियंत्रित करें?'],
      health: ['मलेरिया के लक्षण क्या हैं?', 'पीने के पानी को कैसे शुद्ध करें?'],
      schemes: ['PM-KISAN के लिए आवेदन कैसे करें?', 'आयुष्मान भारत योजना क्या है?'],
      mandi: ['धान का MSP क्या है?', 'टमाटर का वर्तमान बाजार मूल्य?'],
      general: ['जैविक खेती के बारे में बताएं', 'किचन गार्डन कैसे शुरू करें?'],
    },
    kn: {
      agriculture: ['ಗೋಧಿಗೆ ಉತ್ತಮ ಗೊಬ್ಬರ ಯಾವುದು?', 'ಸಾವಯವವಾಗಿ ಕೀಟಗಳನ್ನು ಹೇಗೆ ನಿಯಂತ್ರಿಸುವುದು?'],
      health: ['ಮಲೇರಿಯಾದ ಲಕ್ಷಣಗಳು ಯಾವುವು?', 'ಕುಡಿಯುವ ನೀರನ್ನು ಹೇಗೆ ಶುದ್ಧೀಕರಿಸುವುದು?'],
      schemes: ['PM-KISAN ಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸುವುದು ಹೇಗೆ?', 'ಆಯುಷ್ಮಾನ್ ಭಾರತ ಯೋಜನೆ ಏನು?'],
      mandi: ['ಭತ್ತದ MSP ಎಷ್ಟು?', 'ಟೊಮೆಟೊದ ಪ್ರಸ್ತುತ ಮಾರುಕಟ್ಟೆ ಬೆಲೆ?'],
      general: ['ಸಾವಯವ ಕೃಷಿ ಬಗ್ಗೆ ತಿಳಿಸಿ', 'ಅಡುಗೆ ತೋಟವನ್ನು ಹೇಗೆ ಪ್ರಾರಂಭಿಸುವುದು?'],
    },
  };

  return questions[language]?.[category] || questions.en.general;
};

/**
 * Generate full page content based on category and location
 * @param {string} category 
 * @param {string} location 
 * @param {string} language 
 */
const generateLocationContent = async (category, location, language = 'en') => {
  try {
    const locString = location || 'India';
    const categoryPrompts = {
      en: {
        agriculture: `Provide the latest highly-accurate agricultural insights, best practices, crop cycles, and weather-related farming advice for ${locString}. Also add a YouTube search link for demo videos, formatted exactly as: [Watch related video on YouTube](https://www.youtube.com/results?search_query=topic+farming).`,
        schemes: `Detail the most relevant and active Indian government agricultural/rural schemes available for residents of ${locString}. You MUST include accurate official website URLs for every scheme. ALSO add a YouTube search link formatted exactly as: [Watch Demo Video on YouTube](https://www.youtube.com/results?search_query=how+to+apply+scheme+name).`,
        health: `Provide essential rural healthcare guidance, local disease prevention mechanisms, and general wellness advice tailored for ${locString}, India. Add a disclaimer to consult local doctors. Add a YouTube search link formatted exactly as: [Watch video on YouTube](https://www.youtube.com/results?search_query=healthy+habits+in+hindi).`,
        mandi: `Provide estimated current Mandi prices, Minimum Support Price (MSP) info, and market trends for major crops grown around ${locString}. Add a disclaimer that prices fluctuate.`,
      },
      hi: {
        agriculture: `${locString} के लिए नवीनतम कृषि तकनीकों, फसल चक्रों और मौसम से संबंधित कृषि सलाह प्रदान करें। कृपया इस प्रारूप में वीडियो लिंक भी जोड़ें: [Watch related video on YouTube](https://www.youtube.com/results?search_query=topic+farming+in+hindi).`,
        schemes: `${locString} के निवासियों के लिए उपलब्ध सबसे प्रासंगिक और सक्रिय भारतीय सरकारी कृषि/ग्रामीण योजनाओं का विवरण दें। आधिकारिक वेबसाइट लिंक और इस प्रारूप में एक वीडियो लिंक शामिल करें: [Watch Demo Video on YouTube](https://www.youtube.com/results?search_query=how+to+apply+scheme+name+in+hindi).`,
        health: `${locString}, भारत के लिए आवश्यक ग्रामीण स्वास्थ्य देखभाल मार्गदर्शन और रोग निवारण सलाह प्रदान करें। डॉक्टरों से परामर्श करने का डिस्क्लेमर जोड़ें। इसके साथ एक वीडियो लिंक जोड़ें: [Watch video on YouTube](https://www.youtube.com/results?search_query=health+tips+in+hindi).`,
        mandi: `${locString} के आसपास उगाई जाने वाली प्रमुख फसलों के लिए अनुमानित मण्डी भाव और न्यूनतम समर्थन मूल्य (MSP) की जानकारी दें।`,
      },
      kn: {
        agriculture: `${locString} ಗೆ ಇತ್ತೀಚಿನ ಕೃಷಿ ತಂತ್ರಗಳು, ಬೆಳೆ ಚಕ್ರಗಳು ಮತ್ತು ಹವಾಮಾನ ಆಧಾರಿತ ಕೃಷಿ ಸಲಹೆಗಳನ್ನು ಒದಗಿಸಿ. ಹಾಗೂ ಯೂಟ್ಯೂಬ್ ವಿಡಿಯೋ ಲಿಂಕ್ ಈ ರೀತಿ ಸೇರಿಸಿ: [Watch related video on YouTube](https://www.youtube.com/results?search_query=topic+farming+in+kannada).`,
        schemes: `${locString} ನಿವಾಸಿಗಳಿಗೆ ಲಭ್ಯವಿರುವ ಪ್ರಮುಖ ಭಾರತೀಯ ಸರ್ಕಾರಿ ಕೃಷಿ/ಗ್ರಾಮೀಣ ಯೋಜನೆಗಳನ್ನು ವಿವರಿಸಿ. ಅಧಿಕೃತ ವೆಬ್‌ಸೈಟ್ URL ಗಳನ್ನು ಮತ್ತು ವಿಡಿಯೋ ಲಿಂಕ್ ಈ ರೀತಿ ತಪ್ಪದೆ ಸೇರಿಸಿ: [Watch Demo Video on YouTube](https://www.youtube.com/results?search_query=how+to+apply+scheme+name+in+kannada).`,
        health: `${locString}, ಭಾರತಕ್ಕೆ ಅಗತ್ಯವಾದ ಗ್ರಾಮೀಣ ಆರೋಗ್ಯ ಮಾರ್ಗದರ್ಶನ ಮತ್ತು ರೋಗ ತಡೆಗಟ್ಟುವಿಕೆ ಸಲಹೆಗಳನ್ನು ನೀಡಿ. ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಲು ಸೂಚನೆ ಸೇರಿಸಿ. ವಿಡಿಯೋ ಲಿಂಕ್ ಸೇರಿಸಿ: [Watch video on YouTube](https://www.youtube.com/results?search_query=health+home+remedies+in+kannada).`,
        mandi: `${locString} ಸುತ್ತಮುತ್ತಲಿನ ಪ್ರಮುಖ ಬೆಳೆಗಳಿಗೆ ಅಂದಾಜು ಮಂಡಿ ಬೆಲೆಗಳು ಮತ್ತು ಕನಿಷ್ಠ ಬೆಂಬಲ ಬೆಲೆ (MSP) ಮಾಹಿತಿ ನೀಡಿ.`,
      }
    };

    const taskPrompt = categoryPrompts[language]?.[category] || categoryPrompts.en[category] || categoryPrompts.en.agriculture;
    const boundary = BOUNDARY_GUARDS[language] || BOUNDARY_GUARDS.en;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are GramaAI, a highly accurate automated assistant for Indian farmers. ${boundary}\n\nCRITICAL RULE: You must provide ONLY strictly factual and highly accurate information. NEVER hallucinate facts, numbers, schemes, or URLs. If you do not know the exact data, state that clearly instead of guessing.\n\nFormat your ENTIRE response beautifully using Markdown. You MUST structure your response utilizing visually appealing Markdown Tables for data (e.g. Crop Cycles, Prices, Schemes). IMPORTANT: Ensure Markdown tables have proper spacing and newlines so they render correctly. Liberally use relevant Emojis 🌾🚜💧 for sections to make it engaging. Use # Headers, ## Subheaders, bullet points, and bold text. For Mandi prices and MSP, use the most accurate recent agricultural season data you have; do not invent wildly inaccurate daily figures, but provide realistic baselines with a clear disclaimer.`
        },
        {
          role: 'user',
          content: taskPrompt,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.1, // Lower temperature for strict accuracy
      top_p: 0.9,
      stream: false,
    });

    let markdownContent = completion.choices[0]?.message?.content || '';

    if (!markdownContent) {
      throw new Error('Empty response from Groq');
    }

    return markdownContent;
  } catch (error) {
    console.error('Groq Content Generation API error:', error.message);
    throw error;
  }
};

module.exports = { queryGroq, generateLocationContent };
