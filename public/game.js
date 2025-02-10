const socket = io("https://multiplayer-game-dbd9.onrender.com/"); // Change when hosting online

let currentRoom = null;
let playerMark = null; // Stores if the player is "X" or "O"

function createRoom() {
    socket.emit("createRoom");
}

function joinRoom() {
    const roomCode = document.getElementById("roomCode").value.trim().toUpperCase();
    if (roomCode) {
        socket.emit("joinRoom", roomCode);
    }
}

socket.on("roomCreated", (roomCode) => {
    currentRoom = roomCode;
    document.getElementById("roomDisplay").innerText = roomCode;
    document.getElementById("menu").style.display = "none";
    document.getElementById("game").style.display = "block";
    document.getElementById("status").innerText = "Waiting for another player...";
});

socket.on("roomJoined", ({ roomCode }) => {
    currentRoom = roomCode;
    document.getElementById("roomDisplay").innerText = roomCode;
    document.getElementById("menu").style.display = "none";
    document.getElementById("game").style.display = "block";
    document.getElementById("status").innerText = "Game Started!";
});

socket.on("assignMark", (mark) => {
    playerMark = mark;
    document.getElementById("status").innerText = `You are Player ${mark}`;
});

socket.on("updateBoard", ({ board, currentTurn }) => {
    document.querySelectorAll(".cell").forEach((cell, index) => {
        cell.innerText = board[index] || "";
    });
    document.getElementById("status").innerText = `Turn: Player ${currentTurn}`;
});

function makeMove(index) {
    if (currentRoom && playerMark) {
        socket.emit("makeMove", { roomCode: currentRoom, index, mark: playerMark });
    }
}

socket.on("gameOver", (winner) => {
    alert(winner === "Draw" ? "It's a draw!" : `Player ${winner} wins!`);
    location.reload(); // Refresh game after match
});
