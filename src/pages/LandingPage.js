import React, {useState} from "react";
import {useNavigate} from 'react-router-dom';
import "./LandingPage.css";
import {useGameContext} from '../context/GameContext';
import {PLAYER_COLORS, GAME_MODES, IMAGE_PATHS} from '../constants/gameConstants';

const LandingPage = () => {
    const [code, setCode] = useState("");
    const [createdCode, setCreatedCode] = useState("");
    const [copied, setCopied] = useState(false);
    const {gameCode, setGameCode, setPlayerColor} = useGameContext();
    const navigate = useNavigate();

    const generateGameCode = (length = 6) => {
        const radix = 36; // Base-36 (0-9, a-z)
        return Math.random()
            .toString(radix)
            .substring(2, 2 + length)
            .toUpperCase();
    };

    const handleCreateGame = () => {
        const newCode = generateGameCode();
        setGameCode(newCode);
        setPlayerColor(PLAYER_COLORS.BLUE);
        setCreatedCode(newCode);
        setCopied(false);
    };

    const handleJoinGame = () => {
        const cleanCode = code.trim();
        if (cleanCode === "") return;
        setGameCode(cleanCode);
        setPlayerColor(PLAYER_COLORS.RED);
        navigate(`/game/${cleanCode}`);
    };

    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(createdCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 5000);
    };

    const handleStartGame = () => {
        if (gameCode) {
            navigate(`/game/${gameCode}`);
        }
    };

    const handleStartShifuGame = () => {
        setGameCode(GAME_MODES.SHIFU);
        setPlayerColor(PLAYER_COLORS.BLUE);
        navigate(`/game/${GAME_MODES.SHIFU}`);
    };

    return (
        <div className="landing-page">

            <h1>Welcome to Duckland!</h1>
            <p className="subtitle">Strategize, Play, and Win with your Duckie Companion!</p>

            <button className="join-game-button" onClick={handleCreateGame}>
                🏆 Create Game
            </button>

            {createdCode && (
                <div className="game-code">
                    <p>Game Code: <span className="game-code-text">{createdCode}</span></p>
                    <button onClick={handleCopyToClipboard} className={`copy-button ${copied ? "copied" : ""}`}>
                        {copied ? "✅ Copied" : "📋 Copy Code"}
                    </button>
                    <button className="start-button" onClick={handleStartGame}>🚀 Start Game</button>
                </div>
            )}

            <input
                type="text"
                className="game-input"
                placeholder="Enter game code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
            />

            <button className="join-game-button" onClick={handleJoinGame} disabled={!code.trim()}>
                🔗 Join Game
            </button>

            <button className="shifu-button" onClick={handleStartShifuGame}>
                <img src={IMAGE_PATHS.SHIFU} alt="Shifu" className="shifu-img"/>
                Play Against Shifu
            </button>
        </div>
    );
};

export default LandingPage;
