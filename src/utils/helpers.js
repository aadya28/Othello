/**
 * Generate a random game code for multiplayer sessions
 * @param {number} length - Length of the game code (default: 6)
 * @returns {string} Uppercase alphanumeric game code
 */
export const generateGameCode = (length = 6) => {
    const radix = 36; // Base-36 (0-9, a-z)
    return Math.random()
        .toString(radix)
        .substring(2, 2 + length)
        .toUpperCase();
};

/**
 * Get a random element from an array
 * @param {Array} array - The array to pick from
 * @returns {*} A random element from the array
 */
export const getRandomElement = (array) => {
    if (!array || array.length === 0) {
        throw new Error('Cannot get random element from empty array');
    }
    return array[Math.floor(Math.random() * array.length)];
};
