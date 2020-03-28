const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  // messages: [
  //   {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: 'Message'
  //   }
  // ]
});

module.exports = mongoose.model('User', userSchema);