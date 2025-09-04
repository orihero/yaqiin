// Utility functions for Telegram WebApp

export const isTelegramWebApp = (): boolean => {
  return !!window.Telegram?.WebApp;
};

export const getTelegramWebApp = () => {
  return window.Telegram?.WebApp || null;
};

export const initializeTelegramWebApp = () => {
  if (!isTelegramWebApp()) {
    console.log("Telegram WebApp not detected");
    return false;
  }

  const tg = getTelegramWebApp();
  if (!tg) return false;

  try {
    // Signal that WebApp is ready
    tg.ready();
    
    // Expand the WebApp
    tg.expand();
    
    console.log("Telegram WebApp initialized successfully");
    return true;
  } catch (error) {
    console.error("Error initializing Telegram WebApp:", error);
    return false;
  }
};

export const getWebAppInitData = () => {
  if (!isTelegramWebApp()) return null;
  
  const tg = getTelegramWebApp();
  return tg?.initData || null;
};

export const getWebAppUser = () => {
  if (!isTelegramWebApp()) return null;
  
  const tg = getTelegramWebApp();
  return tg?.initDataUnsafe?.user || null;
};

