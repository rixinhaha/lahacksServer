const express = require('express');
const router  = express.Router();
const db = require('./db-utils.js')

router.get('/', (req, res)=>{
    res.send('server is up and running');
});

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
        res.sendStatus(404).send(messages.error);
    }else{
        messages.last_id = messages.data[messages.data.length - 1]._id;
        res.json(messages); 
    }
});

module.exports = router