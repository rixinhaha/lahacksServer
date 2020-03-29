const express = require('express');
const socketio = require('socket.io');
const http  = require('http');

const PORT = 5000;
const router =  require('./router');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const db = require('./db-utils.js');

io.on('connection', (socket)=>{
    console.log("We have a new connection!!!");
    socket.on('join', async ({name,room}, callback)=>{
        const res = await db.createRoom(room);
        if(res.error){
            return callback(error);
        }else{
            res = await db.addUserToRoom({user: name, room});
            if(res.error){
                return callback(error)
            }else{
                socket.emit('message', {user: 'admin', text: `${name}, welcome to the room ${room}`});
                socket.broadcast.to(room).emit('message', {user: 'admin', text: `${name}, has joined!`});
                socket.join (room);
                io.to(room).emit('roomData', {room: room, users: getUsersInRoom(room)})
                callback();
            }
        }
    });
    socket.on('sendMessage', async (message, callback)=>{
        const res =  db.getUser(socket.id);
        //console.log(message)
        io.to(user.room).emit('message', {user: user.name, text: message});
        io.to(user.room).emit('roomData', {room: user.room, users: getUsersInRoom(user.room)});
        callback()
    });
    socket.on('disconnect', ()=>{
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message', {user: 'admin', text: `${user.name} has left`});
        }
        console.log('User had left!!')
    });
})

app.use(router);
app.use(express.urlencoded());

server.listen(PORT, ()=>{console.log(`Server has started on ${PORT}`)});

