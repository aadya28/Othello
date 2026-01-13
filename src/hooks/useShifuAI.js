import { useEffect, useCallback } from 'react';
import { GAME_MODES, PLAYER_COLORS, TIMINGS } from '../constants/gameConstants';
import * as shifuAIService from '../services/shifuAIService';

/**
 * Custom hook for Shifu AI logic
 * @param {Object} params - Parameters for Shifu AI
 * @returns {Object} Shifu AI functions
 */
const useShifuAI = ({
  gameCode,
  currentPlayer,
  board,
  blueCount,
  redCount,
  shieldedCells,
  setBoard,
  setCurrentPlayer,
  setShifuComment,
  calculatePieceCount,
  calculateValidMoves,
  flipGamePieces,
  verifyGameOver,
  onNotification,
}) => {
  /**
   * Execute computer move for Shifu AI
   */
  const executeComputerMove = useCallback(() => {
    // Calculate AI move using service
    const move = shifuAIService.calculateAIMove(board, PLAYER_COLORS.RED);
    
    if (move) {
      const newBoard = flipGamePieces(board, move.row, move.col, move.player, move.type, shieldedCells);
      setBoard(newBoard);
      calculatePieceCount(newBoard);
      
      // Check if game is over after Shifu's move
      verifyGameOver(newBoard);
      
      // Generate Shifu's comment based on who's winning
      const comment = shifuAIService.generateShifuComment(blueCount, redCount);
      setShifuComment(`${comment.emoji} ${comment.text}`);
      onNotification(comment.text);

      // Clear Shifu's comment after specified time
      setTimeout(() => {
        setShifuComment('');
      }, TIMINGS.SHIFU_COMMENT_DURATION);
      
      setCurrentPlayer(PLAYER_COLORS.BLUE);
    } else {
      // No valid moves for Shifu - check if game is over or pass turn
      const blueValidMoves = calculateValidMoves(board, PLAYER_COLORS.BLUE);
      
      if (blueValidMoves.length > 0) {
        // User still has moves, pass turn back
        setCurrentPlayer(PLAYER_COLORS.BLUE);
        onNotification("Computer has no valid moves, your turn again!");
      } else {
        // Neither player has moves - game over
        verifyGameOver(board);
      }
    }
  }, [board, blueCount, redCount, shieldedCells, calculatePieceCount, calculateValidMoves, flipGamePieces, verifyGameOver, setBoard, setCurrentPlayer, setShifuComment, onNotification]);

  // Trigger Shifu move when it's the computer's turn
  useEffect(() => {
    if (gameCode === GAME_MODES.SHIFU && currentPlayer === PLAYER_COLORS.RED) {
      const timeoutId = setTimeout(executeComputerMove, TIMINGS.COMPUTER_MOVE_DELAY);
      return () => clearTimeout(timeoutId);
    }
  }, [currentPlayer, gameCode, executeComputerMove]);

  return {
    executeComputerMove,
  };
};

export default useShifuAI;
