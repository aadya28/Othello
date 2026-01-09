/**
 * Game Constants
 * Centralized configuration for the Othello Duckies game
 */

export const BOARD_SIZE = 8;

export const PLAYER_COLORS = {
  BLUE: 'B',
  RED: 'R',
};

export const CELL_TYPES = {
  EMPTY: 'empty',
  REGULAR: 'regular',
  SHIELD: 'shield',
  BOMB: 'bomb',
};

export const GAME_MODES = {
  SHIFU: 'shifu',
  MULTIPLAYER: 'multiplayer',
};

// All 8 directions: right, down, left, up, and 4 diagonals
export const DIRECTIONS = [
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
export const INITIAL_BOARD = Array(BOARD_SIZE).fill(null).map(() => 
  Array(BOARD_SIZE).fill({ type: CELL_TYPES.EMPTY, player: null })
);

// Set up initial pieces in the center
INITIAL_BOARD[3][3] = { type: CELL_TYPES.REGULAR, player: PLAYER_COLORS.RED };
INITIAL_BOARD[3][4] = { type: CELL_TYPES.REGULAR, player: PLAYER_COLORS.BLUE };
INITIAL_BOARD[4][3] = { type: CELL_TYPES.REGULAR, player: PLAYER_COLORS.BLUE };
INITIAL_BOARD[4][4] = { type: CELL_TYPES.REGULAR, player: PLAYER_COLORS.RED };

// Shifu comments and responses
export const SHIFU_COMPLIMENTS = [
  "Impressive move!",
  "You're getting the hang of this!",
  "Well done!",
  "Okay, show off.",
  "Beginner's luck? Or did you sell your soul for this?",
  "I think you're enjoying this a little too much."
];

export const SHIFU_SARCASM = [
  "Is that all you've got?",
  "Even a duck could do better!",
  "Shifu is unimpressed...",
  "Calculating your master plan... or just randomly clicking?",
  "Ah yes, the classic 'hope for the best' tactic."
];

// Image paths
export const IMAGE_PATHS = {
  BLUE_DUCKIE: '/images/blue_duckie.png',
  RED_DUCKIE: '/images/red_duckie.png',
  BLUE_SHIELD: '/images/blue_shield_duckie.png',
  RED_SHIELD: '/images/red_shield_duckie.png',
  BLUE_BOMB: '/images/blue_bomb_duckie.png',
  RED_BOMB: '/images/red_bomb_duckie.png',
  SHIFU: `${process.env.PUBLIC_URL}/images/Shifu.jpg`,
};

// Game code generation settings
export const GAME_CODE = {
  LENGTH: 5,
  RADIX: 36,
};

// Notification settings
export const NOTIFICATION = {
  DURATION: 2000,
  FADE_OUT_DURATION: 500,
};

// Timings
export const TIMINGS = {
  COMPUTER_MOVE_DELAY: 1000,
  SHIFU_COMMENT_DURATION: 5000,
};

// Server configuration
export const SERVER_CONFIG = {
  URL: process.env.REACT_APP_SERVER_URL || 'http://localhost:3001',
  RECONNECTION: true,
  RECONNECTION_DELAY: 1000,
  RECONNECTION_DELAY_MAX: 5000,
  RECONNECTION_ATTEMPTS: 5,
};
