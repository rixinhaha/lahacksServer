const express = require('express');
const socketio = require('socket.io');
const http  = require('http');
const {addUser, removeUser, getUser, getUsersInRoom} = require('./user.js');

const PORT = 5000;
const router =  require('./router');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

io.on('connection', (socket)=>{
    let connected_user;
    console.log("We have a new connection!!!");
    socket.on('join', ({name,room}, callback)=>{
        const {error, user} = addUser({id: socket.id, name, room});
        connected_user = {id: socket.id, name, room}
        if(error) return callback(error);
        socket.emit('message', {user: 'admin', text: `${user.name}, welcome to the room ${user.room}`});
        socket.broadcast.to(user.room).emit('message', {user: 'admin', text: `${user.name}, has joined!`});
        socket.join (user.room);
        io.to(user.room).emit('roomData', {room: user.room, users: getUsersInRoom(user.room)})
        callback();
    });
    socket.on('sendMessage',(message, callback)=>{
        const user =  getUser(message.name);
        console.log(message)
        //message.room has the room number
        console.log(message.room)
        io.to(user.room).emit('message', {user: user.name, text: message.text});
        io.to(user.room).emit('roomData', {room: user.room, users: getUsersInRoom(user.room)});
        callback()
    });
    socket.on('disconnect', ()=>{
        const user = removeUser(connected_user.id)
        console.log(connected_user);
        if(user){
            io.to(user.room).emit('message', {user: 'admin', text: `${user.name} has left`});
            //user.name has the name of the user
            console.log(user.name)
        }
        console.log('User had left!!')
    });
})

app.use(router);

server.listen(PORT, ()=>{console.log(`Server has started on ${PORT}`)});

