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
    console.log("We have a new connection!!!");
    socket.on('join', ({userid,room}, callback)=>{
        const {error, user} = addUser({id: socket.id, userid, room});
        if(error) return callback(error);
        socket.emit('message', {user: 'admin', text: `${user.userid}, welcome to the room ${user.room}`});
        socket.broadcast.to(user.room).emit('message', {user: 'admin', text: `${user.userid}, has joined!`});
        socket.join (user.room);
        io.to(user.room).emit('roomData', {room: user.room, users: getUsersInRoom(user.room)})
        callback();
    });
    socket.on('sendMessage',(message, callback)=>{
        const user =  getUser(socket.id);
        console.log(message)
        io.to(user.room).emit('message', {user: user.userid, text: message});
        io.to(user.room).emit('roomData', {room: user.room, users: getUsersInRoom(user.room)});
        callback()
    });
    socket.on('disconnect', ()=>{
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message', {user: 'admin', text: `${user.userid} has left`});
        }
        console.log('User had left!!')
    });
})

app.use(router);

server.listen(PORT, ()=>{console.log(`Server has started on ${PORT}`)});

