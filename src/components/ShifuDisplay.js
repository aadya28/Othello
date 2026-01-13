import React from 'react';
import { IMAGE_PATHS } from '../constants/gameConstants';

/**
 * ShifuDisplay Component - Displays Shifu opponent with speech bubble
 * @param {string} comment - Current comment to display
 */
const ShifuDisplay = ({ comment }) => {
  return (
    <div className="shifu-container">
      <img
        className="shifu-img"
        src={IMAGE_PATHS.SHIFU}
        alt="Shifu Opponent"
      />
      <p className="shifu-label">Shifu Opponent</p>
      <div className={`shifu-speech-bubble ${comment ? 'visible' : 'hidden'}`}>
        <p>{comment}</p>
      </div>
    </div>
  );
};

export default ShifuDisplay;
