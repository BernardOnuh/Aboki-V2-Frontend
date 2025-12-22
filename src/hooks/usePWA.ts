// ============= hooks/usePWA.ts =============
"use client"

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface InstallResult {
  success: boolean;
  showInstructions: boolean;
  instructions?: string[];
}

export function usePWA() {
  const [isPWA, setIsPWA] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [instructions, setInstructions] = useState<string[]>([]);

  // Utility functions
  const checkIsPWA = (): boolean => {
    if (typeof window === 'undefined') return false;
    
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://')
    );
  };

  const checkIsIOS = (): boolean => {
    if (typeof window === 'undefined') return false;
    return /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
  };

  const checkIsAndroid = (): boolean => {
    if (typeof window === 'undefined') return false;
    return /android/.test(window.navigator.userAgent.toLowerCase());
  };

  const getInstallInstructions = (ios: boolean, android: boolean): string[] => {
    if (ios) {
      return [
        'Tap the Share button (square with arrow) at the bottom of Safari',
        'Scroll down and tap "Add to Home Screen"',
        'Tap "Add" in the top right corner',
        'Open Aboki from your home screen'
      ];
    }
    
    if (android) {
      return [
        'Tap the menu button (three dots) in the top right',
        'Select "Install app" or "Add to Home screen"',
        'Tap "Install" when prompted',
        'Open Aboki from your home screen or app drawer'
      ];
    }
    
    return [
      'Look for the install icon in your browser\'s address bar',
      'Click "Install" when prompted',
      'The app will be added to your desktop or taskbar',
      'Open Aboki from your installed applications'
    ];
  };

  const handlePostInstallRedirect = (): void => {
    if (!checkIsPWA()) return;
    
    // Check for redirect parameter in URL
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect');
    
    if (redirect) {
      window.location.href = redirect;
      return;
    }
    
    // Fallback to session storage
    const returnUrl = sessionStorage.getItem('aboki_return_url');
    if (returnUrl) {
      sessionStorage.removeItem('aboki_return_url');
      window.location.href = returnUrl;
    }
  };

  useEffect(() => {
    // Initial checks
    const pwaStatus = checkIsPWA();
    const iosStatus = checkIsIOS();
    const androidStatus = checkIsAndroid();
    
    setIsPWA(pwaStatus);
    setIsIOS(iosStatus);
    setIsAndroid(androidStatus);
    setInstructions(getInstallInstructions(iosStatus, androidStatus));

    // Listen for install prompt (Android/Desktop)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      console.log('📱 Install prompt available');
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };

    // Listen for successful installation
    const handleAppInstalled = () => {
      console.log('✅ PWA installed successfully');
      setIsPWA(true);
      setCanInstall(false);
      setDeferredPrompt(null);
      handlePostInstallRedirect();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async (): Promise<InstallResult> => {
    if (!deferredPrompt) {
      if (isIOS) {
        // Return instructions for iOS
        return { 
          success: false, 
          showInstructions: true,
          instructions
        };
      }
      return { success: false, showInstructions: false };
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log(`User ${outcome} the install prompt`);
      
      setDeferredPrompt(null);
      setCanInstall(false);
      
      if (outcome === 'accepted') {
        setIsPWA(true);
        return { success: true, showInstructions: false };
      }
      
      return { success: false, showInstructions: false };
    } catch (error) {
      console.error('Install error:', error);
      return { success: false, showInstructions: false };
    }
  };

  return {
    isPWA,
    isIOS,
    isAndroid,
    canInstall,
    install,
    instructions
  };
}