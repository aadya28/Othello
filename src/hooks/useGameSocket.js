import {useEffect, useRef} from 'react';
import io from 'socket.io-client';
import {SERVER_CONFIG, GAME_MODES, PLAYER_COLORS} from '../constants/gameConstants';

/**
 * Custom React hook for managing Socket.io connection and real-time game events.
 *
 * This hook handles:
 * - Establishing and maintaining a WebSocket connection to the game server
 * - Joining game rooms based on game code
 * - Listening for game state updates from the server
 * - Automatic cleanup on component unmount
 *
 * @param {string} gameCode - Unique identifier for the game room to join
 * @param {Function} setAssignedColor - State setter for the player's assigned color ('B' or 'R')
 * @param {Function} setBoard - State setter for the game board (8x8 array)
 * @param {Function} setCurrentPlayer - State setter for whose turn it is
 * @param {Function} setShieldedCells - State setter for cells protected by shields
 * @param {Function} calculatePieceCount - Function to calculate piece counts for both players
 * @param {Function} calculateValidMoves - Function to determine valid moves for current player
 * @param {Function} setValidMoves - State setter for array of valid move coordinates
 *
 * @returns {Socket|null} Socket.io client instance (or null if not yet initialized)
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

    // Store callbacks in a ref to prevent triggering effects when they change
    const callbacksRef = useRef({
        setAssignedColor,
        setBoard,
        setCurrentPlayer,
        setShieldedCells,
        calculatePieceCount,
        calculateValidMoves,
        setValidMoves
    });

    // Update callbacks ref whenever any callback changes
    useEffect(() => {
        callbacksRef.current = {
            setAssignedColor,
            setBoard,
            setCurrentPlayer,
            setShieldedCells,
            calculatePieceCount,
            calculateValidMoves,
            setValidMoves
        };
    }, [
        setAssignedColor,
        setBoard,
        setCurrentPlayer,
        setShieldedCells,
        calculatePieceCount,
        calculateValidMoves,
        setValidMoves
    ]);

    // Effect 1: Initialize socket connection once on component mount
    useEffect(() => {
        // Only create socket if it doesn't exist
        if (!socketRef.current) {
            console.log('Initializing socket connection...');

            const socket = io(SERVER_CONFIG.URL, {
                reconnection: SERVER_CONFIG.RECONNECTION,
                reconnectionDelay: SERVER_CONFIG.RECONNECTION_DELAY,
                reconnectionDelayMax: SERVER_CONFIG.RECONNECTION_DELAY_MAX,
                reconnectionAttempts: SERVER_CONFIG.RECONNECTION_ATTEMPTS,
            });

            // Connection lifecycle events
            socket.on('connect', () => {
                console.log('✅ Connected to server. Socket ID:', socket.id);
            });

            socket.on('disconnect', (reason) => {
                console.log('❌ Disconnected from server. Reason:', reason);
            });

            socket.on('connect_error', (error) => {
                console.error('❌ Connection error:', error.message);
            });

            // Handle server errors
            socket.on('error', (errorMessage) => {
                console.error('❌ Server error:', errorMessage);
                // TODO: Show error notification to user
            });

            socketRef.current = socket;
        }

        // Cleanup: Disconnect socket when component unmounts
        return () => {
            if (socketRef.current) {
                console.log('Disconnecting socket...');
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, []); // Runs only once on mount

    // Effect 2: Join game room and set up game-specific event listeners
    // Re-runs when gameCode changes (e.g., user switches to a different game)
    useEffect(() => {
        const socket = socketRef.current;

        // Wait for socket to be initialized
        if (!socket) return;

        console.log(`Joining game room: ${gameCode}`);

        // Join the game room on the server
        const joinGame = () => {
            socket.emit('joinGame', {gameCode});
        };

        // Emit joinGame immediately if already connected, otherwise wait for connection
        if (socket.connected) {
            joinGame();
        } else {
            socket.once('connect', joinGame);
        }

        // Special case: Shifu mode (single-player vs computer)
        // Player is always Blue, computer is Red
        if (gameCode === GAME_MODES.SHIFU) {
            callbacksRef.current.setAssignedColor(PLAYER_COLORS.BLUE);
        }

        // Event handler: Server sends updated shield positions
        const handleShieldsUpdated = (shields) => {
            console.log('Shields updated:', shields);
            callbacksRef.current.setShieldedCells(shields);
        };

        // Event handler: Server assigns color to player (multiplayer mode)
        const handleAssignedColor = (color) => {
            console.log(`Assigned color: ${color === 'B' ? 'Blue' : 'Red'}`);
            callbacksRef.current.setAssignedColor(color);
        };

        // Event handler: Server broadcasts updated game state (after any move)
        const handleGameState = (gameState) => {
            console.log('Game state updated:', gameState);

            // Update all game state
            callbacksRef.current.setBoard(gameState.board);
            callbacksRef.current.setCurrentPlayer(gameState.currentPlayer);
            callbacksRef.current.setShieldedCells(gameState.shieldedCells || {B: [], R: []});
            callbacksRef.current.calculatePieceCount(gameState.board);

            // Calculate and update valid moves for the current player
            const validMoves = callbacksRef.current.calculateValidMoves(
                gameState.board,
                gameState.currentPlayer
            );
            callbacksRef.current.setValidMoves(validMoves);
        };

        // Event handler: Server sends notification messages
        const handleNotification = (message) => {
            console.log('Notification:', message);
            // TODO: Display notification to user (toast, alert, etc.)
        };

        // Register all event listeners
        socket.on('shieldsUpdated', handleShieldsUpdated);
        socket.on('assignedColor', handleAssignedColor);
        socket.on('gameState', handleGameState);
        socket.on('notification', handleNotification);

        // Cleanup: Remove event listeners when gameCode changes or component unmounts
        return () => {
            console.log(`Cleaning up listeners for game room: ${gameCode}`);
            socket.off('shieldsUpdated', handleShieldsUpdated);
            socket.off('assignedColor', handleAssignedColor);
            socket.off('gameState', handleGameState);
            socket.off('notification', handleNotification);
        };
    }, [gameCode]); // Only re-run when gameCode changes

    return socketRef.current;
};

export default useGameSocket;