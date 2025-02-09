const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
    }
});

const rooms = {}; // Stores active game rooms

// Serve static frontend files
app.use(express.static("public"));

io.on("connection", (socket) => {
    console.log("A player connected:", socket.id);

    // Creating a room
    socket.on("createRoom", () => {
        const roomCode = Math.random().toString(36).substr(2, 6).toUpperCase();
        rooms[roomCode] = { players: [socket.id] };
        socket.join(roomCode);
        socket.emit("roomCreated", roomCode);
    });

    // Joining a room
    socket.on("joinRoom", (roomCode) => {
        if (rooms[roomCode] && rooms[roomCode].players.length < 2) {
            socket.join(roomCode);
            rooms[roomCode].players.push(socket.id);
            socket.emit("roomJoined", roomCode);
            io.to(roomCode).emit("playerJoined", rooms[roomCode].players.length);
        } else {
            socket.emit("invalidRoom", "Room is full or does not exist!");
        }
    });

    // Handle game events (modify for your game logic)
    socket.on("move", (data) => {
        const { roomCode, move } = data;
        io.to(roomCode).emit("playerMoved", { move, playerId: socket.id });
    });

    // Handle disconnect
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

server.listen(3000, () => {
    console.log("Server running on port 3000");
});
