const express = require("express");
const http = require("http");
const {Server} = require("socket.io");
const {
    createInitialBoard,
    getValidMoves,
    flipPieces,
    calculatePieceCount,
    checkGameOver
} = require("./server/services/boardService.js");
const {calculateAIMove, generateShifuComment} = require("./server/services/shifuAIService");
const {PLAYER_COLORS, GAME_MODES} = require("./server/constants/gameConstants.js");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: [
            'http://localhost:3000',
            'https://othelloduckgame.vercel.app/'
        ],
        methods: ["GET", "POST"]
    }
});

app.use(express.static("public"));

// Store all active games
const games = new Map();

/**
 * Create new game state
 */
const createGameState = () => ({
    board: createInitialBoard(),
    currentPlayer: PLAYER_COLORS.BLUE,
    shieldedCells: {
        [PLAYER_COLORS.BLUE]: [],
        [PLAYER_COLORS.RED]: [],
    },
    shieldUsed: {
        [PLAYER_COLORS.BLUE]: false,
        [PLAYER_COLORS.RED]: false,
    },
    players: {},
});

/**
 * Core move logic - used by both human players and AI
 * This is the single source of truth for making moves
 */
const applyMove = (game, player, row, col, type) => {
    // Validate the move is legal
    const validMoves = getValidMoves(game.board, player);
    const isValid = validMoves.some(([r, c]) => r === row && c === col);

    if (!isValid) {
        return {success: false, error: "Invalid move"};
    }

    // Handle shield placement
    if (type === 'shield') {
        if (game.shieldUsed[player]) {
            return {success: false, error: "Shield already used"};
        }
        game.shieldedCells[player].push([row, col]);
        game.shieldUsed[player] = true;
        console.log(`🛡️ Shield placed by ${player} at [${row}, ${col}]`);
    }

    // Execute the move and flip pieces
    game.board = flipPieces(
        game.board,
        row,
        col,
        player,
        type,
        game.shieldedCells
    );

    console.log(`✅ Move executed by ${player} at [${row}, ${col}]`);

    // Determine next player
    const opponent = player === PLAYER_COLORS.BLUE
        ? PLAYER_COLORS.RED
        : PLAYER_COLORS.BLUE;

    const opponentMoves = getValidMoves(game.board, opponent);

    if (opponentMoves.length > 0) {
        // Opponent has valid moves, switch turn
        game.currentPlayer = opponent;
        return {
            success: true,
            nextPlayer: opponent,
            noMovesForOpponent: false
        };
    } else {
        // Opponent has no valid moves, current player continues
        game.currentPlayer = player;
        const opponentName = opponent === PLAYER_COLORS.BLUE ? 'Blue' : 'Red';
        console.log(`⚠️ ${opponentName} has no valid moves`);
        return {
            success: true,
            nextPlayer: player,
            noMovesForOpponent: true,
            opponentName
        };
    }
};

/**
 * Check if game is over and emit if so
 */
const checkAndEmitGameOver = (gameCode) => {
    const game = games.get(gameCode);
    if (!game) return false;

    const {isGameOver, winner} = checkGameOver(game.board);
    if (isGameOver) {
        io.to(gameCode).emit("gameOver", {winner});
        console.log(`Game ${gameCode} ended. Winner: ${winner}`);
        return true;
    }
    return false;
};

/**
 * Emit full game state to all players in the room
 */
const emitGameState = (gameCode) => {
    const game = games.get(gameCode);
    if (!game) return;

    const pieceCount = calculatePieceCount(game.board);
    const validMovesBlue = getValidMoves(game.board, PLAYER_COLORS.BLUE);
    const validMovesRed = getValidMoves(game.board, PLAYER_COLORS.RED);

    // Send valid moves for the current player
    const validMoves = game.currentPlayer === PLAYER_COLORS.BLUE
        ? validMovesBlue
        : validMovesRed;

    io.to(gameCode).emit("gameState", {
        board: game.board,
        currentPlayer: game.currentPlayer,
        shieldedCells: game.shieldedCells,
        shieldUsed: game.shieldUsed,
        validMoves: validMoves,
        blueCount: pieceCount.blue,
        redCount: pieceCount.red,
    });
};

