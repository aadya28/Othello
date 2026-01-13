# Othello Duckies 🦆

Othello Duckies is a multiplayer Othello (Reversi) game with a twist! Players can place regular pieces, shields, and bombs to add strategic depth to the classic game. Challenge a friend in multiplayer mode or test your skills against Shifu, the AI opponent.

> **Note:** This is an enhanced fork of the [original WE-Othello project](https://github.com/NavyaNayer/Othello) that is part of the mini-games in the [We-Arcade](https://github.com/WE-Arcade), featuring improved code structure, better organization, and ongoing bug fixes.

## Features

- **Multiplayer Mode**: Create or join games with a unique game code
- **Shifu AI Mode**: Practice against an AI opponent with witty commentary
- **Shield Duckies**: Protect cells from being flipped by opponents
- **Bomber Duckies**: Strategic explosive pieces (coming soon!)
- **Real-time Gameplay**: Powered by Socket.io for seamless multiplayer experience
- **Responsive Design**: Play on desktop or mobile devices

## Examples of Platform:
### Landing Page
![Landing Page](./screenshots/landing_page.png)

### Multiplayer Mode
![Multiplayer Mode](./screenshots/multiplayer.png)

### Shifu AI Mode
![Shifu AI](./screenshots/shifu_ai.png)

## Recent Enhancements

This fork includes significant improvements to the codebase:

- **Better Code Organization**: Restructured into a scalable, production-ready architecture
  - Separated concerns with `hooks/`, `services/`, `context/`, `constants/`, and `utils/` directories
  - Split large components into smaller, maintainable pieces
- **Extracted Business Logic**: Game logic moved to reusable service files
- **Custom React Hooks**: Created `useGameStates`, `useGameLogic`, `useGameSocket`, and `useShifuAI`
- **Constants & Configuration**: Eliminated magic numbers and hardcoded values
- **Context API Integration**: Removed prop drilling with centralized state management
- **Code Consistency**: Applied React best practices and consistent naming conventions

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)

### Installation

1. Clone the repository:
   ```sh
   git clone <https://github.com/aadya28/Othello>
   ```
2. Navigate to the project directory:
   ```sh
   cd othello-duckies
   ```
3. Install the dependencies:
   ```sh
   npm install
   ```

### Running the Game

You need to run **both** the WebSocket server and the React app:

1. **Start the WebSocket server** (in one terminal):
   ```sh
   node server.js
   ```
   The server will start on `http://localhost:3001`

2. **Start the React application** (in another terminal):
   ```sh
   npm start
   ```
   The app will open at `http://localhost:3000`

> **Important:** Both servers must be running for the game to work. The React app (port 3000) communicates with the WebSocket server (port 3001) for all multiplayer and game logic functionality.

## How to Play

- **Create Game**: Click on "Create Game" to start a new game. Share the game code with a friend to join.
- **Join Game**: Enter a game code to join an existing game.
- **Place Pieces**: Click on a cell to place your piece. You can place regular pieces, shields, or bombs.
- **Win Condition**: The game ends when the board is full or no valid moves are left. The player with the most pieces wins.

## Related Projects
- [WE-Arcade (Github Organisation)](https://github.com/WE-Arcade)
- [WE-Arcade Repository](https://github.com/WE-Arcade/WE-Arcade)
- [WE-Arcade Mini-Games Repository](https://github.com/WE-Arcade/Mini-Games)
- [Original WE-Othello project](https://github.com/NavyaNayer/Othello)
