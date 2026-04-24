const mongoose = require('mongoose');

const communityImageSchema = new mongoose.Schema({
  data: {
    type: Buffer,
    required: true,
  },
  contentType: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
  }
});

module.exports = mongoose.model('CommunityImage', communityImageSchema);
