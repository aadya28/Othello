/**
 * Game Constants
 * Centralized configuration for the Othello Duckies game
 */

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

// Image paths
export const IMAGE_PATHS = {
  BLUE_DUCKIE: '/images/blue_duckie.png',
  RED_DUCKIE: '/images/red_duckie.png',
  BLUE_SHIELD: '/images/blue_shield_duckie.png',
  RED_SHIELD: '/images/red_shield_duckie.png',
  BLUE_BOMB: '/images/blue_bomb_duckie.png',
  RED_BOMB: '/images/red_bomb_duckie.png',
  SHIFU: `${process.env.PUBLIC_URL}/images/shifu.jpg`,
};

// Notification settings
export const NOTIFICATION = {
  DURATION: 2000,
  FADE_OUT_DURATION: 500,
};

// Server configuration
export const SERVER_CONFIG = {
  URL: process.env.REACT_APP_SERVER_URL || 'http://localhost:3001',
  RECONNECTION: true,
  RECONNECTION_DELAY: 1000,
  RECONNECTION_DELAY_MAX: 5000,
  RECONNECTION_ATTEMPTS: 5,
};
