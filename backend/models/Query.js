const mongoose = require('mongoose');

const querySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true,
  },
  question: {
    type: String,
    required: [true, 'Question is required'],
    trim: true,
    maxlength: [1000, 'Question cannot exceed 1000 characters'],
  },
  response: {
    type: String,
    required: [true, 'Response is required'],
  },
  language: {
    type: String,
    enum: ['en', 'hi', 'kn'],
    default: 'en',
  },
  category: {
    type: String,
    enum: ['agriculture', 'health', 'schemes', 'mandi', 'general'],
    default: 'general',
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0,
  },
  isSaved: {
    type: Boolean,
    default: false,
  },
  source: {
    type: String,
    enum: ['ai-engine', 'groq-ai', 'cache', 'offline-fallback'],
    default: 'ai-engine',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient querying
querySchema.index({ userId: 1, timestamp: -1 });
querySchema.index({ category: 1 });

module.exports = mongoose.model('Query', querySchema);
