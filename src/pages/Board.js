import React, {useEffect, useState} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import './Board.css';
import {CELL_TYPES, GAME_MODES, PLAYER_COLORS, TIMINGS} from '../constants/gameConstants';
import {getRandomElement} from '../utils/helpers';
import {cloneBoard} from '../services/boardService';
import useGameStates from '../hooks/useGameStates';
import useGameLogic from '../hooks/useGameLogic';
import useGameSocket from '../hooks/useGameSocket';
import useShifuAI from '../hooks/useShifuAI';
import GameCell from '../components/GameCell';
import DuckySelector from '../components/DuckySelector';
import PieceCounter from '../components/PieceCounter';
import ShifuDisplay from '../components/ShifuDisplay';
import GameOverModal from '../components/GameOverModal';
import TopNavigation from '../components/TopNavigation';
import Notification from '../components/Notification';

const Board = () => {
    const {gameCode} = useParams();
    const navigate = useNavigate();
    const [notification, setNotification] = useState(null);

    const gameState = useGameStates();
    const {
        board,
        currentPlayer,
        validMoves,
        selectedDucky,
        blueCount,
        redCount,
        shieldedCells,
        shieldUsed,
        bombs,
        gameOver,
        winner,
        assignedColor,
        shifuComment,
        setBoard,
        setCurrentPlayer,
        setValidMoves,
        setSelectedDucky,
        setShieldedCells,
        setShieldUsed,
        setBombs,
        setAssignedColor,
        setShifuComment,
        resetGameState,
    } = gameState;

    // Game logic
    const {
        calculatePieceCount,
        calculateValidMoves,
        flipGamePieces,
        checkCanGetShielded,
        verifyGameOver,
    } = useGameLogic(gameState, setNotification);

    // Socket connection
    const socket = useGameSocket(
        gameCode,
        setAssignedColor,
        setBoard,
        setCurrentPlayer,
        setShieldedCells,
        calculatePieceCount,
        calculateValidMoves,
        setValidMoves
    );

    // Shifu AI
    useShifuAI({
        gameCode,
        currentPlayer,
        board,
        blueCount,
        redCount,
        shieldedCells,
        setBoard,
        setCurrentPlayer,
        setShifuComment,
        calculatePieceCount,
        calculateValidMoves,
        flipGamePieces,
        verifyGameOver,
        onNotification: setNotification,
    });

    // Update valid moves when board or player changes
    useEffect(() => {
        setValidMoves(calculateValidMoves(board, currentPlayer));
        verifyGameOver(board);
    }, [board, currentPlayer, calculateValidMoves, verifyGameOver, setValidMoves]);

    const handleRestartGame = () => {
        resetGameState();
    };

    const handleCellClick = (row, col) => {
        console.log(`handleClick: row=${row}, col=${col}, currentPlayer=${currentPlayer}, assignedColor=${assignedColor}`);

        // Check if the cell is already occupied
        if (board[row][col].player !== null) {
            setNotification("This cell is already occupied!");
            return;
        }

        // Check if it's the current player's turn
        if (currentPlayer !== assignedColor) {
            setNotification("It's your opponent's turn!");
            return;
        }

        // Check if the move is valid
        const isValid = validMoves.some(([validRow, validCol]) => validRow === row && validCol === col);
        if (!isValid) {
            setNotification("Invalid move!");
            return;
        }

        const move = {row, col, player: currentPlayer, type: selectedDucky};

        // Handle shield placement
        if (selectedDucky === CELL_TYPES.SHIELD) {
            if (!checkCanGetShielded(currentPlayer, shieldedCells, row, col)) return;

            setShieldedCells((prev) => {
                const updatedShields = {
                    ...prev,
                    [currentPlayer]: [...prev[currentPlayer], [row, col]]
                };
                console.log("Local shielded cells:", updatedShields);

                // Emit updated shielded cells to the server
                socket.emit('updateShieldedCells', {gameCode, shieldedCells: updatedShields});
                return updatedShields;
            });

            const updatedBoard = board.map((rowArr, rowIndex) =>
                rowArr.map((cell, colIndex) => {
                    if (rowIndex === row && colIndex === col) {
                        return {type: CELL_TYPES.SHIELD, player: currentPlayer};
                    }
                    return cell;
                })
            );

            setBoard(updatedBoard);
            setShieldUsed((prev) => ({...prev, [currentPlayer]: true}));
            setSelectedDucky(CELL_TYPES.REGULAR);
            return;
        }

        // Handle bomb placement
        if (selectedDucky === CELL_TYPES.BOMB) {
            if (bombs[currentPlayer] !== null) {
                setNotification("You can only place one bomb!");
                return;
            }

            const newBombs = {...bombs, [currentPlayer]: [row, col]};
            setBombs(newBombs);

            const updatedBoard = cloneBoard(board);
            updatedBoard[row][col] = {type: CELL_TYPES.BOMB, player: currentPlayer};
            setBoard(updatedBoard);

            // Emit updated bomb state to the server
            socket.emit('updateBombs', {gameCode, bombs: newBombs});

            setSelectedDucky(CELL_TYPES.REGULAR);
            return;
        }

        // Handle regular and other ducky moves (flip pieces)
        const updatedBoard = flipGamePieces(board, row, col, currentPlayer, selectedDucky, shieldedCells);
        setBoard(updatedBoard);
        calculatePieceCount(updatedBoard);

        // Randomize comments
        const randomCompliment = getRandomElement(['Nice move!', 'Well played!', 'Impressive strategy!']);
        const randomSarcasm = getRandomElement(['Is that all you got?', 'I expected better!', 'Too easy!']);

        // Set Shifu's speech bubble comment based on who's winning (only in Shifu mode)
        if (gameCode === GAME_MODES.SHIFU) {
            if (blueCount > redCount) {
                console.log('Shifu Comment (user is winning):', randomCompliment);
                setShifuComment(`👏 ${randomCompliment}`);
            } else if (redCount > blueCount) {
                console.log('Shifu Comment (Shifu is winning):', randomSarcasm);
                setShifuComment(`😏 ${randomSarcasm}`);
            } else {
                console.log('Shifu Comment (Tie): A tie? Let\'s see if you can break it!');
                setShifuComment('🤔 A tie? Let\'s see if you can break it!');
            }

            // Clear the comment after specified time
            setTimeout(() => {
                setShifuComment('');
            }, TIMINGS.SHIFU_COMMENT_DURATION);
        }

        // Check if game is over after the move
        verifyGameOver(updatedBoard);

        // Determine the next player and set valid moves
        const nextPlayer = currentPlayer === PLAYER_COLORS.BLUE ? PLAYER_COLORS.RED : PLAYER_COLORS.BLUE;
        const nextValidMoves = calculateValidMoves(updatedBoard, nextPlayer);
        
        if (nextValidMoves.length > 0) {
            // Next player has moves, switch turn
            setCurrentPlayer(nextPlayer);
        } else {
            // Next player has no moves - check if current player can continue
            const currentPlayerValidMoves = calculateValidMoves(updatedBoard, currentPlayer);
            
            if (currentPlayerValidMoves.length > 0) {
                // Current player can continue, keep the turn
                setNotification(`${nextPlayer === PLAYER_COLORS.BLUE ? 'Blue' : 'Red'} has no valid moves, your turn again!`);
            } else {
                // Neither player has moves - game over (verifyGameOver already called above)
            }
        }

        // Emit the move to the server
        socket.emit('makeMove', {gameCode, move});
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

            {/* Ducky Selector */}
            <DuckySelector
                selectedDucky={selectedDucky}
                onSelect={setSelectedDucky}
                assignedColor={assignedColor}
                shieldUsed={shieldUsed}
                onNotification={setNotification}
            />

            {/* Notification */}
            <Notification
                message={notification}
            />
        </div>
    );
};

export default Board;