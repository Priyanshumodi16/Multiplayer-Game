const socket = io();
let gameCode = "";
let playerSymbol = "";
let currentTurn = "X";

document.getElementById("createGame").addEventListener("click", () => {
    gameCode = Math.random().toString(36).substr(2, 6).toUpperCase();
    document.getElementById("gameCodeText").innerText = `Game Code: ${gameCode}`;
    socket.emit("createGame", gameCode);
});

document.getElementById("joinGame").addEventListener("click", () => {
    gameCode = document.getElementById("gameCodeInput").value.toUpperCase();
    if (gameCode) {
        socket.emit("joinGame", gameCode);
    }
});

socket.on("gameStart", (symbol) => {
    document.getElementById("gameLobby").classList.add("hidden");
    document.getElementById("gameBoard").classList.remove("hidden");
    playerSymbol = symbol;
    document.getElementById("playerInfo").innerText = `You are ${playerSymbol}`;
});

document.querySelectorAll(".cell").forEach(cell => {
    cell.addEventListener("click", () => {
        if (cell.innerText === "" && playerSymbol === currentTurn) {
            socket.emit("makeMove", { index: cell.dataset.index, symbol: playerSymbol, gameCode });
        }
    });
});

socket.on("moveMade", ({ index, symbol }) => {
    document.querySelector(`.cell[data-index='${index}']`).innerText = symbol;
    currentTurn = symbol === "X" ? "O" : "X";
});

document.getElementById("restartGame").addEventListener("click", () => {
    socket.emit("requestRestart", gameCode);
    document.getElementById("challengeBox").classList.remove("hidden");
});

document.getElementById("acceptChallenge").addEventListener("click", () => {
    socket.emit("restartAccepted", gameCode);
    document.getElementById("challengeBox").classList.add("hidden");
});

document.getElementById("declineChallenge").addEventListener("click", () => {
    document.getElementById("challengeBox").classList.add("hidden");
});

socket.on("restartGame", () => {
    document.querySelectorAll(".cell").forEach(cell => cell.innerText = "");
});
