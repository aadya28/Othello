import { useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { SERVER_CONFIG, GAME_MODES, PLAYER_COLORS, CELL_TYPES } from '../constants/gameConstants';

/**
 * Custom hook to manage Socket.IO connection and real-time multiplayer events
 * 
 * Architecture:
 * - Effect 1: Creates socket connection once on mount, handles connect/disconnect/error events
 * - Effect 2: Joins game room and registers game-specific listeners when gameCode changes
 * 
 * @param {string} gameCode - The game room code to join
 * @param {Object} callbacks - Object containing all state setter functions
 * @param {Function} callbacks.setAssignedColor - Set player's color (Blue/Red)
 * @param {Function} callbacks.setBoard - Update board state
 * @param {Function} callbacks.setCurrentPlayer - Update current player turn
 * @param {Function} callbacks.setShieldedCells - Update shielded cells
 * @param {Function} callbacks.setValidMoves - Update valid moves array
 * @param {Function} callbacks.setBlueCount - Update blue piece count
 * @param {Function} callbacks.setRedCount - Update red piece count
 * @param {Function} callbacks.setGameOver - Update game over state
 * @param {Function} callbacks.setWinner - Update winner state
 * @param {Function} callbacks.setNotification - Display notification messages (optional)
 * @param {Function} callbacks.setShifuComment - Display Shifu AI comments (optional)
 * @param {Function} callbacks.setSelectedDucky - Reset selected ducky type (optional)
 * @returns {Object} Socket.IO client instance
 */
const useGameSocket = (
    gameCode,
    {
        setAssignedColor,
        setBoard,
        setCurrentPlayer,
        setShieldedCells,
        setShieldUsed,
        setValidMoves,
        setBlueCount,
        setRedCount,
        setGameOver,
        setWinner,
        setNotification,
        setShifuComment,
        setSelectedDucky
    }
)  => {
    const socketRef = useRef(null);

    // Initialize socket (once)
    useEffect(() => {
        if (socketRef.current) return;

        const socket = io(SERVER_CONFIG.URL, {
            reconnection: SERVER_CONFIG.RECONNECTION,
            reconnectionDelay: SERVER_CONFIG.RECONNECTION_DELAY,
            reconnectionDelayMax: SERVER_CONFIG.RECONNECTION_DELAY_MAX,
            reconnectionAttempts: SERVER_CONFIG.RECONNECTION_ATTEMPTS,
        });

        socket.on('connect', () => {
            console.log('✅ Connected:', socket.id);
        });

        socket.on('disconnect', (reason) => {
            console.log('❌ Disconnected:', reason);
        });

        socket.on('error', (message) => {
            console.error('❌ Server error:', message);
            setNotification?.(message);
        });

        socketRef.current = socket;

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [setNotification]);

    // Join game & listen to events
    useEffect(() => {
        const socket = socketRef.current;
        if (!socket || !gameCode) return;

        const joinGame = () => {
            socket.emit('joinGame', { gameCode });
        };

        socket.connected ? joinGame() : socket.once('connect', joinGame);

        // Shifu mode: player is always Blue
        if (gameCode === GAME_MODES.SHIFU) {
            setAssignedColor(PLAYER_COLORS.BLUE);
        }

        //Game state update (authoritative)
        socket.on('gameState', (state) => {
            setBoard(state.board);
            setCurrentPlayer(state.currentPlayer);
            setShieldedCells(state.shieldedCells);
            setShieldUsed(state.shieldUsed);
            setValidMoves(state.validMoves);
            setBlueCount(state.blueCount);
            setRedCount(state.redCount);
        });
        
        // Game over event (separate from gameState)
        socket.on('gameOver', ({ winner }) => {
            setGameOver(true);
            setWinner(winner);
        });
        
        // Game restarted event - reset client UI state
        socket.on('gameRestarted', () => {
            setGameOver(false);
            setWinner(null);
            setShifuComment?.('');
            setSelectedDucky?.(CELL_TYPES.REGULAR);
        });

        // Assigned color (multiplayer)
        socket.on('assignedColor', setAssignedColor);

        // Shield updates (optional separate emit)
        socket.on('shieldsUpdated', setShieldedCells);

        // System notifications
        socket.on('notification', (message) => {
            setNotification?.(message);
        });

        // Shifu AI comment (separate UI)
        socket.on('shifuComment', (comment) => {
            setShifuComment?.(comment);
        });

        return () => {
            socket.off('gameState');
            socket.off('gameOver');
            socket.off('gameRestarted');
            socket.off('assignedColor');
            socket.off('shieldsUpdated');
            socket.off('notification');
            socket.off('shifuComment');
        };
    }, [gameCode]);

    return socketRef.current;
};

export default useGameSocket;