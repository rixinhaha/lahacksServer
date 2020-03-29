let currentUsers = [];

 // socket id should be unique so there should be no need to check other values

const addUser = ({user, id, room}) => {
    const existingUser = currentUsers.find((user)=> user.id===id );
    if (existingUser) {
        return { error: 'Username is taken'};
    }
    currentUsers.push({user, id, room});
    console.log(currentUsers)
}

const removeUser = (id) => {
    const info = currentUsers.find((user)=> user.id===id);
    const index = currentUsers.indexOf(info);
    if(index!==-1)
    {
        currentUsers.splice(index, 1)[0];
    }
}

const getUserAndRoom = (id) => currentUsers.find((user) => user.id===id);
// const getUsersInRoom = (room) => users.filter((user) => user.room == room);

module.exports = {addUser, removeUser, getUserAndRoom};
