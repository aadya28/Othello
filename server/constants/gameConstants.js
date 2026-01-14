/**
 * Server-Side Game Constants
 */

const BOARD_SIZE = 8;

const PLAYER_COLORS = {
  BLUE: 'B',
  RED: 'R',
};

const CELL_TYPES = {
  EMPTY: 'empty',
  REGULAR: 'regular',
  SHIELD: 'shield',
  BOMB: 'bomb',
};

const GAME_MODES = {
  SHIFU: 'shifu',
  MULTIPLAYER: 'multiplayer',
};

// All 8 directions: right, down, left, up, and 4 diagonals
const DIRECTIONS = [
  [0, 1],   // right
  [1, 0],   // down
  [0, -1],  // left
  [-1, 0],  // up
  [-1, -1], // top-left
  [-1, 1],  // top-right
  [1, -1],  // bottom-left
  [1, 1]    // bottom-right
];

// Initial board setup for Othello/Reversi
const INITIAL_BOARD = Array(BOARD_SIZE).fill(null).map(() =>
    Array(BOARD_SIZE).fill({ type: CELL_TYPES.EMPTY, player: null })
);

// Shifu AI compliments
const SHIFU_COMPLIMENTS = [
  "Impressive move!",
  "Excellent strategy!",
  "You're getting better...",
  "Wise choice, young grasshopper.",
  "Even Shifu is impressed!"
];

// Shifu AI sarcasm
const SHIFU_SARCASM = [
  "Is that all you've got?",
  "Even a duck could do better!",
  "Shifu is unimpressed...",
  "Calculating your master plan... or just randomly clicking?",
  "Ah yes, the classic 'hope for the best' tactic."
];

module.exports = {
  BOARD_SIZE,
  PLAYER_COLORS,
  CELL_TYPES,
  GAME_MODES,
  DIRECTIONS,
  INITIAL_BOARD,
  SHIFU_COMPLIMENTS,
  SHIFU_SARCASM,
};
