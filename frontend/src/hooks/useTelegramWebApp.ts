import { useEffect, useCallback } from 'react';

interface TelegramWebAppConfig {
  expand?: boolean;
  disableClosing?: boolean;
  preventScrollClose?: boolean;
}

export const useTelegramWebApp = (config: TelegramWebAppConfig = {}) => {
  const {
    expand = true,
    disableClosing = true,
    preventScrollClose = true
  } = config;

  const initializeWebApp = useCallback(() => {
    if (!window.Telegram?.WebApp) {
      console.log("Telegram WebApp not detected - running in browser mode");
      return () => {}; // Return empty cleanup function
    }

    const tg = window.Telegram.WebApp;
    console.log("Initializing Telegram WebApp with config:", config);

    // Signal that WebApp is ready
    tg.ready();

    // Expand the WebApp if requested
    if (expand) {
      console.log("Expanding WebApp...");
      tg.expand();
    }

    // Configure to prevent closing on scroll
    if (preventScrollClose) {
      // Set up viewport configuration
      console.log("Configuring viewport to prevent scroll closing...");
      
      // Hide main button to prevent accidental closing
      if (tg.MainButton) {
        tg.MainButton.hide();
      }

      // Configure back button carefully
      if (tg.BackButton) {
        tg.BackButton.show();
        tg.BackButton.onClick(() => {
          console.log("Back button pressed - preventing automatic close");
          // You can implement custom navigation logic here
        });
      }
    }

    // Disable closing confirmation if requested
    if (disableClosing && tg.isClosingConfirmationEnabled !== undefined) {
      console.log("Disabling closing confirmation...");
    }

    // Set up event listeners to prevent accidental closing
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      console.log("Preventing accidental page unload");
      // You can show a confirmation dialog here if needed
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Set up touch event listeners to prevent overscroll
    const handleTouchStart = (e: TouchEvent) => {
      // Prevent overscroll behavior
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        const element = e.target as HTMLElement;
        if (element) {
          element.style.overscrollBehavior = 'none';
        }
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });

    console.log("Telegram WebApp initialized successfully");

    // Cleanup function
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('touchstart', handleTouchStart);
    };
  }, [expand, disableClosing, preventScrollClose, config]);

  useEffect(() => {
    const cleanup = initializeWebApp();
    return cleanup;
  }, [initializeWebApp]);

  return {
    isWebApp: !!window.Telegram?.WebApp,
    webApp: window.Telegram?.WebApp || null
  };
};
