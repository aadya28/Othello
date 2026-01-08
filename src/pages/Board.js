import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import './Board.css';
import { placeBomb, triggerExplosion, checkForBomb } from '../services/gameLogic.service';
import {
  BOARD_SIZE,
  PLAYER_COLORS,
  CELL_TYPES,
  GAME_MODES,
  DIRECTIONS,
  INITIAL_BOARD,
  SHIFU_COMPLIMENTS,
  SHIFU_SARCASM,
  IMAGE_PATHS,
  SERVER_CONFIG,
  TIMINGS,
} from '../constants/gameConstants';

const socket = io(SERVER_CONFIG.URL, {
  reconnection: SERVER_CONFIG.RECONNECTION,
  reconnectionDelay: SERVER_CONFIG.RECONNECTION_DELAY,
  reconnectionDelayMax: SERVER_CONFIG.RECONNECTION_DELAY_MAX,
  reconnectionAttempts: SERVER_CONFIG.RECONNECTION_ATTEMPTS,
});

socket.on('connect', () => {
  console.log('Connected to server:', socket.id);
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});


const Board = () => {
  const { gameCode } = useParams();
  const navigate = useNavigate();
  const [board, setBoard] = useState(INITIAL_BOARD);
  const [currentPlayer, setCurrentPlayer] = useState(PLAYER_COLORS.BLUE);
  const [validMoves, setValidMoves] = useState([]);
  const [selectedDucky, setSelectedDucky] = useState(CELL_TYPES.REGULAR);
  const [blueCount, setBlueCount] = useState(2);
  const [redCount, setRedCount] = useState(2);
  const [shieldedCells, setShieldedCells] = useState({ [PLAYER_COLORS.BLUE]: [], [PLAYER_COLORS.RED]: [] });
  const [shieldUsed, setShieldUsed] = useState({ [PLAYER_COLORS.BLUE]: false, [PLAYER_COLORS.RED]: false });
  const [selectedCell, setSelectedCell] = useState(null); // To highlight the cell where the bomb is placed
  const [bombs, setBombs] = useState({ [PLAYER_COLORS.BLUE]: null, [PLAYER_COLORS.RED]: null });
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [assignedColor, setAssignedColor] = useState(null);
  const [shifuComment, setShifuComment] = useState('');

  useEffect(() => {
    console.log('Joining game:', gameCode);
    socket.emit('joinGame', { gameCode });

    if (gameCode === GAME_MODES.SHIFU) {
      setAssignedColor(PLAYER_COLORS.BLUE);
    }

    // Sync shielded cells
    socket.on('shieldsUpdated', (updatedShields) => {
      console.log("Received updated shielded cells:", updatedShields);
      setShieldedCells(updatedShields);
    });

    // Assign player color
    socket.on('assignedColor', (color) => {
      setAssignedColor(color);
      console.log(`Assigned color: ${color}`);
    });

    // Receive game state updates
    socket.on('gameState', (gameState) => {
      console.log('Received game state:', gameState);
      setBoard(gameState.board);
      setCurrentPlayer(gameState.currentPlayer);
      setShieldedCells(gameState.shieldedCells); // Sync shielded cells
      calculatePieceCount(gameState.board);
      setValidMoves(calculateValidMoves(gameState.board, gameState.currentPlayer));
    });

    return () => {
      socket.off('assignedColor');
      socket.off('gameState');
      socket.off('shieldsUpdated');
    };
  }, [gameCode]);

  const [prevBlueCount, setPrevBlueCount] = useState(2);
  const [prevRedCount, setPrevRedCount] = useState(2);

  const calculatePieceCount = (board) => {
    let blue = 0;
    let red = 0;
    board.forEach(row => {
      row.forEach(cell => {
        if (cell.player === 'B') blue++;
        if (cell.player === 'R') red++;
      });
    });
    setPrevBlueCount(blueCount); // Store previous counts
    setPrevRedCount(redCount);
    setBlueCount(blue);
    setRedCount(red);
  };

  const checkIsValidMove = (board, row, col, player, type) => {
    if (board[row][col].player !== null) return false; // Cell must be empty
    const opponent = player === PLAYER_COLORS.BLUE ? PLAYER_COLORS.RED : PLAYER_COLORS.BLUE;
    let valid = false;

    DIRECTIONS.forEach(([dx, dy]) => {
      let x = row + dx;
      let y = col + dy;
      let hasOpponentBetween = false;

      while (x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE && board[x][y].player === opponent) {
        hasOpponentBetween = true;
        x += dx;
        y += dy;
      }

      if (hasOpponentBetween && x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE && board[x][y].player === player) {
        valid = true;
      }
    });

    return valid;
  };

  const calculateValidMoves = (board, player) => {
    const moves = [];
    board.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (checkIsValidMove(board, rowIndex, colIndex, player, selectedDucky)) {
          moves.push([rowIndex, colIndex]);
        }
      });
    });
    return moves; // Return the array of valid moves
  };

  const flipGamePieces = (board, row, col, player, type, shieldedCells) => {
    const opponent = player === PLAYER_COLORS.BLUE ? PLAYER_COLORS.RED : PLAYER_COLORS.BLUE;
    const newBoard = board.map(row => row.slice());

    DIRECTIONS.forEach(([dx, dy]) => {
      let x = row + dx;
      let y = col + dy;
      const piecesToFlip = [];

      while (x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE && board[x][y].player === opponent) {
        const isShielded =
            shieldedCells[opponent].some(([shieldRow, shieldCol]) => shieldRow === x && shieldCol === y);

        if (!isShielded) {
          piecesToFlip.push([x, y]);
        } else {
          break;
        }
        x += dx;
        y += dy;
      }

      if (piecesToFlip.length > 0 && x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE && board[x][y].player === player) {
        piecesToFlip.forEach(([fx, fy]) => {
          newBoard[fx][fy] = { type: board[fx][fy].type, player };
        });
      }
    });

    newBoard[row][col] = { type, player };
    return newBoard;
  };

  const displayNotification = (message) => {
    // Remove existing notification if any
    const existingBox = document.querySelector('.notification-box');
    if (existingBox) {
      existingBox.remove();
    }

    // Create the notification box
    const notificationBox = document.createElement('div');
    notificationBox.classList.add('notification-box');
    notificationBox.innerText = message;
    document.body.appendChild(notificationBox);

    // Remove the box after 2.5 seconds with fade-out effect
    setTimeout(() => {
      notificationBox.classList.add('fade-out');
      setTimeout(() => notificationBox.remove(), 500);
    }, 2000);
  };

  const checkCanGetShielded = (player, shieldedCells, row, col) => {
    const opponent = player === 'B' ? 'R' : 'B';
    if (board[row][col].player === opponent) {
      displayNotification("Cannot shield opponent's cell!");
      return false;
    }
    return true;
  };

  const verifyGameOver = (board) => {
    const isBoardFull = board.every(row => row.every(cell => cell.player !== null));
    if (isBoardFull) {
      setGameOver(true);
      if (blueCount > redCount) {
        setWinner('Blue');
      } else if (redCount > blueCount) {
        setWinner('Red');
      } else {
        setWinner('Draw');
      }
    }
  };

  const handleRestartGame = () => {
    setBoard(INITIAL_BOARD);
    setCurrentPlayer(PLAYER_COLORS.BLUE);
    setValidMoves([]);
    setSelectedDucky(CELL_TYPES.REGULAR);
    setBlueCount(2);
    setRedCount(2);
    setShieldedCells({ [PLAYER_COLORS.BLUE]: [], [PLAYER_COLORS.RED]: [] });
    setSelectedCell(null);
    setBombs({ [PLAYER_COLORS.BLUE]: null, [PLAYER_COLORS.RED]: null });
    setGameOver(false);
    setWinner(null);
  };

  useEffect(() => {
    setValidMoves(calculateValidMoves(board, currentPlayer));
    verifyGameOver(board);
  }, [board, currentPlayer]);

  const executeComputerMove = () => {
    const userGain = blueCount - prevBlueCount;
    const shifuGain = redCount - prevRedCount;

    console.log(userGain);
    console.log(shifuGain);
    const randomCompliment = SHIFU_COMPLIMENTS[Math.floor(Math.random() * SHIFU_COMPLIMENTS.length)];
    const randomSarcasm = SHIFU_SARCASM[Math.floor(Math.random() * SHIFU_SARCASM.length)];

    if (shifuGain > userGain) {
      console.log('Shifu Comment (Shifu gains more pieces):', randomSarcasm);
      setShifuComment(`😏 ${randomSarcasm}`);
      displayNotification(shifuComment);
      
    } else if (userGain > shifuGain) {
      console.log('Shifu Comment (User gains more pieces):', randomCompliment);
      setShifuComment(`👏 ${randomCompliment}`);
      displayNotification(shifuComment);
    } else {
      console.log('Shifu Comment (Tie): Seems like we are evenly matched...');
      setShifuComment('🤔 Seems like we are evenly matched...');
      displayNotification(shifuComment);
    }

    // Clear Shifu's comment after specified time
    setTimeout(() => {
      setShifuComment('');
    }, TIMINGS.SHIFU_COMMENT_DURATION);

    const validMoves = calculateValidMoves(board, PLAYER_COLORS.RED);
    if (validMoves.length > 0) {
      const [row, col] = validMoves[Math.floor(Math.random() * validMoves.length)];
      const newBoard = flipGamePieces(board, row, col, PLAYER_COLORS.RED, CELL_TYPES.REGULAR, shieldedCells);
      setBoard(newBoard);
      calculatePieceCount(newBoard);
      setCurrentPlayer(PLAYER_COLORS.BLUE);
    } else {
      // No valid moves for computer, pass turn back to player
      setCurrentPlayer(PLAYER_COLORS.BLUE);
      displayNotification("Computer has no valid moves, your turn again!");
    }
  };

  useEffect(() => {
    if (gameCode === GAME_MODES.SHIFU && currentPlayer === PLAYER_COLORS.RED) {
      setTimeout(executeComputerMove, TIMINGS.COMPUTER_MOVE_DELAY);
    }
  }, [currentPlayer, gameCode]);

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
      return; // Shield placement complete, no further processing needed
    }

    // Handle bomb placement
    if (selectedDucky === CELL_TYPES.BOMB) {
      if (bombs[currentPlayer] !== null) {
        displayNotification("You can only place one bomb!");
        return;
      }

      const newBombs = { ...bombs, [currentPlayer]: [row, col] };
      setBombs(newBombs);

      const updatedBoard = board.map(rowArr => rowArr.slice());
      updatedBoard[row][col] = { type: CELL_TYPES.BOMB, player: currentPlayer }; // Place bomb on board
      setBoard(updatedBoard);

      // Emit updated bomb state to the server
      socket.emit('updateBombs', { gameCode, bombs: newBombs });

      setSelectedDucky(CELL_TYPES.REGULAR); // Reset selected ducky
      return; // Bomb placement complete, no further processing needed
    }

    // Handle regular and other ducky moves (flip pieces)
    const updatedBoard = flipGamePieces(board, row, col, currentPlayer, selectedDucky, shieldedCells);
    setBoard(updatedBoard);
    calculatePieceCount(updatedBoard);

    // Determine piece gains for user and Shifu
    const userGain = blueCount - prevBlueCount;
    const shifuGain = redCount - prevRedCount;

    // Randomize comments
    const randomCompliment = SHIFU_COMPLIMENTS[Math.floor(Math.random() * SHIFU_COMPLIMENTS.length)];
    const randomSarcasm = SHIFU_SARCASM[Math.floor(Math.random() * SHIFU_SARCASM.length)];

    // Set Shifu's speech bubble comment
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



    // Check if the current move triggers a bomb explosion
    if (bombs[currentPlayer] && [row, col].toString() === bombs[currentPlayer].toString()) {
      triggerExplosion(row, col, currentPlayer, board, setBoard); // Trigger explosion if bomb is stepped on
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
    const isShielded = shieldedCells[currentPlayer].some(([shieldRow, shieldCol]) => shieldRow === row && shieldCol === col);
    const piece = board[row][col];
    const shieldClass = piece.type === CELL_TYPES.SHIELD ? 'shielded-piece': '';
    const bombClass = piece.type === CELL_TYPES.BOMB ? 'bomb-cell' : '';

    let imageSrc = '';
    if (piece.player === PLAYER_COLORS.BLUE) {
      if(piece.type === CELL_TYPES.REGULAR){
        imageSrc = IMAGE_PATHS.BLUE_DUCKIE;
      } else if (piece.type === CELL_TYPES.SHIELD) {
        imageSrc = IMAGE_PATHS.BLUE_SHIELD;
      } else if (piece.type === CELL_TYPES.BOMB) {
        imageSrc = IMAGE_PATHS.BLUE_BOMB;
      }
    } else {
      if(piece.type === CELL_TYPES.REGULAR){
        imageSrc = IMAGE_PATHS.RED_DUCKIE;
      } else if (piece.type === CELL_TYPES.SHIELD) {
        imageSrc = IMAGE_PATHS.RED_SHIELD;
      } else if (piece.type === CELL_TYPES.BOMB) {
        imageSrc = IMAGE_PATHS.RED_BOMB;
      } else if (piece.player === PLAYER_COLORS.RED) {
        imageSrc = gameCode === GAME_MODES.SHIFU ? IMAGE_PATHS.SHIFU : IMAGE_PATHS.SHIFU;
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
          {/* Piece Count */}
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
                  displayNotification('You can only use the shield once!'); // Show notification if disabled
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
