import { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

function TicTacToe() {
  const [board, setBoard] = useState(new Array(9).fill('')); // represents the Tic Tac Toe board
  const [turn, setTurn] = useState(0);
  const [gameId, setGameId] = useState('');
  const [connected, setConnected] = useState(true);
  const [opponentDisconnected, setOpponentDisconnected] = useState(false);
  const [gameFull, setGameFull] = useState(false);

  useEffect(() => {
    console.log("ali");
    socket.on('connect', () => {
      console.log('connected to server');
      setConnected(true);
    });

    socket.on('start-game', (initBoard) => {
      console.log('game started');
      setBoard(initBoard);
      setTurn(0);
    });

    socket.on('update-board', (newBoard) => {
      setBoard(newBoard);
      setTurn((prevTurn) => prevTurn + 1);
    });

    socket.on('opponent-disconnected', () => {
      setOpponentDisconnected(true);
    });

    socket.on('game-full', () => {
      setGameFull(true);
    });
  }, []);

  function handleMove(index) {
    if (board[index] === '' && !opponentDisconnected && !gameFull) {
      socket.emit('move', { index, gameId });
    }
  }

  function startNewGame() {
    const newGameId = Math.random().toString(36).substr(2, 6);
    console.log(newGameId);
    socket.emit('join-game', newGameId);
    setGameId(newGameId);
  }

  function joinGame() {
    const gameId = prompt('Enter game ID');
    socket.emit('join-game', gameId);
    setGameId(gameId);
  }

  function resetGame() {
    socket.emit('join-game', gameId);
    setBoard(new Array(9).fill(''));
    setOpponentDisconnected(false);
    setGameFull(false);
    setTurn(0);
  }

  return (
    <div className="wrapper bg-gray-100 min-h-screen flex flex-col justify-center items-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Tic Tac Toe</h1>
      {!connected && <div>Connecting to server...</div>}
      {connected && !gameId && (
        <div className="text-2xl font-bold text-gray-800">
          <button className="bg-indigo-500 text-white px-4 py-2 rounded mr-4" onClick={startNewGame}>
            New Game
          </button>
          <button className="bg-indigo-500 text-white px-4 py-2 rounded" onClick={joinGame}>
            Join a Game
          </button>
        </div>
      )}
      {gameFull && <div>The game is full</div>}
      {(board[0] != '' && board[1] != ''&& board[2] != ''&& board[3] != ''&& board[4] != ''&& board[5] != ''&& board[6] != ''&& board[7] != ''&& board[8] != '') && (
        <div>
          Your opponent has disconnected{' '}
          <button className="border border-indigo-500 rounded px-2 py-1 ml-2" onClick={resetGame}>
            Restart
          </button>
        </div>
      )}
      {connected && gameId && (
        <>
          <div className="board grid grid-cols-3 gap-4"> 
            {board.map((cell, index) => (
              <div
                key={index}
                className="cell bg-gray-200 text-center text-gray-700 font-bold text-4xl w-16 h-16 flex justify-center items-center cursor-pointer hover:bg-gray-300"
                onClick={() => handleMove(index)}
              >
                {cell}
              </div>
            ))}
          </div>
          <div className="status text-3xl font-bold text-gray-800 mt-8">
            {turn % 2 === 0 ? "Player X's Turn" : "Player O's Turn"}
          </div>
        </>
      )}
    </div>
  );
}

export default TicTacToe;

