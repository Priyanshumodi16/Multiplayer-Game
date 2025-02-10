const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let games = {};

app.use(express.static("public"));

io.on("connection", (socket) => {
    socket.on("createGame", (gameCode) => {
        games[gameCode] = [socket];
    });

    socket.on("joinGame", (gameCode) => {
        if (games[gameCode]) {
            games[gameCode].push(socket);
            games[gameCode].forEach((player, index) => player.emit("gameStart", index === 0 ? "X" : "O"));
        }
    });

    socket.on("makeMove", ({ index, symbol, gameCode }) => {
        games[gameCode].forEach(player => player.emit("moveMade", { index, symbol }));
    });
});

server.listen(3000, () => console.log("Server running on port 3000"));
