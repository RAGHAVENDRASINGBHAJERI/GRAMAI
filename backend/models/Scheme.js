const mongoose = require('mongoose');

const schemeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Scheme name is required'],
    trim: true,
  },
  nameKn: {
    type: String,
    trim: true,
  },
  nameHi: {
    type: String,
    trim: true,
  },
  benefits: {
    type: [String],
    default: [],
  },
  eligibility: {
    type: [String],
    default: [],
  },
  steps: {
    type: [String],
    default: [],
  },
  ministry: {
    type: String,
    trim: true,
  },
  state: {
    type: String,
    default: null, // null = central scheme
    trim: true,
  },
  tags: {
    type: [String],
    default: [],
    index: true,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

schemeSchema.index({ tags: 1 });
schemeSchema.index({ state: 1 });
schemeSchema.index({ name: 'text', nameKn: 'text', nameHi: 'text' });

module.exports = mongoose.model('Scheme', schemeSchema);
