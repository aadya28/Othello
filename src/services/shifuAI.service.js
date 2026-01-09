/**
 * Shifu AI Service - Pure business logic for AI opponent
 * Framework-agnostic AI strategy and decision making
 */

import { PLAYER_COLORS, CELL_TYPES, SHIFU_COMPLIMENTS, SHIFU_SARCASM } from '../constants/gameConstants';
import { getRandomElement } from '../utils/randomHelpers';
import { getValidMoves } from './boardService';

/**
 * Generate Shifu's comment based on performance comparison
 * @param {number} userGain - Number of pieces gained by user
 * @param {number} shifuGain - Number of pieces gained by Shifu
 * @returns {Object} Object with comment text and emoji
 */
export const generateShifuComment = (userGain, shifuGain) => {
  if (shifuGain > userGain) {
    const sarcasm = getRandomElement(SHIFU_SARCASM);
    return {
      text: sarcasm,
      emoji: '😏',
      type: 'sarcasm'
    };
  } else if (userGain > shifuGain) {
    const compliment = getRandomElement(SHIFU_COMPLIMENTS);
    return {
      text: compliment,
      emoji: '👏',
      type: 'compliment'
    };
  } else {
    return {
      text: 'Seems like we are evenly matched...',
      emoji: '🤔',
      type: 'neutral'
    };
  }
};

/**
 * Calculate the best move for Shifu AI
 * Currently uses random valid move selection
 * Can be enhanced with strategy algorithms (minimax, alpha-beta pruning, etc.)
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

  // Current strategy: Random selection
  // TODO: Implement strategic move selection:
  // - Prioritize corner positions
  // - Avoid positions that give opponent corners
  // - Maximize piece flips
  // - Consider board control
  
  const [row, col] = getRandomElement(validMoves);
  
  return {
    row,
    col,
    type: CELL_TYPES.REGULAR,
    player
  };
};

/**
 * Evaluate move quality (for future advanced AI)
 * @param {Array<Array>} board - The game board
 * @param {number} row - Row index
 * @param {number} col - Column index
 * @param {string} player - Player color
 * @returns {number} Score for the move (higher is better)
 */
export const evaluateMoveScore = (board, row, col, player) => {
  // TODO: Implement scoring algorithm
  // - Corner positions: +100
  // - Edge positions: +10
  // - Positions that give opponent corners: -50
  // - Number of pieces flipped: +1 per piece
  // - Board control: weighted by position
  
  return 0;
};

/**
 * Get strategic move priorities
 * @returns {Object} Strategic positions and their priorities
 */
export const getStrategyPriorities = () => {
  return {
    corners: [
      [0, 0], [0, 7], [7, 0], [7, 7]
    ],
    dangerZones: [
      [0, 1], [1, 0], [1, 1], // Near top-left corner
      [0, 6], [1, 6], [1, 7], // Near top-right corner
      [6, 0], [6, 1], [7, 1], // Near bottom-left corner
      [6, 6], [6, 7], [7, 6]  // Near bottom-right corner
    ],
    edges: [
      [0, 2], [0, 3], [0, 4], [0, 5], // Top edge
      [7, 2], [7, 3], [7, 4], [7, 5], // Bottom edge
      [2, 0], [3, 0], [4, 0], [5, 0], // Left edge
      [2, 7], [3, 7], [4, 7], [5, 7]  // Right edge
    ]
  };
};
