import React from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import './Board.css';
import {CELL_TYPES, GAME_MODES} from '../constants/gameConstants';
import useGameStates from '../hooks/useGameStates';
import useGameSocket from '../hooks/useGameSocket';
import DuckySelector from '../components/DuckySelector';
import GameCell from '../components/GameCell';
import GameOverModal from '../components/GameOverModal';
import Notification from '../components/Notification';
import PieceCounter from '../components/PieceCounter';
import ShifuDisplay from '../components/ShifuDisplay';
import TopNavigation from '../components/TopNavigation';

const Board = () => {
    const {gameCode} = useParams();
    const navigate = useNavigate();

    const gameState = useGameStates();
    const {
        notification,
        board,
        currentPlayer,
        validMoves,
        selectedDucky,
        blueCount,
        redCount,
        shieldUsed,
        gameOver,
        winner,
        assignedColor,
        shifuComment,

        setNotification,
        setBoard,
        setCurrentPlayer,
        setValidMoves,
        setSelectedDucky,
        setBlueCount,
        setRedCount,
        setShieldUsed,
        setShieldedCells,
        setGameOver,
        setWinner,
        setAssignedColor,
        setShifuComment,
    } = gameState;

    // Socket connection
    const socket = useGameSocket(gameCode, {
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
    );

    const handleRestartGame = () => {
        socket.emit('restartGame', {gameCode});
    };

    const handleCellClick = (row, col) => {
        console.log(`handleClick: row=${row}, col=${col}, currentPlayer=${currentPlayer}, assignedColor=${assignedColor}`);

        // UX check: cell already occupied
        if (board[row][col].player !== null) {
            setNotification("This cell is already occupied!");
            return;
        }

        // UX check: not your turn
        if (currentPlayer !== assignedColor) {
            setNotification("It's your opponent's turn!");
            return;
        }

        // UX check: move not in validMoves (client-side convenience only)
        const isValid = validMoves.some(([validRow, validCol]) => validRow === row && validCol === col);
        if (!isValid) {
            setNotification("Invalid move!");
            return;
        }

        // Board.js
        socket.emit('makeMove', {
            gameCode,
            row,
            col,
            type: selectedDucky
        });

        // Reset local selection for UX
        setSelectedDucky(CELL_TYPES.REGULAR);
    };

    return (
        <div className="board-container">
            {/* Top Navigation */}
            <TopNavigation
                onHome={() => navigate('/')}
                onRestart={handleRestartGame}
            />

            {/* Piece Counter */}
            <PieceCounter blueCount={blueCount} redCount={redCount}/>

            {/* Shifu Display */}
            {gameCode === GAME_MODES.SHIFU && (
                <ShifuDisplay comment={shifuComment}/>
            )}

            {/* Game Over Modal */}
            <GameOverModal
                isGameOver={gameOver}
                winner={winner}
                onRestart={handleRestartGame}
            />

            {/* Game Board */}
            {!board ? (
                <div className="loading">Loading game...</div>
            ) : (
                <div className={`board ${gameOver ? 'disabled' : ''}`}>
                    {board.map((row, rowIndex) =>
                        row.map((_, colIndex) => {
                            const isValid = validMoves.some(
                                ([validRow, validCol]) => validRow === rowIndex && validCol === colIndex
                            );
                            return (
                                <GameCell
                                    key={`${rowIndex}-${colIndex}`}
                                    row={rowIndex}
                                    col={colIndex}
                                    piece={board[rowIndex][colIndex]}
                                    isValid={isValid}
                                    onClick={handleCellClick}
                                />
                            );
                        })
                    )}
                </div>
            )}

            {/* Ducky Selector */}
            <DuckySelector
                selectedDucky={selectedDucky}
                onSelect={setSelectedDucky}
                assignedColor={assignedColor}
                shieldUsed={shieldUsed}
                showNotification={setNotification}
            />

            {/* Notification */
            }
            <Notification
                message={notification}
            />
        </div>
    )
        ;
};

export default Board;