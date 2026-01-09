import React from 'react';
import { PLAYER_COLORS, CELL_TYPES, IMAGE_PATHS } from '../constants/gameConstants';

/**
 * GameCell Component - Renders a single cell on the game board
 * @param {number} row - Row index
 * @param {number} col - Column index
 * @param {Object} piece - Piece object {player, type}
 * @param {boolean} isValid - Whether this is a valid move
 * @param {Function} onClick - Click handler
 */
const GameCell = ({ row, col, piece, isValid, onClick }) => {
  // Determine which image to display based on player and type
  const getImageSrc = () => {
    if (!piece.player) return '';

    const imageMap = {
      [PLAYER_COLORS.BLUE]: {
        [CELL_TYPES.REGULAR]: IMAGE_PATHS.BLUE_DUCKIE,
        [CELL_TYPES.SHIELD]: IMAGE_PATHS.BLUE_SHIELD,
        [CELL_TYPES.BOMB]: IMAGE_PATHS.BLUE_BOMB,
      },
      [PLAYER_COLORS.RED]: {
        [CELL_TYPES.REGULAR]: IMAGE_PATHS.RED_DUCKIE,
        [CELL_TYPES.SHIELD]: IMAGE_PATHS.RED_SHIELD,
        [CELL_TYPES.BOMB]: IMAGE_PATHS.RED_BOMB,
      }
    };

    return imageMap[piece.player]?.[piece.type] || '';
  };

  const imageSrc = getImageSrc();

  return (
    <div
      className={`cell ${isValid ? 'valid-move' : ''}`}
      onClick={() => onClick(row, col)}
    >
      {imageSrc && (
        <img 
          src={imageSrc} 
          alt={piece.type} 
          className="piece-image" 
        />
      )}
    </div>
  );
};

export default GameCell;
