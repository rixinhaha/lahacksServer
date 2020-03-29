const express = require('express');
const router  = express.Router();
const db = require('./db-utils.js')

router.get('/', (req, res)=>{
    res.send('server is up and running');
});

router.get('/rooms/:roomname/messages', async (req, res) => {
    const messages = await db.getMessagesInRoom({
        room: req.params.roomname,
        numMessages: req.query.num,
        startId: req.query.start_id
    });
    if(messages.error) {
        console.log(messages.error);
        res.sendStatus('404');
    }else{
        messages.last_id = res.data[res.data.length - 1]._id;
       res.json(messages); 
    }
});

module.exports = router