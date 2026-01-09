import { useCallback } from 'react';
import { displayNotification } from '../utils/notificationHelper';
import * as boardService from '../services/boardService';

/**
 * Custom hook for game logic and rules
 * @param {Object} gameState - Current game state
 * @returns {Object} Game logic functions
 */
const useGameLogic = (gameState) => {
  const { 
    board, 
    blueCount, 
    redCount, 
    setBlueCount, 
    setRedCount, 
    setPrevBlueCount, 
    setPrevRedCount,
    setGameOver,
    setWinner
  } = gameState;

  /**
   * Calculate piece counts for both players
   */
  const calculatePieceCount = useCallback((boardToCount) => {
    const { blue, red } = boardService.calculatePieceCount(boardToCount);
    setPrevBlueCount(blueCount);
    setPrevRedCount(redCount);
    setBlueCount(blue);
    setRedCount(red);
  }, [blueCount, redCount, setBlueCount, setRedCount, setPrevBlueCount, setPrevRedCount]);

  /**
   * Check if a move is valid
   */
  const checkIsValidMove = useCallback((boardToCheck, row, col, player) => {
    return boardService.isValidMove(boardToCheck, row, col, player);
  }, []);

  /**
   * Calculate all valid moves for a player
   */
  const calculateValidMoves = useCallback((boardToCheck, player) => {
    return boardService.getValidMoves(boardToCheck, player);
  }, []);

  /**
   * Flip game pieces after a move
   */
  const flipGamePieces = useCallback((boardToFlip, row, col, player, type, shieldedCells) => {
    return boardService.flipPieces(boardToFlip, row, col, player, type, shieldedCells);
  }, []);

  /**
   * Check if a cell can be shielded
   */
  const checkCanGetShielded = useCallback((player, shieldedCells, row, col) => {
    const result = boardService.canShieldCell(board, row, col, player);
    if (!result.isValid) {
      displayNotification(result.error);
      return false;
    }
    return true;
  }, [board]);

  /**
   * Verify if the game is over
   */
  const verifyGameOver = useCallback((boardToCheck) => {
    const { isGameOver, winner } = boardService.checkGameOver(boardToCheck);
    if (isGameOver) {
      setGameOver(true);
      setWinner(winner);
    }
  }, [setGameOver, setWinner]);

  return {
    calculatePieceCount,
    checkIsValidMove,
    calculateValidMoves,
    flipGamePieces,
    checkCanGetShielded,
    verifyGameOver,
  };
};

export default useGameLogic;
