/**
 * Board Service - Pure business logic for game board operations
 * These functions are framework-agnostic and can be used on frontend/backend
 */

import { BOARD_SIZE, PLAYER_COLORS, DIRECTIONS } from '../constants/gameConstants';
import { cloneBoard } from '../utils/boardHelpers';

/**
 * Calculate piece counts for both players
 * @param {Array<Array>} board - The game board
 * @returns {Object} Object with blue and red piece counts
 */
export const calculatePieceCount = (board) => {
  let blue = 0;
  let red = 0;
  board.forEach(row => {
    row.forEach(cell => {
      if (cell.player === 'B') blue++;
      if (cell.player === 'R') red++;
    });
  });
  return { blue, red };
};

/**
 * Check if a move is valid according to game rules
 * @param {Array<Array>} board - The game board
 * @param {number} row - Row index
 * @param {number} col - Column index
 * @param {string} player - Player color ('B' or 'R')
 * @returns {boolean} True if move is valid
 */
export const isValidMove = (board, row, col, player) => {
  // Cell must be empty
  if (board[row][col].player !== null) return false;
  
  const opponent = player === PLAYER_COLORS.BLUE ? PLAYER_COLORS.RED : PLAYER_COLORS.BLUE;
  let valid = false;

  // Check all 8 directions
  DIRECTIONS.forEach(([dx, dy]) => {
    let x = row + dx;
    let y = col + dy;
    let hasOpponentBetween = false;

    // Walk in this direction while we see opponent pieces
    while (x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE && board[x][y].player === opponent) {
      hasOpponentBetween = true;
      x += dx;
      y += dy;
    }

    // Valid if we found opponent pieces AND ended at our own piece
    if (hasOpponentBetween && x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE && board[x][y].player === player) {
      valid = true;
    }
  });

  return valid;
};

/**
 * Calculate all valid moves for a player
 * @param {Array<Array>} board - The game board
 * @param {string} player - Player color ('B' or 'R')
 * @returns {Array<Array<number>>} Array of [row, col] coordinates
 */
export const getValidMoves = (board, player) => {
  const moves = [];
  board.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (isValidMove(board, rowIndex, colIndex, player)) {
        moves.push([rowIndex, colIndex]);
      }
    });
  });
  return moves;
};

/**
 * Flip opponent pieces after a move
 * @param {Array<Array>} board - The game board
 * @param {number} row - Row where piece was placed
 * @param {number} col - Column where piece was placed
 * @param {string} player - Player who made the move
 * @param {string} type - Type of piece placed
 * @param {Object} shieldedCells - Object with arrays of shielded cell coordinates per player
 * @returns {Array<Array>} New board with flipped pieces
 */
export const flipPieces = (board, row, col, player, type, shieldedCells) => {
  const opponent = player === PLAYER_COLORS.BLUE ? PLAYER_COLORS.RED : PLAYER_COLORS.BLUE;
  const newBoard = cloneBoard(board);

  // Check all 8 directions
  DIRECTIONS.forEach(([dx, dy]) => {
    let x = row + dx;
    let y = col + dy;
    const piecesToFlip = [];

    // Collect opponent pieces in this direction
    while (x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE && board[x][y].player === opponent) {
      const currentX = x;
      const currentY = y;
      
      // Check if this cell is shielded
      // eslint-disable-next-line no-loop-func
      const isShielded = shieldedCells[opponent].some(
        ([shieldRow, shieldCol]) => shieldRow === currentX && shieldCol === currentY
      );

      if (!isShielded) {
        piecesToFlip.push([x, y]);
      } else {
        // Hit a shield, stop collecting in this direction
        break;
      }
      x += dx;
      y += dy;
    }

    // If we ended at our own piece, flip all collected pieces
    if (piecesToFlip.length > 0 && x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE && board[x][y].player === player) {
      piecesToFlip.forEach(([fx, fy]) => {
        newBoard[fx][fy] = { type: board[fx][fy].type, player };
      });
    }
  });

  // Place the new piece
  newBoard[row][col] = { type, player };
  return newBoard;
};

/**
 * Check if the game is over (board is full)
 * @param {Array<Array>} board - The game board
 * @returns {Object} Object with isGameOver flag and winner (if any)
 */
export const checkGameOver = (board) => {
  const isBoardFull = board.every(row => row.every(cell => cell.player !== null));
  
  if (!isBoardFull) {
    return { isGameOver: false, winner: null };
  }

  const { blue, red } = calculatePieceCount(board);
  
  let winner;
  if (blue > red) {
    winner = 'Blue';
  } else if (red > blue) {
    winner = 'Red';
  } else {
    winner = 'Draw';
  }

  return { isGameOver: true, winner };
};

/**
 * Validate if a cell can be shielded
 * @param {Array<Array>} board - The game board
 * @param {number} row - Row index
 * @param {number} col - Column index
 * @param {string} player - Player attempting to shield
 * @returns {Object} Object with isValid flag and error message
 */
export const canShieldCell = (board, row, col, player) => {
  const opponent = player === PLAYER_COLORS.BLUE ? PLAYER_COLORS.RED : PLAYER_COLORS.BLUE;
  
  if (board[row][col].player === opponent) {
    return { 
      isValid: false, 
      error: "Cannot shield opponent's cell!" 
    };
  }
  
  return { isValid: true, error: null };
};
