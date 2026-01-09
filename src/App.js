import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import LandingPage from './pages/LandingPage';
import Lobby from './pages/Lobby';
import Board from './pages/Board';

function App() {
  return (
    <Router>
      <GameProvider>
        <div className="App">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/lobby" element={<Lobby />} />
            <Route path="/game/:gameCode" element={<Board />} />
          </Routes>
        </div>
      </GameProvider>
    </Router>
  );
}

export default App;
