import React from 'react';
import { CELL_TYPES, PLAYER_COLORS, IMAGE_PATHS } from '../constants/gameConstants';
import { displayNotification } from '../utils/notificationHelper';

/**
 * DuckySelector Component - Allows player to select ducky type
 * @param {string} selectedDucky - Currently selected ducky type
 * @param {Function} onSelect - Callback when ducky is selected
 * @param {string} assignedColor - Player's color
 * @param {Object} shieldUsed - Object tracking shield usage per player
 */
const DuckySelector = ({ selectedDucky, onSelect, assignedColor, shieldUsed }) => {
  const handleShieldClick = () => {
    if (shieldUsed[assignedColor]) {
      displayNotification('You can only use the shield once!');
    } else {
      onSelect(CELL_TYPES.SHIELD);
    }
  };

  const getImagePath = (type) => {
    const isBlue = assignedColor === PLAYER_COLORS.BLUE;
    const imageMap = {
      [CELL_TYPES.REGULAR]: isBlue ? IMAGE_PATHS.BLUE_DUCKIE : IMAGE_PATHS.RED_DUCKIE,
      [CELL_TYPES.SHIELD]: isBlue ? IMAGE_PATHS.BLUE_SHIELD : IMAGE_PATHS.RED_SHIELD,
      [CELL_TYPES.BOMB]: isBlue ? IMAGE_PATHS.BLUE_BOMB : IMAGE_PATHS.RED_BOMB,
    };
    return imageMap[type];
  };

  return (
    <div className="ducky-selection">
      {/* Regular Ducky */}
      <button
        onClick={() => onSelect(CELL_TYPES.REGULAR)}
        className={selectedDucky === CELL_TYPES.REGULAR ? 'selected' : ''}
      >
        <p className="button-text">Regular Ducky</p>
        <img
          className="duckie-img"
          src={getImagePath(CELL_TYPES.REGULAR)}
          alt="Regular Ducky"
        />
      </button>

      {/* Shield Ducky */}
      <button
        onClick={handleShieldClick}
        className={`${selectedDucky === CELL_TYPES.SHIELD ? 'selected' : ''} ${
          shieldUsed[assignedColor] ? 'disabled' : ''
        }`}
      >
        <p className="button-text">Shield Ducky</p>
        <img
          className="duckie-img"
          src={getImagePath(CELL_TYPES.SHIELD)}
          alt="Shield Ducky"
        />
      </button>

      {/* Bomber Ducky */}
      <button
        onClick={() => onSelect(CELL_TYPES.BOMB)}
        className={selectedDucky === CELL_TYPES.BOMB ? 'selected' : ''}
      >
        <p className="button-text">Bomber Ducky</p>
        <img
          className="duckie-img"
          src={getImagePath(CELL_TYPES.BOMB)}
          alt="Bomber Ducky"
        />
      </button>
    </div>
  );
};

export default DuckySelector;
