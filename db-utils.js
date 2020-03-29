const mongoose = require('mongoose');
const User = require('./models/user.js');
const Room = require('./models/room.js');
const Message = require('./models/message.js');

const uri = "mongodb+srv://cy-liu:RJCZ0e4xbvAGso2D@youtube-chatroom-uc5uy.gcp.mongodb.net/test?retryWrites=true&w=majority";
mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: false});

//Local mongodb as alternate
//mongoose.connect("mongodb://localhost:27017/youtube-chatroom", {useNewUrlParser: true, useUnifiedTopology: true});

const lib = {};

//CREATION
lib.createRoom = async (roomName) => {
  //Not checking for duplicates as roomName should be unique anyway
  try{
    const roomDoc = await Room.findOne({name: roomName});
    if(!roomDoc){
      try{
        const newRoom = await Room.create({name: roomName});
        return { data: newRoom.toObject() };
      }catch(err){
        return {error: err};
      } 
    }
    return { data: roomDoc.toObject() };
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
        return { data: newUser.toObject() };
      }catch(err){
        return {error: err};
      }
    }
    return { error: 'Username is taken.' };
  }catch(err){
    return {error: err};
  }
}

lib.addMessage = async ({user, message, room, avatar}) => {
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
    const msgDoc = await Message.create({content: message, author: {name: user, avatar}});
    roomDoc.messages.push(msgDoc);
    roomDoc.save();
    return { data: msgDoc.toObject() };
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
    return { data: userDoc.toObject() };
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
    await Room.updateOne({name: room}, {$pull: {users: userDoc._id}});;
    return { data: userDoc.toObject() };
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
    return { data: userDoc.toObject() };
  }catch(err){
    return {error: err};
  }
}

lib.getUsersInRoom = async (roomName) => {
  try{
    const roomDoc = await Room.findOne({name: roomName}).populate('users');
    if(!roomDoc){
      return {error: 'Room does not exist.'};
    }
    return { data: roomDoc.users.map(user => user.toObject()) };
  }catch(err){
    return {error: err};
  }
}

lib.getMessagesInRoom = async ({room, numMessages, startId}) => {
  //Don't declare startId if you want it to start from beginning
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
      return {error: 'Room does not exist.'};
    }
    const messages = roomDoc.messages;
    let index = -1;
    if(!startId){
      index = 0;
    }else{
      for(let i = 0; i < messages.length; i++){
        if(messages[i].id === startId){
          index = i;
          break;
        }
      }
    }
    if(index === -1){
      return {error: 'Invalid id'};
    }
    if(index + numMessages > messages.length){
      numMessages = messages.length - index;
    }
    return { data: messages.slice(index, index + numMessages).map(message => message.toObject()) };
  }catch(err){
    return {error: err};
  }
}

module.exports = lib;

