const socket = io("https://multiplayer-game-dbd9.onrender.com/"); // Change this when hosted online

let currentRoom = null;

function createRoom() {
    socket.emit("createRoom");
}

function joinRoom() {
    const roomCode = document.getElementById("roomCode").value;
    if (roomCode) {
        socket.emit("joinRoom", roomCode.toUpperCase());
    }
}

socket.on("roomCreated", (roomCode) => {
    currentRoom = roomCode;
    document.getElementById("roomDisplay").innerText = roomCode;
    document.getElementById("menu").style.display = "none";
    document.getElementById("game").style.display = "block";
});

socket.on("updateBoard", ({ board, currentTurn }) => {
    document.querySelectorAll(".cell").forEach((cell, index) => {
        cell.innerText = board[index] || "";
    });
});

function makeMove(index) {
    if (currentRoom) {
        socket.emit("makeMove", { roomCode: currentRoom, index });
    }
}

socket.on("gameOver", (winner) => {
    alert(winner === "Draw" ? "It's a draw!" : `Player ${winner} wins!`);
});
