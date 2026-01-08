import { useCallback } from 'react';
import { BOARD_SIZE, PLAYER_COLORS, DIRECTIONS } from '../constants/gameConstants';
import { cloneBoard } from '../utils/boardHelpers';
import { displayNotification } from '../utils/notificationHelper';

/**
 * Custom hook for game logic and rules
 * @param {Object} gameState - Current game state
 * @returns {Object} Game logic functions
 */
const useGameLogic = (gameState) => {
  const { 
    board, 
    blueCount, 
    redCount, 
    setBlueCount, 
    setRedCount, 
    setPrevBlueCount, 
    setPrevRedCount,
    setGameOver,
    setWinner
  } = gameState;

  /**
   * Calculate piece counts for both players
   */
  const calculatePieceCount = useCallback((boardToCount) => {
    let blue = 0;
    let red = 0;
    boardToCount.forEach(row => {
      row.forEach(cell => {
        if (cell.player === 'B') blue++;
        if (cell.player === 'R') red++;
      });
    });
    setPrevBlueCount(blueCount);
    setPrevRedCount(redCount);
    setBlueCount(blue);
    setRedCount(red);
  }, [blueCount, redCount, setBlueCount, setRedCount, setPrevBlueCount, setPrevRedCount]);

  /**
   * Check if a move is valid
   */
  const checkIsValidMove = useCallback((boardToCheck, row, col, player) => {
    if (boardToCheck[row][col].player !== null) return false;
    const opponent = player === PLAYER_COLORS.BLUE ? PLAYER_COLORS.RED : PLAYER_COLORS.BLUE;
    let valid = false;

    DIRECTIONS.forEach(([dx, dy]) => {
      let x = row + dx;
      let y = col + dy;
      let hasOpponentBetween = false;

      while (x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE && boardToCheck[x][y].player === opponent) {
        hasOpponentBetween = true;
        x += dx;
        y += dy;
      }

      if (hasOpponentBetween && x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE && boardToCheck[x][y].player === player) {
        valid = true;
      }
    });

    return valid;
  }, []);

  /**
   * Calculate all valid moves for a player
   */
  const calculateValidMoves = useCallback((boardToCheck, player) => {
    const moves = [];
    boardToCheck.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (checkIsValidMove(boardToCheck, rowIndex, colIndex, player)) {
          moves.push([rowIndex, colIndex]);
        }
      });
    });
    return moves;
  }, [checkIsValidMove]);

  /**
   * Flip game pieces after a move
   */
  const flipGamePieces = useCallback((boardToFlip, row, col, player, type, shieldedCells) => {
    const opponent = player === PLAYER_COLORS.BLUE ? PLAYER_COLORS.RED : PLAYER_COLORS.BLUE;
    const newBoard = cloneBoard(boardToFlip);

    DIRECTIONS.forEach(([dx, dy]) => {
      let x = row + dx;
      let y = col + dy;
      const piecesToFlip = [];

      while (x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE && boardToFlip[x][y].player === opponent) {
        const isShielded = shieldedCells[opponent].some(
          ([shieldRow, shieldCol]) => shieldRow === x && shieldCol === y
        );

        if (!isShielded) {
          piecesToFlip.push([x, y]);
        } else {
          break;
        }
        x += dx;
        y += dy;
      }

      if (piecesToFlip.length > 0 && x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE && boardToFlip[x][y].player === player) {
        piecesToFlip.forEach(([fx, fy]) => {
          newBoard[fx][fy] = { type: boardToFlip[fx][fy].type, player };
        });
      }
    });

    newBoard[row][col] = { type, player };
    return newBoard;
  }, []);

  /**
   * Check if a cell can be shielded
   */
  const checkCanGetShielded = useCallback((player, shieldedCells, row, col) => {
    const opponent = player === 'B' ? 'R' : 'B';
    if (board[row][col].player === opponent) {
      displayNotification("Cannot shield opponent's cell!");
      return false;
    }
    return true;
  }, [board]);

  /**
   * Verify if the game is over
   */
  const verifyGameOver = useCallback((boardToCheck) => {
    const isBoardFull = boardToCheck.every(row => row.every(cell => cell.player !== null));
    if (isBoardFull) {
      setGameOver(true);
      if (blueCount > redCount) {
        setWinner('Blue');
      } else if (redCount > blueCount) {
        setWinner('Red');
      } else {
        setWinner('Draw');
      }
    }
  }, [blueCount, redCount, setGameOver, setWinner]);

  return {
    calculatePieceCount,
    checkIsValidMove,
    calculateValidMoves,
    flipGamePieces,
    checkCanGetShielded,
    verifyGameOver,
  };
};

export default useGameLogic;
