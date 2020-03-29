const express = require('express');
const socketio = require('socket.io');
const http  = require('http');
const {addUser, removeUser, getUserAndRoom} = require('./user.js');
const db = require('./db-utils')

const PORT = 5000;
const router =  require('./router');

const app = express();
const server = http.createServer(app);
const io = socketio(server);


io.on('connection', (socket)=>{
    console.log("We have a new connection!!!");
    socket.on('join', async ({name,room}, callback)=>{
        // const {error, user} = addUser({id: socket.id, name, room});
        const resRoom = await db.createRoom(room);
        if(resRoom.error){
            return resRoom.error;
        }
        console.log(resRoom);

        const resAddUser = await db.addUserToRoom({user: name, room:room});
        if(resAddUser.error){
            console.log("error: ", resAddUser.error);
            return resAddUser.error;
        }

        addUser({
            user: name,
            id: socket.id,
            room: room
        });

        socket.emit('message', {user: 'admin', text: `${name}, welcome to the room ${room}`});
        socket.broadcast.to(room).emit('message', {user: 'admin', text: `${name}, has joined!`});
        socket.join (room);

        // callback();
    });
    socket.on('sendMessage',async(message, callback)=>{
        const info =  getUserAndRoom(socket.id);
        console.log('here');
        console.log("info: ", info);

        const res = await db.addMessage({user: info.user, message: message.text, room: info.room});
        if(res.error){
            console.log("error: ", resAddUser.error);
            return res.error;
        }

        io.to(info.room).emit('message', {user: info.user, text: message.text, avatar: message.avatar});

        callback()
    });
    socket.on('disconnect', async()=>{
        const info =  getUserAndRoom(socket.id);
        console.log(info);

        const res = await db.removeUserFromRoom({user: info.user, room: info.room});
        if(res.error){
            console.log("error: ", resAddUser.error);
            return res.error
        }
        removeUser(socket.id);
        if(info){
            io.to(info.room).emit('message', {user: 'admin', text: `${info.user} has left`});
        }
        console.log('User had left!!')
    });
})

app.use(router);
app.use(express.urlencoded());

server.listen(PORT, ()=>{console.log(`Server has started on ${PORT}`)});
