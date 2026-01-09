import { useEffect } from 'react';
import { GAME_MODES, PLAYER_COLORS, TIMINGS } from '../constants/gameConstants';
import { displayNotification } from '../utils/notificationHelper';
import * as shifuAIService from '../services/shifuAI.service';

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
  prevBlueCount,
  prevRedCount,
  shieldedCells,
  setBoard,
  setCurrentPlayer,
  setShifuComment,
  calculatePieceCount,
  calculateValidMoves,
  flipGamePieces,
}) => {
  /**
   * Execute computer move for Shifu AI
   */
  const executeComputerMove = () => {
    const userGain = blueCount - prevBlueCount;
    const shifuGain = redCount - prevRedCount;

    console.log('User gain:', userGain);
    console.log('Shifu gain:', shifuGain);
    
    // Generate Shifu's comment using service
    const comment = shifuAIService.generateShifuComment(userGain, shifuGain);
    console.log(`Shifu Comment (${comment.type}):`, comment.text);
    setShifuComment(`${comment.emoji} ${comment.text}`);
    displayNotification(comment.text);

    // Clear Shifu's comment after specified time
    setTimeout(() => {
      setShifuComment('');
    }, TIMINGS.SHIFU_COMMENT_DURATION);

    // Calculate AI move using service
    const move = shifuAIService.calculateAIMove(board, PLAYER_COLORS.RED);
    
    if (move) {
      const newBoard = flipGamePieces(board, move.row, move.col, move.player, move.type, shieldedCells);
      setBoard(newBoard);
      calculatePieceCount(newBoard);
      setCurrentPlayer(PLAYER_COLORS.BLUE);
    } else {
      // No valid moves for computer, pass turn back to player
      setCurrentPlayer(PLAYER_COLORS.BLUE);
      displayNotification("Computer has no valid moves, your turn again!");
    }
  };

  // Trigger Shifu move when it's the computer's turn
  useEffect(() => {
    if (gameCode === GAME_MODES.SHIFU && currentPlayer === PLAYER_COLORS.RED) {
      const timeoutId = setTimeout(executeComputerMove, TIMINGS.COMPUTER_MOVE_DELAY);
      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPlayer, gameCode]);

  return {
    executeComputerMove,
  };
};

export default useShifuAI;
