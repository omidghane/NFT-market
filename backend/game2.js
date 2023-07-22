import { useState, useEffect } from 'react';
import io from 'socket.io-client';

const Board = ({ gameState, handleMove }) => {
  return (
    <div className="grid grid-cols-3 gap-4 mb-4">
      {gameState.board.map((row, i) => (
        <div key={i} className="flex">
          {row.map((col, j) => (
            <button
              key={`${i}${j}`}
              className="bg-gray-200 px-4 py-3 rounded-lg text-3xl text-gray-600 font-bold flex items-center justify-center"
              onClick={() => handleMove(j, i)}
              disabled={col !== 0}
            >
              {col === 1 ? 'X' : col === 2 ? 'O' : ''}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};

const PlayerMessage = ({ gameState, playerNumber }) => {
  if (gameState && gameState.turn === 0) {
    return <div>Waiting for a second player to join...</div>;
  }
  console.log(playerNumber);
  const isPlayerTurn = gameState.turn === playerNumber;
  const playerMarker = playerNumber === 1 ? 'X' : 'O';
  const otherPlayerMarker = playerNumber === 1 ? 'O' : 'X';

  if (gameState.turn === 3) {
    const isWinner = gameState[playerNumber === 1 ? 'player1' : 'player2'] === 'WIN';
    if (isWinner) {
      return <div className="text-green-500 font-bold text-lg">You won! 🎉</div>;
    } else {
      return <div className="text-red-500 font-bold text-lg">You lost! 😞</div>;
    }
  } else if (gameState.turn === 4) {
    return <div className="text-yellow-500 font-bold text-lg">It's a draw! 😐</div>;
  } else {
    return (
      <div className="mb-2">
        <div className="font-bold text-lg mb-2">{isPlayerTurn ? "It's your turn" : "Waiting for opponent"}</div>
        {isPlayerTurn && <div className="text-gray-500">You are "{playerMarker}"</div>}
        {!isPlayerTurn && <div className="text-gray-500">Your opponent is "{otherPlayerMarker}"</div>}
      </div>
    );
  }
};

const TicTacToe = () => {
  const [gameState, setGameState] = useState(null);
  const [socket, setSocket] = useState(null);
  const [playerNumber, setPlayerNumber] = useState(null);

  const handleMove = (col, row) => {
    if (gameState.turn !== playerNumber) {
      return;
    }
    socket.emit('move', { col, row });
  };

  useEffect(() => {
    const newSocket = io("http://localhost:3001");
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('connected');
    });

    newSocket.on('playerNumber', ({ player }) => {
      console.log(`player number: ${player}`);
      setPlayerNumber(player);
    });

    newSocket.on('playerJoined', ({ player }) => {
      console.log(`${player} joined the game`);
    });

    newSocket.on('turnChange', ({ turn }) => {
      console.log(`turn changed to: ${turn}`);
      setGameState((prevState) => ({ ...prevState, turn })); 
    });

    newSocket.on('winner', ({ winner }) => {
      console.log(`player ${winner} won`);
      const isWinner = winner === playerNumber;
      setGameState((prevState) => ({ ...prevState, [playerNumber === 1 ? 'player1' : 'player2']: isWinner ? 'WIN' : 'LOSE', turn: 3 }));
    });

    newSocket.on('gameReset', () => {
      console.log('game reset');
      setGameState(null);
    });

    newSocket.on('gameState', ({ state }) => {
      console.log(`game state: ${JSON.stringify(state)}`);
      setGameState(state);
    });

    // Clean up the effect
    return () => newSocket.close();
  }, []);

  return (
    <div className="container mx-auto max-w-lg mt-8 py-8 px-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">🎮 Tic Tac Toe </h1>
      {playerNumber && (
        <>
          <PlayerMessage gameState={gameState} playerNumber={playerNumber} />
          {gameState && <Board gameState={gameState} handleMove={handleMove} />}
        </>
      )}
      {!playerNumber && <div>Connecting to server...</div>}
    </div>
  );
};

export default TicTacToe;
