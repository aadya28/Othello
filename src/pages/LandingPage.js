import React, { useState } from "react";
import "./LandingPage.css";
import { useGameContext } from '../context/GameContext';
import { generateGameCode } from '../utils/gameCodeGenerator';

const LandingPage = () => {
  const [code, setCode] = useState("");
  const [createdCode, setCreatedCode] = useState("");
  const [copied, setCopied] = useState(false);
  const { createGame: createGameContext, joinGame: joinGameContext, startShifuGame, startGame: startGameContext } = useGameContext();

  const createGame = () => {
    const newCode = generateGameCode();
    createGameContext(newCode);
    setCreatedCode(newCode);
    setCopied(false);
  };

  const joinGame = () => {
    if (code.trim() === "") return;
    joinGameContext(code);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(createdCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 5000);
  };

  const startGame = () => {
    startGameContext();
  };

  const startGameWithShifu = () => {
    startShifuGame();
  };

  return (
    <div className="landing-page">
      
      <h1>Welcome to Duckland!</h1>
      <p className="subtitle">Strategize, Play, and Win with your Duckie Companion!</p>

      <button className="glow-button" onClick={createGame}>
        🏆 Create Game
      </button>

      {createdCode && (
        <div className="game-code">
          <p>Game Code: <span className="game-code-text">{createdCode}</span></p>
          <button onClick={copyToClipboard} className={`copy-button ${copied ? "copied" : ""}`}>
            {copied ? "✅ Copied" : "📋 Copy Code"}
          </button>
          <button className="start-button" onClick={startGame}>🚀 Start Game</button>
        </div>
      )}

      <input
        type="text"
        className="game-input"
        placeholder="Enter game code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />

      <button className="glow-button" onClick={joinGame} disabled={!code.trim()}>
        🔗 Join Game
      </button>

      <button className="shifu-button" onClick={startGameWithShifu}>
      <img src={`${process.env.PUBLIC_URL}/images/Shifu.jpg`} alt="Shifu" className="shifu-img" />
        Play Against Shifu
      </button>
    </div>
  );
};

export default LandingPage;
