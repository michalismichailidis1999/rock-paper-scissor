// "room-id": [false, false, socketRoomId, player1Id, player2Id]
const rooms = {}

const createRoom = (roomId, socketRoomId, player1Id) => {
    rooms[roomId] = [true, false, socketRoomId, player1Id, ""];
};

const joinRoom = (roomId, player2Id) => {
    if (!rooms[roomId]) {
        return;
    }

    rooms[roomId][1] = true;
    rooms[roomId][4] = player2Id;
}

const exitRoom = (roomId, player) => {
    if (!rooms[roomId]) {
        return;
    }

    if (player === 1) {
        delete rooms[roomId];
        console.log('Player one disconected');
    } else {
        if (rooms[roomId]) {
            console.log('Player two disconected');
            rooms[roomId][1] = false;
            rooms[roomId][4] = "";
        }
    }
}

module.exports = { rooms, joinRoom, exitRoom, createRoom };