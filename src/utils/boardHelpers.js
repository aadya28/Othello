/**
 * Create a deep clone of the game board
 * @param {Array<Array>} board - 2D array representing the game board
 * @returns {Array<Array>} Cloned board
 */
export const cloneBoard = (board) => {
  return board.map(row => row.slice());
};

/**
 * Check if coordinates are within board bounds
 * @param {number} row - Row index
 * @param {number} col - Column index
 * @param {number} boardSize - Size of the board (default: 8)
 * @returns {boolean} True if coordinates are valid
 */
export const isValidCoordinate = (row, col, boardSize = 8) => {
  return row >= 0 && row < boardSize && col >= 0 && col < boardSize;
};
