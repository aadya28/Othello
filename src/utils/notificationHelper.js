/**
 * Display a temporary notification message to the user
 * @param {string} message - The message to display
 * @param {number} duration - How long to show the notification in ms (default: 2000)
 */
export const displayNotification = (message, duration = 2000) => {
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

  // Remove the box after duration with fade-out effect
  setTimeout(() => {
    notificationBox.classList.add('fade-out');
    setTimeout(() => notificationBox.remove(), 500);
  }, duration);
};
