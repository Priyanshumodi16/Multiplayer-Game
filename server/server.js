const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

const rooms = {}; // Stores active game rooms

// Serve frontend files
app.use(express.static("public"));

io.on("connection", (socket) => {
    console.log("A player connected:", socket.id);

    // Create a new game room
    socket.on("createRoom", () => {
        const roomCode = Math.random().toString(36).substr(2, 6).toUpperCase();
        rooms[roomCode] = { players: [socket.id], board: Array(9).fill(null), currentTurn: "X" };
        socket.join(roomCode);
        socket.emit("roomCreated", roomCode);
    });

    // Join an existing room
    socket.on("joinRoom", (roomCode) => {
        if (rooms[roomCode] && rooms[roomCode].players.length < 2) {
            rooms[roomCode].players.push(socket.id);
            socket.join(roomCode);
            io.to(roomCode).emit("roomJoined", { roomCode, players: rooms[roomCode].players });

            // Tell both players who is "X" and who is "O"
            io.to(rooms[roomCode].players[0]).emit("assignMark", "X");
            io.to(rooms[roomCode].players[1]).emit("assignMark", "O");

            io.to(roomCode).emit("gameStart", { currentTurn: rooms[roomCode].currentTurn });
        } else {
            socket.emit("invalidRoom", "Room is full or does not exist!");
        }
    });

    // Handle player moves
    socket.on("makeMove", ({ roomCode, index, mark }) => {
        const room = rooms[roomCode];
        if (!room) return;

        if (room.board[index] === null && room.currentTurn === mark) {
            room.board[index] = mark;
            room.currentTurn = mark === "X" ? "O" : "X";
            io.to(roomCode).emit("updateBoard", { board: room.board, currentTurn: room.currentTurn });

            // Check for a winner
            const winner = checkWinner(room.board);
            if (winner) {
                io.to(roomCode).emit("gameOver", winner);
                delete rooms[roomCode]; // Reset game after match
            }
        }
    });

    // Handle player disconnect
    socket.on("disconnect", () => {
        for (let roomCode in rooms) {
            rooms[roomCode].players = rooms[roomCode].players.filter(id => id !== socket.id);
            if (rooms[roomCode].players.length === 0) {
                delete rooms[roomCode];
            }
        }
        console.log("A player disconnected:", socket.id);
    });
});

// Function to check for a winner
function checkWinner(board) {
    const winningCombos = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    for (let combo of winningCombos) {
        const [a, b, c] = combo;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a]; // Return 'X' or 'O' as winner
        }
    }
    return board.includes(null) ? null : "Draw";
}

server.listen(3000, () => console.log("Server running on port 3000"));
