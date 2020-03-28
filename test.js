const db = require('./db-utils.js')

const users = ["tom", "dick", "harry", "jones", "peter", "paul", "arthur"];
const rooms = ["room1", "room2", "room3"];

const func0 = async (users) => {
    const results = users.map(async user => await db.createUser(user));
    return await Promise.all(results);
}

const func1 = async (rooms) => {
    const results = rooms.map(async room => await db.createRoom(room));
    return await Promise.all(results);
}

const func2 = async (users) => {
    const results = users.map(user => db.addUserToRoom({user, room: "room1"}));
    return await Promise.all(results);
}

const func3 = async (id) => {
    const results = users.map(user => db.removeUserFromRoom({user, room: "room1"}));
    return await Promise.all(results);
}

const func4 = async (room) => {
    const result = await db.getUsersInRoom(room);
    return result
}

const func5 = async (room) => {
    for(let i =  0; i < 20; i++){
        const message = "msg " + i.toString();
        const g = await db.addMessage({room, user: "tom", message});
        console.log(g);
    }
}

const func6 = async (room, numMessages) => {
    const results = await db.getMessagesInRoom({room, numMessages});
    return results
}

func1(rooms).then(res => {console.log(res);});
//func2(users).then(res => {console.log(res);};
//func3(users).then(res => {console.log(res);});
//func4("room1").then(res => {console.log(res)});
// func5("room1").then(res => console.log(res));
//func6("room1", 5).then(res=> console.log(res));
