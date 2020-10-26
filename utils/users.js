const connectedUsers = {};
const choices = {} // roomId: [playerOneChoice, playerTwoChoice]
const moves = {
    'rock': "scissor",
    'paper': "rock",
    'scissor': "paper"
}

const userConnected = (userId) => {
    connectedUsers[userId] = true;
}

const initializeChoices = (roomId) => {
    choices[roomId] = ["", ""];
}

const makeMove = (roomId, playerId, choice) => {
    if (choices[roomId]) {
        choices[roomId][playerId - 1] = choice;
    }
}

module.exports = { connectedUsers, userConnected, initializeChoices, makeMove, choices, moves }