/**
 * Execute computer move for Shifu mode
 * Uses the same applyMove logic as human players
 */
const makeComputerMove = (gameCode) => {
    const game = games.get(gameCode);
    if (!game) return;

    const AI_PLAYER = PLAYER_COLORS.RED;
    const HUMAN_PLAYER = PLAYER_COLORS.BLUE;

    // Safety check - ensure its AI's turn
    if (game.currentPlayer !== AI_PLAYER) return;

    // Calculate AI's best move
    const move = calculateAIMove(game.board, AI_PLAYER);

    // No valid moves for AI
    if (!move) {
        console.log("Shifu has no valid moves");

        const humanMoves = getValidMoves(game.board, HUMAN_PLAYER);

        if (humanMoves.length > 0) {
            // Human can continue
            game.currentPlayer = HUMAN_PLAYER;
            io.to(gameCode).emit("notification", "Shifu has no valid moves. Your turn again!");
            emitGameState(gameCode);
        } else {
            // Neither player can move - game over
            checkAndEmitGameOver(gameCode);
        }
        return;
    }

    // Apply the AI move using shared logic
    const result = applyMove(game, AI_PLAYER, move.row, move.col, move.type);

    if (!result.success) {
        console.error("AI made an invalid move:", result.error);
        return;
    }

    // Generate Shifu's witty comment
    const {blue, red} = calculatePieceCount(game.board);
    const shifuComment = generateShifuComment(blue, red);

    io.to(gameCode).emit("shifuComment", {
        text: shifuComment.text,
        emoji: shifuComment.emoji,
        type: shifuComment.type
    });

    // Emit updated game state
    emitGameState(gameCode);

    // Handle no moves for opponent
    if (result.noMovesForOpponent) {
        io.to(gameCode).emit("notification", "You have no valid moves. Shifu plays again!");

        // AI goes again after a delay
        setTimeout(() => {
            makeComputerMove(gameCode);
        }, 1000);
        return;
    }

    // Check if game ended
    checkAndEmitGameOver(gameCode);
};

/**
 * Socket.io connection handler
 */
