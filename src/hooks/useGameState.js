import { useState } from 'react';
import { INITIAL_BOARD, PLAYER_COLORS, CELL_TYPES } from '../constants/gameConstants';

/**
 * Custom hook to manage all game state
 * @returns {Object} Game state and setters
 */
const useGameState = () => {
  const [board, setBoard] = useState(INITIAL_BOARD);
  const [currentPlayer, setCurrentPlayer] = useState(PLAYER_COLORS.BLUE);
  const [validMoves, setValidMoves] = useState([]);
  const [selectedDucky, setSelectedDucky] = useState(CELL_TYPES.REGULAR);
  const [blueCount, setBlueCount] = useState(2);
  const [redCount, setRedCount] = useState(2);
  const [prevBlueCount, setPrevBlueCount] = useState(2);
  const [prevRedCount, setPrevRedCount] = useState(2);
  const [shieldedCells, setShieldedCells] = useState({ 
    [PLAYER_COLORS.BLUE]: [], 
    [PLAYER_COLORS.RED]: [] 
  });
  const [shieldUsed, setShieldUsed] = useState({ 
    [PLAYER_COLORS.BLUE]: false, 
    [PLAYER_COLORS.RED]: false 
  });
  const [selectedCell, setSelectedCell] = useState(null);
  const [bombs, setBombs] = useState({ 
    [PLAYER_COLORS.BLUE]: null, 
    [PLAYER_COLORS.RED]: null 
  });
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [assignedColor, setAssignedColor] = useState(null);
  const [shifuComment, setShifuComment] = useState('');

  // Reset all game state
  const resetGameState = () => {
    setBoard(INITIAL_BOARD);
    setCurrentPlayer(PLAYER_COLORS.BLUE);
    setValidMoves([]);
    setSelectedDucky(CELL_TYPES.REGULAR);
    setBlueCount(2);
    setRedCount(2);
    setPrevBlueCount(2);
    setPrevRedCount(2);
    setShieldedCells({ [PLAYER_COLORS.BLUE]: [], [PLAYER_COLORS.RED]: [] });
    setShieldUsed({ [PLAYER_COLORS.BLUE]: false, [PLAYER_COLORS.RED]: false });
    setSelectedCell(null);
    setBombs({ [PLAYER_COLORS.BLUE]: null, [PLAYER_COLORS.RED]: null });
    setGameOver(false);
    setWinner(null);
  };

  return {
    // State
    board,
    currentPlayer,
    validMoves,
    selectedDucky,
    blueCount,
    redCount,
    prevBlueCount,
    prevRedCount,
    shieldedCells,
    shieldUsed,
    selectedCell,
    bombs,
    gameOver,
    winner,
    assignedColor,
    shifuComment,
    
    // Setters
    setBoard,
    setCurrentPlayer,
    setValidMoves,
    setSelectedDucky,
    setBlueCount,
    setRedCount,
    setPrevBlueCount,
    setPrevRedCount,
    setShieldedCells,
    setShieldUsed,
    setSelectedCell,
    setBombs,
    setGameOver,
    setWinner,
    setAssignedColor,
    setShifuComment,
    
    // Actions
    resetGameState,
  };
};

export default useGameState;
