import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PLAYER_COLORS, GAME_MODES } from '../constants/gameConstants';

/**
 * GameContext - Provides global game state management
 * Eliminates prop drilling and centralizes game configuration
 */
const GameContext = createContext(undefined);

/**
 * Custom hook to access GameContext
 * @throws {Error} If used outside GameProvider
 * @returns {Object} Game context value
 */
export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};

/**
 * GameProvider - Wraps app and provides game state
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export const GameProvider = ({ children }) => {
  const [gameCode, setGameCode] = useState('');
  const [playerColor, setPlayerColor] = useState('');
  const navigate = useNavigate();

  /**
   * Create a new game with the given code
   * @param {string} code - Generated game code
   */
  const createGame = (code) => {
    setGameCode(code);
    setPlayerColor(PLAYER_COLORS.BLUE);
  };

  /**
   * Join an existing game with the given code
   * @param {string} code - Game code to join
   */
  const joinGame = (code) => {
    setGameCode(code);
    setPlayerColor(PLAYER_COLORS.RED);
    navigate(`/game/${code}`);
  };

  /**
   * Start a game against Shifu AI
   */
  const startShifuGame = () => {
    setGameCode(GAME_MODES.SHIFU);
    setPlayerColor(PLAYER_COLORS.BLUE);
    navigate(`/game/${GAME_MODES.SHIFU}`);
  };

  /**
   * Navigate to game with current game code
   */
  const startGame = () => {
    if (gameCode) {
      navigate(`/game/${gameCode}`);
    }
  };

  /**
   * Reset game state
   */
  const resetGame = () => {
    setGameCode('');
    setPlayerColor('');
  };

  const value = {
    // State
    gameCode,
    playerColor,
    
    // Actions
    setGameCode,
    setPlayerColor,
    createGame,
    joinGame,
    startShifuGame,
    startGame,
    resetGame,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export default GameContext;