io.on("connection", (socket) => {
    console.log("✅ Socket connected:", socket.id);

    /**
     * JOIN GAME - Player joins or creates a game room
     */
    socket.on("joinGame", ({gameCode}) => {
        console.log(`Player ${socket.id} joining game: ${gameCode}`);

        // Create game if it doesn't exist
        if (!games.has(gameCode)) {
            games.set(gameCode, createGameState());
            console.log(`New game created: ${gameCode}`);
        }

        const game = games.get(gameCode);

        // Check if player is already in the game (reconnection)
        if (game.players[socket.id]) {
            console.log(` Player ${socket.id} reconnecting to game ${gameCode}`);
            socket.join(gameCode);
            socket.emit("assignedColor", game.players[socket.id]);
            emitGameState(gameCode);
            return;
        }

        // Shifu mode - player is always Blue
        if (gameCode === GAME_MODES.SHIFU) {
            game.players[socket.id] = PLAYER_COLORS.BLUE;
            socket.join(gameCode);
            socket.emit("assignedColor", PLAYER_COLORS.BLUE);
            emitGameState(gameCode);
            console.log(`✅ Player ${socket.id} assigned Blue (Shifu mode)`);
            return;
        }

        // Multiplayer mode - check if game is full
        if (Object.keys(game.players).length >= 2) {
            socket.emit("error", "Game is full");
            console.log(`⛔ Game ${gameCode} is full`);
            return;
        }

        // Assign color: first player gets Blue, second gets Red
        const assignedColor = Object.keys(game.players).length === 0
            ? PLAYER_COLORS.BLUE
            : PLAYER_COLORS.RED;

        game.players[socket.id] = assignedColor;
        socket.join(gameCode);

        console.log(`✅ Player ${socket.id} assigned ${assignedColor === PLAYER_COLORS.BLUE ? 'Blue' : 'Red'}`);

        socket.emit("assignedColor", assignedColor);
        emitGameState(gameCode);
    });

    /**
     * MAKE MOVE - Player makes a move on the board
     * Server validates and applies the move
     */
    socket.on("makeMove", ({gameCode, row, col, type}) => {
        console.log(`Move attempt in ${gameCode}: [${row}, ${col}], type: ${type}`);

        const game = games.get(gameCode);
        if (!game) {
            socket.emit("error", "Game not found");
            return;
        }

        const player = game.players[socket.id];
        if (!player) {
            socket.emit("error", "You are not in this game");
            return;
        }

        // Validate it's the player's turn
        if (player !== game.currentPlayer) {
            socket.emit("error", "Not your turn");
            console.log(`⛔ Not ${player}'s turn, it's ${game.currentPlayer}'s turn`);
            return;
        }

        // Apply the move using shared logic
        const result = applyMove(game, player, row, col, type);

        if (!result.success) {
            socket.emit("error", result.error);
            console.log(`⛔ ${result.error} at [${row}, ${col}]`);
            return;
        }

        // Emit shield update if shield was placed
        if (type === 'shield') {
            io.to(gameCode).emit('shieldsUpdated', game.shieldedCells);
        }

        // Notify if opponent has no moves
        if (result.noMovesForOpponent) {
            io.to(gameCode).emit('notification', `${result.opponentName} has no valid moves, your turn again!`);
        }

        // Broadcast updated game state
        emitGameState(gameCode);

        // Check if game is over
        if (checkAndEmitGameOver(gameCode)) {
            return; // Game ended
        }

        // Trigger AI move if in Shifu mode and it's AI's turn
        if (gameCode === GAME_MODES.SHIFU && game.currentPlayer === PLAYER_COLORS.RED) {
            setTimeout(() => {
                makeComputerMove(gameCode);
            }, 1000); // 1 second delay for better UX
        }
    });

    /**
     * RESTART GAME - Reset the game state
     */
    socket.on("restartGame", ({gameCode}) => {
        console.log(`Restart requested for game: ${gameCode}`);

        const game = games.get(gameCode);
        if (!game) {
            socket.emit("error", "Game not found");
            return;
        }

        // Reset game state
        game.board = createInitialBoard();
        game.currentPlayer = PLAYER_COLORS.BLUE;
        game.shieldedCells = {
            [PLAYER_COLORS.BLUE]: [],
            [PLAYER_COLORS.RED]: [],
        };
        game.shieldUsed = {
            [PLAYER_COLORS.BLUE]: false,
            [PLAYER_COLORS.RED]: false,
        };

        console.log(`✅ Game ${gameCode} restarted`);

        // Signal restart to reset client UI state
        io.to(gameCode).emit("gameRestarted");

        // Broadcast fresh game state
        emitGameState(gameCode);

        // Notify players
        io.to(gameCode).emit("notification", "Game restarted!");
    });

    /**
     * DISCONNECT - Player leaves the game
     */
    socket.on("disconnect", () => {
        console.log("❌ Socket disconnected:", socket.id);

        // Find and clean up any games this player was in
        for (const [gameCode, game] of games.entries()) {
            if (game.players[socket.id]) {
                console.log(`Player ${socket.id} left game ${gameCode}`);
                delete game.players[socket.id];

                // Delete game if no players left
                if (Object.keys(game.players).length === 0) {
                    games.delete(gameCode);
                    console.log(`🗑️ Game ${gameCode} deleted (no players left)`);
                } else {
                    // Notify remaining player
                    io.to(gameCode).emit("notification", "Your opponent disconnected");
                }
                break;
            }
        }
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});