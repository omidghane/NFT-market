const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3001;

let gameState = null;

const resetGameState = () => {
  gameState = {
    board: [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ],
    turn: 1,
    player1: null,
    player2: "9tJ9UNPJ2fcFmxOAAAF", 
  };
};

resetGameState();

const getPlayerNumber = (socketId) => (socketId === gameState.player1 ? 1 : socketId === gameState.player2 ? 2 : null);

const checkWin = (board, playerNumber) => {
  const diag1 = [board[0][0], board[1][1], board[2][2]];
  const diag2 = [board[0][2], board[1][1], board[2][0]];

  if (diag1.every((cell) => cell === playerNumber) || diag2.every((cell) => cell === playerNumber)) {
    return true;
  }

  for (let i = 0; i < 3; i++) {
    if (board[i].every((cell) => cell === playerNumber)) {
      return true;
    }
    if (board.every((row) => row[i] === playerNumber)) {
      return true;
    }
  }

  return false;
};

const checkDraw = (board) => {
  return board.every((row) => row.every((cell) => cell !== 0));
};

io.on('connection', (socket) => {
  console.log(`Socket ${socket.id} connected`);
  console.log(gameState);
  if (!gameState.player1) {
    gameState.player1 = socket.id;
    socket.emit('playerNumber', { player: 1 });
  } else if (!gameState.player2) {
    gameState.player2 = socket.id;
    socket.emit('playerNumber', { player: 2 });

    resetGameState();
    io.emit('gameState', { state: gameState });
  } else {
    socket.emit('playerNumber', { player: null });
  }

  socket.on('move', ({ col, row }) => {
    const player = getPlayerNumber(socket.id);
    if (player && player === gameState.turn && gameState.board[row][col] === 0) {
      gameState.board[row][col] = player;
      const winner = checkWin(gameState.board, player) ? player : checkDraw(gameState.board) ? 0 : null;
      if (winner !== null) {
        io.emit('winner', { winner });
        resetGameState();
      } else {
        gameState.turn = player === 1 ? 2 : 1;
        io.emit('gameState', { state: gameState });
      } 
    }
  });

  socket.on('reset', () => {
    if (socket.id === gameState.player1 || socket.id === gameState.player2) {
      resetGameState();
      io.emit('gameReset');
    }
  });

  socket.on('disconnect', () => {
    console.log(`Socket ${socket.id} disconnected`);
    if (socket.id === gameState.player1) {
      gameState.player1 = null;
    } else if (socket.id === gameState.player2) {
      gameState.player2 = null;
    }
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
