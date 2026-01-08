// Constants for bomb logic
const BOARD_SIZE = 8;
const AFFECTED_CELLS_OFFSET = [
  { row: -1, col: 0 },  // up
  { row: 1, col: 0 },   // down
  { row: 0, col: -1 },  // left
  { row: 0, col: 1 },   // right
];

// Function to place a bomb
export const placeBomb = (row, col, currentPlayer, bomberDucky, bombs, shieldedCells) => {
    // Ensure bomb placement isn't on a shielded cell
    if (shieldedCells[currentPlayer].some(([shieldRow, shieldCol]) => shieldRow === row && shieldCol === col)) {
      return { error: "Cannot place a bomb on a shielded cell!" };
    }
  
    if ((currentPlayer === 'B' && bomberDucky.player1Used) || (currentPlayer === 'W' && bomberDucky.player2Used)) {
      return { error: "You can only place one bomb per game!" };
    }
  
    // Add bomb to the list
    const updatedBombs = [...bombs, { row, col, player: currentPlayer }];
    
    // Update bomber ducky status
    const newBomberDucky = {
      ...bomberDucky,
      player1Used: currentPlayer === 'B' ? true : bomberDucky.player1Used,
      player2Used: currentPlayer === 'W' ? true : bomberDucky.player2Used,
    };
  
    return {
      newBomberDucky,
      updatedBombs, // Return updated bombs list
      message: "Bomb placed successfully!",
    };
  };
  
  // Function to trigger bomb explosion
  export const triggerExplosion = (row, col, board, currentPlayer, bombs, shieldedCells) => {
    const newBoard = board.map(rowArr => rowArr.slice());
  
    // List of affected adjacent cells
    const affectedCells = AFFECTED_CELLS_OFFSET.map(offset => ({
      row: row + offset.row,
      col: col + offset.col,
    }));
  
    // Loop through affected cells and update the board
    affectedCells.forEach(cell => {
      if (cell.row >= 0 && cell.col >= 0 && cell.row < BOARD_SIZE && cell.col < BOARD_SIZE) {
        // Ensure shielded cells are not affected
        if (!shieldedCells[currentPlayer].some(([shieldRow, shieldCol]) => shieldRow === cell.row && shieldCol === cell.col)) {
          newBoard[cell.row][cell.col] = { type: 'regular', player: currentPlayer };
        }
      }
    });
  
    // Remove the exploded bomb from the bombs list
    const updatedBombs = bombs.filter(bomb => bomb.row !== row || bomb.col !== col);
  
    return { newBoard, updatedBombs };
  };
  
  // Check if a move triggers a bomb
  export const checkForBomb = (row, col, bombs) => {
    return bombs.some(bomb => bomb.row === row && bomb.col === col);
  };
  