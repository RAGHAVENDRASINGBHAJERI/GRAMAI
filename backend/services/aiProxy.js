const env = require('../config/env');

/**
 * Proxy service to communicate with the Python AI Engine
 */

const queryAI = async (question, language = 'en', category = 'general') => {
  try {
    const response = await fetch(`${env.aiEngineUrl}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question, language, category }),
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (!response.ok) {
      throw new Error(`AI Engine returned status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('AI Engine proxy error:', error.message);
    throw error;
  }
};

const detectLanguage = async (text) => {
  try {
    const response = await fetch(`${env.aiEngineUrl}/detect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
      signal: AbortSignal.timeout(3000),
    });

    if (!response.ok) {
      throw new Error(`Language detection failed: ${response.status}`);
    }

    const result = await response.json();
    return result.language;
  } catch (error) {
    console.error('Language detection error:', error.message);
    // Fallback to simple heuristic
    if (text.match(/[\u0C80-\u0CFF]/)) return 'kn';  // Kannada
    if (text.match(/[\u0900-\u097F]/)) return 'hi';  // Devanagari
    return 'en';
  }
};

const checkHealth = async () => {
  try {
    const response = await fetch(`${env.aiEngineUrl}/health`, {
      signal: AbortSignal.timeout(3000),
    });
    return response.ok;
  } catch {
    return false;
  }
};

module.exports = { queryAI, detectLanguage, checkHealth };
