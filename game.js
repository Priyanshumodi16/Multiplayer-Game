const socket = io("https://multiplayer-game-dbd9.onrender.com/"); // Change this to your deployed server URL

let currentRoom = null;

// Create a room
function createRoom() {
    socket.emit("createRoom");
}

// Join a room
function joinRoom() {
    const roomCode = document.getElementById("roomCode").value;
    if (roomCode) {
        socket.emit("joinRoom", roomCode.toUpperCase());
    }
}

// Handle room creation
socket.on("roomCreated", (roomCode) => {
    currentRoom = roomCode;
    document.getElementById("roomDisplay").innerText = roomCode;
    document.getElementById("menu").style.display = "none";
    document.getElementById("game").style.display = "block";
});

// Handle room joining
socket.on("roomJoined", (roomCode) => {
    currentRoom = roomCode;
    document.getElementById("roomDisplay").innerText = roomCode;
    document.getElementById("menu").style.display = "none";
    document.getElementById("game").style.display = "block";
});

// Handle invalid room
socket.on("invalidRoom", (message) => {
    alert(message);
});

// Handle player joining
socket.on("playerJoined", (playerCount) => {
    if (playerCount === 2) {
        document.getElementById("status").innerText = "Both players connected!";
        document.getElementById("moveButton").disabled = false;
    }
});

// Make a move (simple turn-based game)
function makeMove() {
    if (currentRoom) {
        socket.emit("move", { roomCode: currentRoom, move: "Player moved!" });
    }
}

// Handle move events
socket.on("playerMoved", (data) => {
    document.getElementById("status").innerText = data.move;
});
