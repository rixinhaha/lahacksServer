const express = require('express');
const router  = express.Router();
const db = require('./db-utils.js')
const path = require('path');

//root
router.get('/', (req, res)=>{
    res.sendFile(path.join(__dirname, '/client/build/index.html'));
    //res.sendFile(path.join(__dirname, '../lahacksClient/build/index.html'));
    res.send('server is up and running');
});

// User signup
router.post('/users', async (req, res) => {
    console.log(req);
    var user = req.query.user;
    const result = await db.createUser(user);
    console.log(result);
    if(result.error) {
        res.sendStatus(404).send(result.error);
    }else{
        res.sendStatus(200); 
    }

});

//Redirect to chatroom
//router.get('/rooms/:roomid', (req, res) => {
//})

//Get old messages
router.get('/rooms/:roomname/messages', async (req, res) => {
    options = {
        room: req.params.roomname,
        numMessages: parseInt(req.query.num),
    }
    if(typeof req.query.start_id != 'undefined'){
        options.startId = req.query.start_id
    }
    const messages = await db.getMessagesInRoom(options);
    if(messages.error) {
        console.log(messages.error);
        res.sendStatus(400);
    }else{
        messages.last_id = messages.data[messages.data.length - 1]._id;
        res.json(messages); 
    }
});

module.exports = router