import React from 'react';
import { IMAGE_PATHS } from '../constants/gameConstants';

/**
 * PieceCounter Component - Displays piece counts for both players
 * @param {number} blueCount - Number of blue pieces
 * @param {number} redCount - Number of red pieces
 */
const PieceCounter = ({ blueCount, redCount }) => {
  return (
    <div className="piece-count">
      <div>
        <img
          className="duckie-img"
          src={IMAGE_PATHS.BLUE_DUCKIE}
          alt="Blue Ducky"
        />
        : {blueCount}
      </div>
      <div>
        <img
          className="duckie-img"
          src={IMAGE_PATHS.RED_DUCKIE}
          alt="Red Ducky"
        />
        : {redCount}
      </div>
    </div>
  );
};

export default PieceCounter;
