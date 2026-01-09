import React, { useState } from 'react';
import './Lobby.css';
import { useGameContext } from '../context/GameContext';
import { generateGameCode } from '../utils/gameCodeGenerator';

const Lobby = () => {
  const [code, setCode] = useState('');
  const { createGame: createGameContext, joinGame: joinGameContext } = useGameContext();

  const createGame = () => {
    const newCode = generateGameCode();
    createGameContext(newCode);
  };

  const joinGame = () => {
    joinGameContext(code);
  };

  return (
    <div className="lobby">
      <h1>Join or Create a Game</h1>
      <button onClick={createGame}>Create Game</button>
      <input
        type="text"
        placeholder="Enter game code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <button onClick={joinGame}>Join Game</button>
    </div>
  );
};

export default Lobby;
