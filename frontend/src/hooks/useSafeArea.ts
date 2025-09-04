import { useState, useEffect } from 'react';

interface SafeAreaInfo {
  isMobile: boolean;
  isIOS: boolean;
  isIPhone: boolean;
  hasNotch: boolean;
  safeAreaBottom: number;
  safeAreaTop: number;
}

export const useSafeArea = (): SafeAreaInfo => {
  const [safeAreaInfo, setSafeAreaInfo] = useState<SafeAreaInfo>({
    isMobile: false,
    isIOS: false,
    isIPhone: false,
    hasNotch: false,
    safeAreaBottom: 0,
    safeAreaTop: 0,
  });

  useEffect(() => {
    const detectDevice = () => {
      const userAgent = navigator.userAgent;
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const isIOS = /iPad|iPhone|iPod/.test(userAgent);
      const isIPhone = /iPhone/.test(userAgent);
      
      // Detect if device has notch (iPhone X and newer)
      const hasNotch = isIPhone && (
        window.screen.height >= 812 || // iPhone X, XS, 11 Pro, 12 mini, 13 mini
        window.screen.width >= 812 || // Landscape
        window.screen.height >= 844 || // iPhone 12, 13, 14
        window.screen.height >= 926    // iPhone 14 Plus, 15 Plus
      );

      // Get safe area values
      const safeAreaBottom = parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('--sat') || '0');
      const safeAreaTop = parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('--sat') || '0');

      setSafeAreaInfo({
        isMobile,
        isIOS,
        isIPhone,
        hasNotch,
        safeAreaBottom,
        safeAreaTop,
      });
    };

    detectDevice();
    window.addEventListener('resize', detectDevice);
    
    return () => {
      window.removeEventListener('resize', detectDevice);
    };
  }, []);

  return safeAreaInfo;
};
