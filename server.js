const express = require("express");
const socketio = require('socket.io');
const path = require("path");
const http = require("http");

// Utils
const { rooms, exitRoom, joinRoom, createRoom } = require("./utils/rooms");
const { userConnected, connectedUsers, initializeChoices, makeMove, choices, moves } = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, "public")));

io.on("connection", socket => {
    socket.on("create-room", roomId => {
        if (rooms[roomId]) {
            let error = "This room id already exists";
            socket.emit("display-error", error);
        } else {
            createRoom(roomId, socket.id, socket.client.id);
            userConnected(socket.client.id);
            socket.emit("room-created", roomId);
            socket.emit("player-1-connected");
        }
    })

    socket.on("join-room", roomId => {
        if (rooms[roomId]) {
            let socketRoomId = rooms[roomId][2];

            joinRoom(roomId, socket.client.id);
            userConnected(socket.client.id);
            socket.join(socketRoomId);

            socket.emit("room-joined", roomId);
            socket.emit("player-2-connected");
            socket.broadcast.to(socketRoomId).emit('player-2-connected');
            initializeChoices(roomId);
        } else {
            let error = "Room does not exist";
            socket.emit("display-error", error);
        }
    })

    socket.on("join-random", () => {
        let roomId = "";
        let socketRoomId = "";

        for (let id in rooms) {
            if (rooms[id][1] === false && rooms[id][0] === true) {
                roomId = id;
                socketRoomId = rooms[id][2];
                break;
            }
        }

        if (roomId === "") {
            let error = "All rooms are full.";
            socket.emit("display-error", error);
        } else {
            joinRoom(roomId, socket.client.id);
            userConnected(socket.client.id);
            socket.join(socketRoomId);

            socket.emit("room-joined", roomId);
            socket.emit("player-2-connected");
            socket.broadcast.to(socketRoomId).emit('player-2-connected');
            initializeChoices(roomId);
        }
    });

    socket.on("make-move", ({ playerId, myChoice, roomId }) => {
        makeMove(roomId, playerId, myChoice);

        if (choices[roomId][0] !== '' && choices[roomId][1] !== "") {
            let playerOneChoice = choices[roomId][0];
            let playerTwoChoice = choices[roomId][1];

            if (playerOneChoice === playerTwoChoice) {
                let message = "Both of you choosed " + myChoice + ". So it's draw.";
                choices[roomId] = ["", ""];
                io.to(rooms[roomId][2]).emit("draw", message);
            } else if (moves[playerOneChoice] === playerTwoChoice) {
                let enemyChoice = "";

                if (playerId === 1) {
                    enemyChoice += playerTwoChoice;
                } else {
                    enemyChoice += playerOneChoice;
                }

                choices[roomId] = ["", ""];
                io.to(rooms[roomId][2]).emit("player-1-win", { myChoice, enemyChoice });
            } else {
                let enemyChoice = "";

                if (playerId === 1) {
                    enemyChoice += playerTwoChoice;
                } else {
                    enemyChoice += playerOneChoice;
                }

                choices[roomId] = ["", ""];
                io.to(rooms[roomId][2]).emit("player-2-win", { myChoice, enemyChoice });
            }
        }
    })

    socket.on("disconnect", () => {
        if (connectedUsers[socket.client.id]) {
            let idOfRoom;
            let player;
            let socketRoomId

            for (let roomId in rooms) {
                if (rooms[roomId][3] === socket.client.id ||
                    rooms[roomId][4] === socket.client.id) {
                    if (rooms[roomId][3] === socket.client.id) {
                        player = 1;
                    } else {
                        player = 2;
                    }

                    idOfRoom = roomId;
                    socketRoomId = rooms[roomId][2];
                    break;
                }
            }

            exitRoom(idOfRoom, player);

            if (player === 1) {
                io.to(socketRoomId).emit("player-1-disconnected");
            } else {
                io.to(socketRoomId).emit("player-2-disconnected");
            }
        } else {
            console.log("User is not connected to any room");
        }
    });
});

server.listen(5000, () => console.log("Server started on port 5000..."));