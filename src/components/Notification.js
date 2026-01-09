import React, { useEffect, useState } from 'react';
import './Notification.css';

/**
 * Notification Component - Displays toast notifications
 * This replaces the DOM manipulation approach with a proper React component
 * 
 * Usage:
 * <Notification message={message} duration={2000} onClose={() => setMessage(null)} />
 */
const Notification = ({ message, duration = 2000, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      setIsFadingOut(false);

      // Start fade out before removing
      const fadeOutTimer = setTimeout(() => {
        setIsFadingOut(true);
      }, duration);

      // Remove notification after fade out
      const removeTimer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, duration + 500);

      return () => {
        clearTimeout(fadeOutTimer);
        clearTimeout(removeTimer);
      };
    }
  }, [message, duration, onClose]);

  if (!isVisible || !message) return null;

  return (
    <div className={`notification-box ${isFadingOut ? 'fade-out' : ''}`}>
      {message}
    </div>
  );
};

export default Notification;
