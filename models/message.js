const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  content: String,
  timestamp: {
    type: Date,
    default: Date.now
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    rel: 'User',
    required: true
  }
});

module.exports = mongoose.model('Message', messageSchema);