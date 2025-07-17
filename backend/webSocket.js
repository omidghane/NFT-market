const app = require('express')();
const http = require('http').createServer(app);
// const io = require('socket.io')(http);
const io = require('socket.io')(http, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      allowedHeaders: ['my-custom-header'],
      credentials: true
    }
});
  

let games = {};



io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('join-game', (gameId) => { 
    if (!games[gameId]) {
      // create a new game if it does not exist
      games[gameId] = { players: [socket], board: new Array(9).fill(''), turn: 0 };
    } else if (games[gameId].players.length === 1) {
      // join an existing game if there is only one player
      games[gameId].players.push(socket);
      io.to(gameId).emit('start-game', games[gameId].board);
    } else {
      // cannot join a full game
      socket.emit('game-full');
    }

    socket.join(gameId);
  });

  socket.on('move', ({ index, gameId }) => {
    const game = games[gameId];
    console.log(game);
    // console.log('conditions =>',game.players.length === 2 && game.players[game.turn] === socket && game.board[index] === '');
    // console.log('conditions =>',game.players.length === 2 , game.players[game.turn] === socket , game.board[index] === ''); 
    // console.log("Why equal? ==>",game.players[game.turn]); 

    if (game.players.length === 2 && game.players[game.turn] === socket && game.board[index] === '') {
      game.board[index] = game.turn % 2 === 0 ? 'X' : 'O';
      io.to(gameId).emit('update-board', game.board);
    //   console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",game.turn); 
    //   game.turn++;
    game.turn === 0 ? game.turn = 1 : game.turn = 0;
    }
  });  
  // game.board[0] != ''
  socket.on('disconnect', () => {
    console.log('user disconnected');
    
    // remove the game from the list of games if no players are left
    Object.keys(games).forEach((gameId) => {

      if (games[gameId].players.includes(socket)) {
        games[gameId].players = games[gameId].players.filter((player) => player !== socket); 
        if (games[gameId].players.length === 0) {   
          delete games[gameId];  
        } else if (games[gameId].players.length === 1) { 
          games[gameId].board = new Array(9).fill('');
          io.to(gameId).emit('opponent-disconnected'); 
        }
      }
    });
  });
});

http.listen(3001, () => {
  console.log('listening on *:3001');
});
