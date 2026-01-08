import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Lobby from './pages/Lobby';
import Board from './pages/Board';

function App() {
  const [gameCode, setGameCode] = useState('');
  const [playerColor, setPlayerColor] = useState('');

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage setGameCode={setGameCode} setPlayerColor={setPlayerColor} />} />
          <Route path="/lobby" element={<Lobby setGameCode={setGameCode} setPlayerColor={setPlayerColor} />} />
          <Route path="/game/:gameCode" element={<Board playerColor={playerColor} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
