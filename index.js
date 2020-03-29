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
        let resRoom;
        let resUser;
        let resAddUser;
        try{
            resRoom = await db.createRoom(room);
        } catch (err){
            return {err:err};
        }
        console.log(resRoom);


        //FOR TESTING
        // try{
        //     resUser = await db.createUser(name);
        // }
        // catch (err){
        //     return {err:err};
        // }     
        // console.log(resUser);

        try{
            resAddUser = await db.addUserToRoom({user: name, room:room});
        }
        catch (err){
            return {err:err};
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
        console.log(info);
        let res;

        try{
            res = await db.addMessage({user: info.user, message: message, room: info.room});
        }
        catch(err){
            return {err:err};
        } 

        io.to(info.room).emit('message', {user: info.user, text: message});

        callback()
    });
    socket.on('disconnect', async()=>{
        const info =  getUserAndRoom(socket.id);

        let res;
        try{
            res = await db.removeUserFromRoom({user: info.user, room: info.room});
            console.log(res);
            
        }catch (err){
            return {err:err};
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

