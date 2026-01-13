import React, {createContext, useContext, useState} from 'react';

/**
 * GameContext - Provides global game state management
 * Manages only shared state: gameCode and playerColor
 * Components handle their own navigation and UI logic
 */
const GameContext = createContext(undefined);

/**
 * Custom hook to access GameContext
 * @throws {Error} If used outside GameProvider
 * @returns {Object} Game context value with state and setters
 */
export const useGameContext = () => {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGameContext must be used within a GameProvider');
    }
    return context;
};

/**
 * GameProvider - Wraps app and provides game state
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export const GameProvider = ({children}) => {
    const [gameCode, setGameCode] = useState('');
    const [playerColor, setPlayerColor] = useState('');

    const value = {
        // State
        gameCode,
        playerColor,

        // Setters
        setGameCode,
        setPlayerColor,
    };

    return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};