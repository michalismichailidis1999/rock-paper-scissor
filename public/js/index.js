// Global variables
let canChoose = false;
let playerOneConnected = false;
let playerTwoConnected = false;
let playerId = 0;
let myChoice = "";
let enemyChoice = "";
let roomId = "";
let myScorePoints = 0;
let enemyScorePoints = 0;

// Initialize socket
const socket = io();

// Start screen functionality
const openRoomIdBtn = document.getElementById("create-room");
const openJoinRoomBox = document.getElementById("join-room");
const roomIdBox = document.getElementById("room-id-box");
const roomIdInput = document.getElementById("room-id");
const cancelCreateActionBtn = document.getElementById("cancel-create-action");
const gameplayChoices = document.getElementById("gameplay-choices");
const createRoomBtn = document.getElementById("create-room-btn");
const gameplayScreen = document.querySelector(".gameplay-screen");
const startScreen = document.querySelector(".start-screen");
const cancelJoinActionBtn = document.getElementById("cancel-join-action");
const joinBoxRoom = document.getElementById("join-room-box");
const joinRoomBtn = document.getElementById("join-room-btn");
const joinRoomInput = document.getElementById("join-room-input");
const joinRandomBtn = document.getElementById("join-random");
const errorMessage = document.getElementById("error-message");
const playerOne = document.getElementById("player-1");
const playerTwo = document.getElementById("player-2");
const waitMessage = document.getElementById("wait-message");
const rock = document.getElementById("rock");
const paper = document.getElementById("paper");
const scissor = document.getElementById("scissor");
const myScore = document.getElementById('my-score');
const enemyScore = document.getElementById('enemy-score');
const playerOneTag = document.getElementById("player-1-tag");
const playerTwoTag = document.getElementById("player-2-tag");
const winMessage = document.getElementById("win-message");

openRoomIdBtn.addEventListener("click", function(e) {
    gameplayChoices.style.display = "none";
    roomIdBox.style.display = "block";
})

cancelCreateActionBtn.addEventListener("click", function(e) {
    gameplayChoices.style.display = "block";
    roomIdBox.style.display = "none";
})

createRoomBtn.addEventListener("click", function(e) {
    const roomId = roomIdInput.value;

    errorMessage.style.display = "none";
    errorMessage.innerHTML = "";

    socket.emit("create-room", roomId);
})

openJoinRoomBox.addEventListener("click", function(e) {
    joinBoxRoom.style.display = "block";
    gameplayChoices.style.display = "none";
})

joinRoomBtn.addEventListener("click", function(e) {
    const roomId = joinRoomInput.value;

    errorMessage.style.display = "none";
    errorMessage.innerHTML = "";

    socket.emit('join-room', roomId);
})

joinRandomBtn.addEventListener("click", function(e) {
    errorMessage.style.display = "none";
    errorMessage.innerHTML = "";
    socket.emit("join-random");
})

cancelJoinActionBtn.addEventListener("click", function(e) {
    gameplayChoices.style.display = "block";
    joinBoxRoom.style.display = "none";
})

rock.addEventListener("click", function(e) {
    if (myChoice === "" && playerOneConnected && playerTwoConnected) {
        myChoice = "rock";
        iChoose('rock');
        socket.emit("make-move", { playerId, myChoice, roomId });
    }
})

paper.addEventListener("click", function(e) {
    if (myChoice === "" && playerOneConnected && playerTwoConnected) {
        myChoice = "paper";
        iChoose('paper');
        socket.emit("make-move", { playerId, myChoice, roomId });
    }
})

scissor.addEventListener("click", function(e) {
    if (myChoice === "" && playerOneConnected && playerTwoConnected) {
        myChoice = "scissor";
        iChoose('scissor');
        socket.emit("make-move", { playerId, myChoice, roomId });
    }
})

// Socket emits
socket.on("display-error", (error) => {
    errorMessage.style.display = "block";
    let p = document.createElement("p");
    p.innerHTML = error;
    errorMessage.appendChild(p);
})

socket.on("room-joined", (id) => {
    playerId = 2;
    roomId = id;

    playerOneConnected = true;
    playerJoinTheGame(1);
    setPlayerTag(2);

    startScreen.style.display = "none";
    gameplayScreen.style.display = "block";
});

