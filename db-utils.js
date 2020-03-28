const mongoose = require('mongoose');
const User = require('./models/user.js');
const Room = require('./models/room.js');
const Message = require('./models/message.js');

const uri = "mongodb+srv://cy-liu:RJCZ0e4xbvAGso2D@youtube-chatroom-uc5uy.gcp.mongodb.net/test?retryWrites=true&w=majority";
//mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true});

//Local mongodb as alternate
mongoose.connect("mongodb://localhost:27017/youtube-chatroom", {useNewUrlParser: true, useUnifiedTopology: true});

const lib = {};

//CREATION
lib.createRoom = async (roomName) => {
  //Not checking for duplicates as roomName should be unique anyway
  try{
    const roomDoc = await Room.create({name: roomName});
    return roomDoc.toObject();
  }catch(err){
    return {error: err};
  }
}

lib.createUser = async (userName) => {
  if(!userName) return { error: 'Username is required.' };
  userName = userName.trim().toLowerCase();
  
  try{
    const userDoc = await User.findOne({name: userName});
    if(!userDoc){
      try{
        const newUser = await User.create({name: userName});
        return newUser.toObject();
      }catch(err){
        return {error: err};
      }
    }
    return { error: 'Username is taken.' };
  }catch(err){
    return {error: err};
  }
}

lib.addMessage = async ({user, message, room}) => {
  try{
    const docs = await Promise.all([Room.findOne({name: room}), User.findOne({name: user})]);
    const roomDoc = docs[0];
    const userDoc = docs[1];
    await Promise.all([roomDoc, userDoc]);
    if(!roomDoc){
      return {error: 'Room does not exist.'};
    }
    if(!userDoc){
      return {error: 'User does not exist.'};
    }
    const msgDoc = await Message.create({content: message, author: user});
    roomDoc.messages.push(msgDoc);
    roomDoc.save();
    return msgDoc.toObject();
  }catch(err){
    return {error: err};
  }
}

//UPDATING
lib.addUserToRoom = async ({user, room}) => {
  try{
    const docs = await Promise.all([Room.findOne({name: room}), User.findOne({name: user})]);
    const roomDoc = docs[0];
    const userDoc = docs[1];
    if(!roomDoc){
      return {error: 'Room does not exist.'};
    }
    if(!userDoc){
      return {error: 'User does not exist.'};
    }
    roomDoc.users.push(userDoc._id);
    roomDoc.save();
    return userDoc.toObject();
  }catch(err){
    return {error: err};
  }
}

lib.removeUserFromRoom = async ({user, room}) =>{
  try{
    const docs = await Promise.all([Room.findOne({name: room}), User.findOne({name: user})]);
    const roomDoc = docs[0];
    const userDoc = docs[1];
    if(!roomDoc){
      return {error: 'Room does not exist.'};
    }
    if(!userDoc){
      return {error: 'User does not exist.'};
    }
    Room.updateOne({name: room}, {$pull: {users: userDoc._id}});;
    return userDoc.toObject();
  }catch(err){
    return {error: err};
  }
}

//RETRIEVING
lib.getUser = async (userName) => {
  try{
    const userDoc = await User.findOne({name: userName});
    if(!userDoc){
      return {error: 'User does not exist.'};
    }
    return userDoc.toObject();
  }catch(err){
    return {error: err};
  }
}

lib.getUsersInRoom = async (roomName) => {
  try{
    const roomDoc = await Room.findOne({name: roomName}).populate('users');
    if(!roomDoc){
      return {error: 'User does not exist.'};
    }
    return roomDoc.users.map(user => user.toObject());
  }catch(err){
    return {error: err};
  }
}

lib.getMessagesInRoom = async ({room, numMessages}) => {
  try{
    const roomDoc = await Room.findOne({name: room}).populate({
      path: 'messages',
      options: {
        sort: {
          timestamp: -1 //descending order
        }
      }
    });
    if(!roomDoc){
      return {error: 'User does not exist.'};
    }
    if(numMessages > roomDoc.messages.length){
      numMessages = roomDoc.messages.length;
    }
    return roomDoc.messages.slice(0, numMessages).map(message => message.toObject());
  }catch(err){
    return {error: err};
  }
}

module.exports = lib;

