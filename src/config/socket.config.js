/**
 * Socket.io configuration
 * Centralizes socket connection settings
 */

const SOCKET_CONFIG = {
  // Use environment variable or fallback to localhost
  SERVER_URL: process.env.REACT_APP_SERVER_URL || 'http://localhost:3001',
  
  // Socket.io client options
  OPTIONS: {
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 20000,
  }
};

export default SOCKET_CONFIG;
