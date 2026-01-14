import { useState } from 'react';
import { PLAYER_COLORS, CELL_TYPES } from '../constants/gameConstants';

/**
 * Custom hook to manage all game state
 * @returns {Object} Game state and setters
 */
const useGameStates = () => {
  const [notification, setNotification] = useState(null);
  const [board, setBoard] = useState(null);
  const [assignedColor, setAssignedColor] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(PLAYER_COLORS.BLUE);
  const [validMoves, setValidMoves] = useState([]);

  const [blueCount, setBlueCount] = useState(2);
  const [redCount, setRedCount] = useState(2);

  const [selectedDucky, setSelectedDucky] = useState(CELL_TYPES.REGULAR);
  const [shieldUsed, setShieldUsed] = useState({
    [PLAYER_COLORS.BLUE]: false,
    [PLAYER_COLORS.RED]: false
  });
  const [shieldedCells, setShieldedCells] = useState({ 
    [PLAYER_COLORS.BLUE]: [], 
    [PLAYER_COLORS.RED]: [] 
  });

  const [shifuComment, setShifuComment] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);

  // Reset all game state
  const resetGameState = () => {
    setNotification(null);
    setBoard(null);
    setCurrentPlayer(PLAYER_COLORS.BLUE);
    setValidMoves([]);
    setSelectedDucky(CELL_TYPES.REGULAR);
    setBlueCount(2);
    setRedCount(2);
    setShieldedCells({ [PLAYER_COLORS.BLUE]: [], [PLAYER_COLORS.RED]: [] });
    setShieldUsed({ [PLAYER_COLORS.BLUE]: false, [PLAYER_COLORS.RED]: false });
    setGameOver(false);
    setWinner(null);
  };

  return {
    // State
    notification,
    board,
    currentPlayer,
    validMoves,
    selectedDucky,
    blueCount,
    redCount,
    shieldedCells,
    shieldUsed,
    gameOver,
    winner,
    assignedColor,
    shifuComment,
    
    // Setters
    setNotification,
    setBoard,
    setCurrentPlayer,
    setValidMoves,
    setSelectedDucky,
    setBlueCount,
    setRedCount,
    setShieldedCells,
    setShieldUsed,
    setGameOver,
    setWinner,
    setAssignedColor,
    setShifuComment,
    
    // Actions
    resetGameState,
  };
};

export default useGameStates;
