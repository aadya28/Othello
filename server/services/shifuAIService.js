/**
 * Shifu AI Service - Pure business logic for AI opponent
 * Framework-agnostic AI strategy and decision-making
 */

const { PLAYER_COLORS, CELL_TYPES, SHIFU_COMPLIMENTS, SHIFU_SARCASM } = require('../constants/gameConstants');
const { getValidMoves } = require('./boardService');

// Helper function for random element selection
const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];

/**
 * Calculate the best move for Shifu AI
 * Currently uses random valid move selection
 */
const calculateAIMove = (board, player = PLAYER_COLORS.RED) => {
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

/**
 * Generate Shifu's comment based on who's winning the game
 */
const generateShifuComment = (blueCount, redCount) => {
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
      text: "A tie? Let\'s see if you can break it!",
      emoji: '🤔',
      type: 'neutral'
    };
  }
};


module.exports = { calculateAIMove, generateShifuComment };
