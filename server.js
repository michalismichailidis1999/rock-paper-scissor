const express = require("express");
const socketio = require('socket.io');
const path = require("path");
const http = require("http");

// Utils
const { rooms, exitRoom, joinRoom, createRoom } = require("./utils/rooms");
const { userConnected, connectedUsers, initializeChoices, makeMove, choices, moves } = require("./utils/users");
const { join } = require("path");

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
            createRoom(roomId, socket.client.id);
            userConnected(socket.client.id);
            socket.emit("room-created", roomId);
            socket.emit("player-1-connected");
            socket.join(roomId);
        }
    })

    socket.on("join-room", roomId => {
        if (rooms[roomId]) {
            joinRoom(roomId, socket.client.id);
            userConnected(socket.client.id);
            socket.join(roomId);

            socket.emit("room-joined", roomId);
            socket.emit("player-2-connected");
            socket.broadcast.to(roomId).emit('player-2-connected');
            initializeChoices(roomId);
        } else {
            let error = "Room does not exist";
            socket.emit("display-error", error);
        }
    })

    socket.on("join-random", () => {
        let roomId = "";

        for (let id in rooms) {
            if (rooms[id][1] === "" && rooms[id][0] !== "") {
                roomId = id;
                break;
            }
        }

        if (roomId === "") {
            let error = "All rooms are full.";
            socket.emit("display-error", error);
        } else {
            joinRoom(roomId, socket.client.id);
            userConnected(socket.client.id);
            socket.join(roomId);
            console.log(roomId)

            socket.emit("room-joined", roomId);
            socket.emit("player-2-connected");
            socket.broadcast.to(roomId).emit('player-2-connected');
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
                io.to(roomId).emit("draw", message);
            } else if (moves[playerOneChoice] === playerTwoChoice) {
                let enemyChoice = "";

                if (playerId === 1) {
                    enemyChoice += playerTwoChoice;
                } else {
                    enemyChoice += playerOneChoice;
                }

                choices[roomId] = ["", ""];
                io.to(roomId).emit("player-1-win", { myChoice, enemyChoice });
            } else {
                let enemyChoice = "";

                if (playerId === 1) {
                    enemyChoice += playerTwoChoice;
                } else {
                    enemyChoice += playerOneChoice;
                }

                choices[roomId] = ["", ""];
                io.to(roomId).emit("player-2-win", { myChoice, enemyChoice });
            }
        }
    })

    socket.on("disconnect", () => {
        if (connectedUsers[socket.client.id]) {
            let player;
            let roomId;

            for (let id in rooms) {
                if (rooms[id][0] === socket.client.id ||
                    rooms[id][1] === socket.client.id) {
                    if (rooms[id][0] === socket.client.id) {
                        player = 1;
                    } else {
                        player = 2;
                    }

                    roomId = id;
                    break;
                }
            }

            exitRoom(roomId, player);

            if (player === 1) {
                io.to(roomId).emit("player-1-disconnected");
            } else {
                io.to(roomId).emit("player-2-disconnected");
            }
        } else {
            console.log("User is not connected to any room");
        }
    });
});

server.listen(5000, () => console.log("Server started on port 5000..."));