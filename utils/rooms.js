// "room-id": [player1Id, player2Id]
const rooms = {}

const createRoom = (roomId, player1Id) => {
    rooms[roomId] = [player1Id, ""];
};

const joinRoom = (roomId, player2Id) => {
    // if (!rooms[roomId]) {
    //     return;
    // }

    rooms[roomId][1] = player2Id;
}

const exitRoom = (roomId, player) => {
    // if (!rooms[roomId]) {
    //     return;
    // }

    if (player === 1) {
        delete rooms[roomId];
    } else {
        if (rooms[roomId]) {
            rooms[roomId][1] = "";
        }
    }
}

module.exports = { rooms, joinRoom, exitRoom, createRoom };