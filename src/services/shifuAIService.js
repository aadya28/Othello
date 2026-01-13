/**
 * Shifu AI Service - Pure business logic for AI opponent
 * Framework-agnostic AI strategy and decision making
 */

import { PLAYER_COLORS, CELL_TYPES, SHIFU_COMPLIMENTS, SHIFU_SARCASM } from '../constants/gameConstants';
import { getRandomElement } from '../utils/helpers';
import { getValidMoves } from './boardService';

/**
 * Generate Shifu's comment based on who's winning the game
 * @param {number} blueCount - Number of blue pieces (user)
 * @param {number} redCount - Number of red pieces (Shifu)
 * @returns {Object} Object with comment text and emoji
 */
export const generateShifuComment = (blueCount, redCount) => {
  if (redCount > blueCount) {
    const sarcasm = getRandomElement(SHIFU_SARCASM);
    return {
      text: sarcasm,
      emoji: '😏',
      type: 'sarcasm'
    };
  } else if (blueCount > redCount) {
    const compliment = getRandomElement(SHIFU_COMPLIMENTS);
    return {
      text: compliment,
      emoji: '👏',
      type: 'compliment'
    };
  } else {
    return {
      text: 'A tie? Let\'s see if you can break it!',
      emoji: '🤔',
      type: 'neutral'
    };
  }
};

/**
 * Calculate the best move for Shifu AI
 * Currently uses random valid move selection
 * 
 * @param {Array<Array>} board - The game board
 * @param {string} player - AI player color (usually 'R')
 * @returns {Object} Object with move coordinates or null if no valid moves
 */
export const calculateAIMove = (board, player = PLAYER_COLORS.RED) => {
  const validMoves = getValidMoves(board, player);
  
  if (validMoves.length === 0) {
    return null;
  }

  // Strategy: Random selection from valid moves
  const [row, col] = getRandomElement(validMoves);
  
  return {
    row,
    col,
    type: CELL_TYPES.REGULAR,
    player
  };
};
