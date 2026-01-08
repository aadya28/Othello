import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Board.css';
import { CELL_TYPES, GAME_MODES, IMAGE_PATHS, PLAYER_COLORS, TIMINGS } from '../constants/gameConstants';
import { getRandomElement } from '../utils/randomHelpers';
import { cloneBoard } from '../utils/boardHelpers';
import { displayNotification } from '../utils/notificationHelper';
import useGameState from '../hooks/useGameState';
import useGameLogic from '../hooks/useGameLogic';
import useGameSocket from '../hooks/useGameSocket';
import useShifuAI from '../hooks/useShifuAI';

const Board = () => {
  const { gameCode } = useParams();
  const navigate = useNavigate();

  // Game state management
  const gameState = useGameState();
  const {
    board,
    currentPlayer,
    validMoves,
    selectedDucky,
    blueCount,
    redCount,
    prevBlueCount,
    prevRedCount,
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
    setPrevBlueCount,
    setPrevRedCount,
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
  } = useGameLogic(gameState);

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
    prevBlueCount,
    prevRedCount,
    shieldedCells,
    setBoard,
    setCurrentPlayer,
    setShifuComment,
    calculatePieceCount,
    calculateValidMoves,
    flipGamePieces,
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
      displayNotification("This cell is already occupied!");
      return;
    }

    // Check if it's the current player's turn
    if (currentPlayer !== assignedColor) {
      displayNotification("It's your opponent's turn!");
      return;
    }

    // Check if the move is valid
    const isValid = validMoves.some(([validRow, validCol]) => validRow === row && validCol === col);
    if (!isValid) {
      displayNotification("Invalid move!");
      return;
    }

    const move = { row, col, player: currentPlayer, type: selectedDucky };

    // Store previous counts before making the move
    setPrevBlueCount(blueCount);
    setPrevRedCount(redCount);

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
        socket.emit('updateShieldedCells', { gameCode, shieldedCells: updatedShields });
        return updatedShields;
      });

      const updatedBoard = board.map((rowArr, rowIndex) =>
        rowArr.map((cell, colIndex) => {
          if (rowIndex === row && colIndex === col) {
            return { type: CELL_TYPES.SHIELD, player: currentPlayer };
          }
          return cell;
        })
      );

      setBoard(updatedBoard);
      setShieldUsed((prev) => ({ ...prev, [currentPlayer]: true }));
      setSelectedDucky(CELL_TYPES.REGULAR);
      return;
    }

    // Handle bomb placement
    if (selectedDucky === CELL_TYPES.BOMB) {
      if (bombs[currentPlayer] !== null) {
        displayNotification("You can only place one bomb!");
        return;
      }

      const newBombs = { ...bombs, [currentPlayer]: [row, col] };
      setBombs(newBombs);

      const updatedBoard = cloneBoard(board);
      updatedBoard[row][col] = { type: CELL_TYPES.BOMB, player: currentPlayer };
      setBoard(updatedBoard);

      // Emit updated bomb state to the server
      socket.emit('updateBombs', { gameCode, bombs: newBombs });

      setSelectedDucky(CELL_TYPES.REGULAR);
      return;
    }

    // Handle regular and other ducky moves (flip pieces)
    const updatedBoard = flipGamePieces(board, row, col, currentPlayer, selectedDucky, shieldedCells);
    setBoard(updatedBoard);
    calculatePieceCount(updatedBoard);

    // Determine piece gains for user and Shifu
    const userGain = blueCount - prevBlueCount;
    const shifuGain = redCount - prevRedCount;

    // Randomize comments
    const randomCompliment = getRandomElement(['Nice move!', 'Well played!', 'Impressive strategy!']);
    const randomSarcasm = getRandomElement(['Is that all you got?', 'I expected better!', 'Too easy!']);

    // Set Shifu's speech bubble comment (only in Shifu mode)
    if (gameCode === GAME_MODES.SHIFU) {
      if (userGain > shifuGain) {
        console.log('Shifu Comment (user gains more pieces):', randomCompliment);
        setShifuComment(`👏 ${randomCompliment}`);
      } else if (shifuGain > userGain) {
        console.log('Shifu Comment (Shifu gains more pieces):', randomSarcasm);
        setShifuComment(`😏 ${randomSarcasm}`);
      } else {
        console.log('Shifu Comment (Tie): A tie? Is that all you got?');
        setShifuComment('🤔 A tie? Is that all you got?');
      }

      // Clear the comment after specified time
      setTimeout(() => {
        setShifuComment('');
      }, TIMINGS.SHIFU_COMMENT_DURATION);
    }

    // Determine the next player and set valid moves
    const nextPlayer = currentPlayer === PLAYER_COLORS.BLUE ? PLAYER_COLORS.RED : PLAYER_COLORS.BLUE;
    const nextValidMoves = calculateValidMoves(updatedBoard, nextPlayer);
    if (nextValidMoves.length > 0) {
      setCurrentPlayer(nextPlayer);
    } else {
      displayNotification(`${nextPlayer === PLAYER_COLORS.BLUE ? 'Blue' : 'Red'} has no valid moves, your turn again!`);
    }

    // Emit the move to the server
    socket.emit('makeMove', { gameCode, move });
  };

  const renderGameCell = (row, col) => {
    const isValid = validMoves.some(([validRow, validCol]) => validRow === row && validCol === col);
    const piece = board[row][col];

    let imageSrc = '';
    if (piece.player === PLAYER_COLORS.BLUE) {
      if (piece.type === CELL_TYPES.REGULAR) {
        imageSrc = IMAGE_PATHS.BLUE_DUCKIE;
      } else if (piece.type === CELL_TYPES.SHIELD) {
        imageSrc = IMAGE_PATHS.BLUE_SHIELD;
      } else if (piece.type === CELL_TYPES.BOMB) {
        imageSrc = IMAGE_PATHS.BLUE_BOMB;
      }
    } else if (piece.player === PLAYER_COLORS.RED) {
      if (piece.type === CELL_TYPES.REGULAR) {
        imageSrc = IMAGE_PATHS.RED_DUCKIE;
      } else if (piece.type === CELL_TYPES.SHIELD) {
        imageSrc = IMAGE_PATHS.RED_SHIELD;
      } else if (piece.type === CELL_TYPES.BOMB) {
        imageSrc = IMAGE_PATHS.RED_BOMB;
      }
    }

    return (
      <div
        key={`${row}-${col}`}
        className={`cell ${isValid ? 'valid-move' : ''}`}
        onClick={() => handleCellClick(row, col)}
      >
        {imageSrc && <img src={imageSrc} alt={piece.type} className="piece-image" />}
      </div>
    );
  };

  return (
    <div className="board-container">
      {/* Top Buttons */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/icon?family=Material+Icons"
      />

      <div className="top-buttons">
        <button className="icon-button" title="Home" onClick={() => navigate('/')}>
          <span className="material-icons">home</span>
        </button>
        <button className="icon-button" title="Restart" onClick={handleRestartGame}>
          <span className="material-icons">restart_alt</span>
        </button>
      </div>

      {/* Piece Count*/}
      <div className="piece-count-container">
        <div className="piece-count">
          <div>
            <img
              className="duckie-img"
              src={IMAGE_PATHS.BLUE_DUCKIE}
              alt="Blue Ducky"
            />
            : {blueCount}
          </div>
          <div>
            <img
              className="duckie-img"
              src={IMAGE_PATHS.RED_DUCKIE}
              alt="Red Ducky"
            />
            : {redCount}
          </div>
        </div>
      </div>

      {/* Shifu (centered) */}
      {gameCode === GAME_MODES.SHIFU && (
        <div className="shifu-center-container">
          <div className="shifu-container">
            <img
              className="shifu-img"
              src={IMAGE_PATHS.SHIFU}
              alt="Shifu Opponent"
            />
            <p className="shifu-label">Shifu Opponent</p>
            <div className={`shifu-speech-bubble ${shifuComment ? 'visible' : 'hidden'}`}>
              <p>{shifuComment}</p>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Message */}
      {gameOver && (
        <div className="game-over">
          <h2>Game Over</h2>
          <p>{winner === 'Draw' ? "It's a Draw!" : `${winner} Wins!`}</p>
          <button onClick={handleRestartGame}>Restart Game</button>
        </div>
      )}

      {/* Game Board */}
      <div className={`board ${gameOver ? 'disabled' : ''}`}>
        {board.map((row, rowIndex) =>
          row.map((_, colIndex) => renderGameCell(rowIndex, colIndex))
        )}
      </div>

      {/* Ducky Selection */}
      <div className="ducky-selection">
        {/* Regular Ducky */}
        <button
          onClick={() => setSelectedDucky(CELL_TYPES.REGULAR)}
          className={selectedDucky === CELL_TYPES.REGULAR ? 'selected' : ''}
        >
          <p className="button-text">Regular Ducky</p>
          <img
            className="duckie-img"
            src={assignedColor === PLAYER_COLORS.BLUE ? IMAGE_PATHS.BLUE_DUCKIE : IMAGE_PATHS.RED_DUCKIE}
            alt="Regular Ducky"
          />
        </button>

        {/* Shield Ducky */}
        <button
          onClick={() => {
            if (shieldUsed[assignedColor]) {
              displayNotification('You can only use the shield once!');
            } else {
              setSelectedDucky(CELL_TYPES.SHIELD);
            }
          }}
          className={`${selectedDucky === CELL_TYPES.SHIELD ? 'selected' : ''} ${
            shieldUsed[assignedColor] ? 'disabled' : ''
          }`}
        >
          <p className="button-text">Shield Ducky</p>
          <img
            className="duckie-img"
            src={assignedColor === PLAYER_COLORS.BLUE ? IMAGE_PATHS.BLUE_SHIELD : IMAGE_PATHS.RED_SHIELD}
            alt="Shield Ducky"
          />
        </button>

        {/* Bomber Ducky */}
        <button
          onClick={() => setSelectedDucky(CELL_TYPES.BOMB)}
          className={selectedDucky === CELL_TYPES.BOMB ? 'selected' : ''}
        >
          <p className="button-text">Bomber Ducky</p>
          <img
            className="duckie-img"
            src={assignedColor === PLAYER_COLORS.BLUE ? IMAGE_PATHS.BLUE_BOMB : IMAGE_PATHS.RED_BOMB}
            alt="Bomber Ducky"
          />
        </button>
      </div>
    </div>
  );
};

export default Board;
