import React, { useEffect, useState } from 'react';
import './Notification.css';
import { NOTIFICATION } from '../constants/gameConstants';

/**
 * Self-managing Notification Component - Displays toast notifications
 * 
 * Usage:
 * <Notification message={message} />
 * 
 * Optional: Pass custom duration to override default
 * <Notification message={message} duration={3000} />
 * 
 * The component automatically shows/hides based on the message prop.
 * When message changes to a new value, it displays and auto-hides after duration.
 */
const Notification = ({ message, duration = NOTIFICATION.DURATION }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(null);

  useEffect(() => {
    if (message) {
      setCurrentMessage(message);
      setIsVisible(true);
      setIsFadingOut(false);

      // Start fade out before removing
      const fadeOutTimer = setTimeout(() => {
        setIsFadingOut(true);
      }, duration);

      // Hide notification after fade out
      const hideTimer = setTimeout(() => {
        setIsVisible(false);
      }, duration + NOTIFICATION.FADE_OUT_DURATION);

      return () => {
        clearTimeout(fadeOutTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [message, duration]);

  if (!isVisible || !currentMessage) return null;

  return (
    <div className={`notification-box ${isFadingOut ? 'fade-out' : ''}`}>
      {currentMessage}
    </div>
  );
};

export default Notification;
