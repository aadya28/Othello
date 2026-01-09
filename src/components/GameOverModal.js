import React from 'react';

/**
 * GameOverModal Component - Displays game over message
 * @param {boolean} isGameOver - Whether the game is over
 * @param {string} winner - Winner of the game ('Blue', 'Red', or 'Draw')
 * @param {Function} onRestart - Callback to restart the game
 */
const GameOverModal = ({ isGameOver, winner, onRestart }) => {
  if (!isGameOver) return null;

  return (
    <div className="game-over">
      <h2>Game Over</h2>
      <p>{winner === 'Draw' ? "It's a Draw!" : `${winner} Wins!`}</p>
      <button onClick={onRestart}>Restart Game</button>
    </div>
  );
};

export default GameOverModal;
