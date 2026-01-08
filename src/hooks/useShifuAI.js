import { useEffect } from 'react';
import { PLAYER_COLORS, CELL_TYPES, GAME_MODES, SHIFU_COMPLIMENTS, SHIFU_SARCASM, TIMINGS } from '../constants/gameConstants';
import { getRandomElement } from '../utils/randomHelpers';
import { displayNotification } from '../utils/notificationHelper';

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
    
    const randomCompliment = getRandomElement(SHIFU_COMPLIMENTS);
    const randomSarcasm = getRandomElement(SHIFU_SARCASM);

    // Set Shifu's comment based on performance
    if (shifuGain > userGain) {
      console.log('Shifu Comment (Shifu gains more pieces):', randomSarcasm);
      setShifuComment(`😏 ${randomSarcasm}`);
      displayNotification(randomSarcasm);
    } else if (userGain > shifuGain) {
      console.log('Shifu Comment (User gains more pieces):', randomCompliment);
      setShifuComment(`👏 ${randomCompliment}`);
      displayNotification(randomCompliment);
    } else {
      console.log('Shifu Comment (Tie): Seems like we are evenly matched...');
      setShifuComment('🤔 Seems like we are evenly matched...');
      displayNotification('Seems like we are evenly matched...');
    }

    // Clear Shifu's comment after specified time
    setTimeout(() => {
      setShifuComment('');
    }, TIMINGS.SHIFU_COMMENT_DURATION);

    // Calculate valid moves and make a move
    const validMoves = calculateValidMoves(board, PLAYER_COLORS.RED);
    if (validMoves.length > 0) {
      const [row, col] = getRandomElement(validMoves);
      const newBoard = flipGamePieces(board, row, col, PLAYER_COLORS.RED, CELL_TYPES.REGULAR, shieldedCells);
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
