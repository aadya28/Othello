import React from 'react';

/**
 * TopNavigation Component - Navigation buttons at the top
 * @param {Function} onHome - Callback for home button
 * @param {Function} onRestart - Callback for restart button
 */
const TopNavigation = ({ onHome, onRestart }) => {
  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/icon?family=Material+Icons"
      />
      <div className="top-buttons">
        <button className="icon-button" title="Home" onClick={onHome}>
          <span className="material-icons">home</span>
        </button>
        <button className="icon-button" title="Restart" onClick={onRestart}>
          <span className="material-icons">restart_alt</span>
        </button>
      </div>
    </>
  );
};

export default TopNavigation;
