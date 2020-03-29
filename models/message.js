const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  content: String,
  timestamp: {
    type: Date,
    default: Date.now
  },
  author: {
    name: String,
    avatar: String
  }
});

module.exports = mongoose.model('Message', messageSchema);