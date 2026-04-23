const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    transactionType: {
      type: String,
      enum: ['BUY', 'SELL'],
      required: true,
    },
    cropType: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: String, // e.g., '5 Quintal', '10 Tons'
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    imageId: {
      type: mongoose.Schema.Types.ObjectId, // GridFS File ID
      default: null,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'SOLD', 'CLOSED'],
      default: 'ACTIVE',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', postSchema);