socket.on("room-created", (id) => {
    playerId = 1;
    roomId = id;
    setPlayerTag(1);

    startScreen.style.display = "none";
    gameplayScreen.style.display = "block";
})

socket.on("player-1-disconnected", () => {
    reset();
});

socket.on("player-2-disconnected", () => {
    canChoose = false;
    playerTwoConnected = false;
    playerTwo.classList.remove("connected");
    setWaitMessage(true);
    myScorePoints = 0;
    enemyScorePoints = 0;
    displayScore();
})

socket.on("player-1-connected", () => {
    playerOneConnected = true;
    playerJoinTheGame(1);
});

socket.on("player-2-connected", () => {
    playerTwoConnected = true;
    canChoose = true;
    setWaitMessage(false);
    playerJoinTheGame(2);
});

socket.on("draw", message => {
    setWinningMessage(message);
})

socket.on("player-1-win", ({ myChoice, enemyChoice }) => {
    if (playerId === 1) {
        let message = "You choose " + myChoice + " and the enemy choose " + enemyChoice + " . So you win.";
        setWinningMessage(message);
        myScorePoints++;
    } else {
        let message = "You choose " + myChoice + " and the enemy choose " + enemyChoice + " . So you lose.";
        setWinningMessage(message);
        enemyScorePoints++;
    }

    displayScore();
});

socket.on("player-2-win", ({ myChoice, enemyChoice }) => {
    if (playerId === 2) {
        let message = "You choose " + myChoice + " and the enemy choose " + enemyChoice + " . So you win.";
        setWinningMessage(message);
        myScorePoints++;
    } else {
        let message = "You choose " + myChoice + " and the enemy choose " + enemyChoice + " . So you lose.";
        setWinningMessage(message);
        enemyScorePoints++;
    }

    displayScore();
});

// Functions
function playerJoinTheGame(player) {
    if (player === 1) {
        playerOne.classList.add("connected");
    } else {
        playerTwo.classList.add("connected");
    }
}

function reset() {
    playerOneConnected = false;
    playerTwoConnected = false;
    canChoose = true;
    startScreen.style.display = "block";
    gameplayChoices.style.display = "block";
    openJoinRoomBox.style.display = "block";
    openRoomIdBtn.style.display = "block";
    joinBoxRoom.style.display = "none";
    gameplayScreen.style.display = "none";
    joinRoomInput.style.display = "none"
    cancelCreateActionBtn.style.display = "none";
    cancelJoinActionBtn.style.display = "none";
    joinRandomBtn.style.display = "none";
    playerOne.classList.remove("connected");
    playerTwo.classList.remove("connected");
    setWaitMessage(true);
}

function playerTwoLeftTheGame() {
    playerTwoConnected = false;
}

function setWaitMessage(display) {
    if (display) {
        let p = document.createElement("p");
        p.innerText = "Waiting for a player to join..."
        waitMessage.appendChild(p);
    } else {
        waitMessage.innerHTML = '';
    }
}

function setPlayerTag(playerId) {
    if (playerId === 1) {
        playerOneTag.innerText = "You (Player 1)";
        playerTwoTag.innerText = "Enemy (Player 2)";
    } else {
        playerOneTag.innerText = "Enemy (Player 1)";
        playerTwoTag.innerText = "You (Player 2)";
    }
}

function iChoose(choice) {
    if (choice === "rock") {
        rock.classList.add("my-choice");
    } else if (choice === "paper") {
        paper.classList.add("my-choice");
    } else {
        scissor.classList.add("my-choice");
    }
}

function removeChoice(choice) {
    if (choice === "rock") {
        rock.classList.remove("my-choice");
    } else if (choice === "paper") {
        paper.classList.remove("my-choice");
    } else {
        scissor.classList.remove("my-choice");
    }

    myChoice = "";
}

function setWinningMessage(message) {
    let p = document.createElement("p");
    p.innerText = message;

    winMessage.appendChild(p);

    setTimeout(() => {
        winMessage.innerHTML = "";
        canChoose = true;
        removeChoice(myChoice);
    }, 2500);
}

function displayScore() {
    myScore.innerText = myScorePoints;
    enemyScore.innerText = enemyScorePoints;
}