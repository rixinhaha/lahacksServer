const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  messages: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    }
  ],
  users: [
    {
			type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }
  ]
});

module.exports = mongoose.model('Room', roomSchema);