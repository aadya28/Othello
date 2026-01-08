import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Lobby.css';
import { PLAYER_COLORS, GAME_CODE } from '../constants/gameConstants';

const Lobby = ({ setGameCode, setPlayerColor }) => {
  const [code, setCode] = useState('');
  const navigate = useNavigate();

  const createGame = () => {
    const newCode = Math.random().toString(GAME_CODE.RADIX).substring(GAME_CODE.LENGTH, GAME_CODE.LENGTH + GAME_CODE.LENGTH).toUpperCase();
    setGameCode(newCode);
    setPlayerColor(PLAYER_COLORS.BLUE);
    navigate(`/game/${newCode}`);
  };

  const joinGame = () => {
    setGameCode(code);
    setPlayerColor(PLAYER_COLORS.RED);
    navigate(`/game/${code}`);
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
