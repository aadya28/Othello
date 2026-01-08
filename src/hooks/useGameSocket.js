import { useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { SERVER_CONFIG, GAME_MODES, PLAYER_COLORS } from '../constants/gameConstants';

/**
 * Custom hook to manage socket.io connection and events
 * @param {string} gameCode - The game code to join
 * @param {Function} setAssignedColor - Callback to set the player's assigned color
 * @param {Function} setBoard - Callback to update the board state
 * @param {Function} setCurrentPlayer - Callback to update current player
 * @param {Function} setShieldedCells - Callback to update shielded cells
 * @param {Function} calculatePieceCount - Callback to calculate piece counts
 * @param {Function} calculateValidMoves - Callback to calculate valid moves
 * @param {Function} setValidMoves - Callback to set valid moves
 * @returns {Object} Socket instance
 */
const useGameSocket = (
  gameCode,
  setAssignedColor,
  setBoard,
  setCurrentPlayer,
  setShieldedCells,
  calculatePieceCount,
  calculateValidMoves,
  setValidMoves
) => {
  const socketRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection
    if (!socketRef.current) {
      socketRef.current = io(SERVER_CONFIG.URL, {
        reconnection: SERVER_CONFIG.RECONNECTION,
        reconnectionDelay: SERVER_CONFIG.RECONNECTION_DELAY,
        reconnectionDelayMax: SERVER_CONFIG.RECONNECTION_DELAY_MAX,
        reconnectionAttempts: SERVER_CONFIG.RECONNECTION_ATTEMPTS,
      });

      socketRef.current.on('connect', () => {
        console.log('Connected to server:', socketRef.current.id);
      });

      socketRef.current.on('disconnect', () => {
        console.log('Disconnected from server');
      });
    }

    const socket = socketRef.current;

    // Join game
    console.log('Joining game:', gameCode);
    socket.emit('joinGame', { gameCode });

    // Set assigned color for Shifu mode
    if (gameCode === GAME_MODES.SHIFU) {
      setAssignedColor(PLAYER_COLORS.BLUE);
    }

    // Listen for shielded cells updates
    const handleShieldsUpdated = (updatedShields) => {
      console.log("Received updated shielded cells:", updatedShields);
      setShieldedCells(updatedShields);
    };

    // Listen for assigned color
    const handleAssignedColor = (color) => {
      setAssignedColor(color);
      console.log(`Assigned color: ${color}`);
    };

    // Listen for game state updates
    const handleGameState = (gameState) => {
      console.log('Received game state:', gameState);
      setBoard(gameState.board);
      setCurrentPlayer(gameState.currentPlayer);
      setShieldedCells(gameState.shieldedCells);
      calculatePieceCount(gameState.board);
      setValidMoves(calculateValidMoves(gameState.board, gameState.currentPlayer));
    };

    // Register event listeners
    socket.on('shieldsUpdated', handleShieldsUpdated);
    socket.on('assignedColor', handleAssignedColor);
    socket.on('gameState', handleGameState);

    // Cleanup
    return () => {
      socket.off('assignedColor', handleAssignedColor);
      socket.off('gameState', handleGameState);
      socket.off('shieldsUpdated', handleShieldsUpdated);
    };
  }, [gameCode, setAssignedColor, setBoard, setCurrentPlayer, setShieldedCells, calculatePieceCount, calculateValidMoves, setValidMoves]);

  return socketRef.current;
};

export default useGameSocket;
