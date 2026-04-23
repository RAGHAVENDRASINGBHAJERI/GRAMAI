const { generateLocationContent } = require('../services/groqService');
const { success, error } = require('../utils/responseHelper');

/**
 * Generate location-based Markdown content
 * @route GET /api/content/generate
 * @access Public (or Private depending on needs)
 */
const generateContent = async (req, res, next) => {
  try {
    const { category, location, language = 'en' } = req.query;

    if (!category) {
      return error(res, 'Category is required', 400);
    }

    const validCategories = ['agriculture', 'schemes', 'health', 'mandi'];
    if (!validCategories.includes(category)) {
      return error(res, 'Invalid category', 400);
    }

    const markdownContent = await generateLocationContent(category, location, language);

    return success(res, {
      content: markdownContent,
      category,
      location: location || 'India',
      language,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { generateContent };
