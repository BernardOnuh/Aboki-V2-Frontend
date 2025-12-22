// ============= lib/pwa-utils.ts =============

export const PWAUtils = {
  /**
   * Check if the app is running as a PWA
   */
  isPWA(): boolean {
    if (typeof window === 'undefined') return false;
    
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://')
    );
  },

  /**
   * Check if the device is iOS
   */
  isIOS(): boolean {
    if (typeof window === 'undefined') return false;
    
    return /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
  },

  /**
   * Check if the device is Android
   */
  isAndroid(): boolean {
    if (typeof window === 'undefined') return false;
    
    return /android/.test(window.navigator.userAgent.toLowerCase());
  },

  /**
   * Check if PWA installation is supported
   */
  canInstallPWA(): boolean {
    if (typeof window === 'undefined') return false;
    
    // iOS Safari supports PWA but not the beforeinstallprompt event
    if (this.isIOS()) return true;
    
    // Other browsers support the beforeinstallprompt event
    return 'BeforeInstallPromptEvent' in window;
  },

  /**
   * Get the installation instructions based on device
   */
  getInstallInstructions(): string[] {
    if (this.isIOS()) {
      return [
        'Tap the Share button at the bottom of Safari',
        'Scroll down and tap "Add to Home Screen"',
        'Tap "Add" in the top right corner',
        'Open Aboki from your home screen'
      ];
    }
    
    if (this.isAndroid()) {
      return [
        'Tap the menu button (three dots)',
        'Select "Install app" or "Add to Home screen"',
        'Tap "Install" when prompted',
        'Open Aboki from your home screen'
      ];
    }
    
    return [
      'Look for the install icon in your browser\'s address bar',
      'Click "Install" when prompted',
      'Open Aboki from your desktop or taskbar'
    ];
  },

  /**
   * Open the app in PWA mode if possible
   */
  openInPWA(): void {
    if (this.isPWA()) return;
    
    const currentUrl = window.location.href;
    sessionStorage.setItem('aboki_return_url', currentUrl);
    
    // Try to trigger install on Android
    window.dispatchEvent(new Event('beforeinstallprompt'));
  },

  /**
   * Generate a PWA-friendly share link
   * Adds pwa=1 parameter to bypass middleware for sharing
   */
  generateShareLink(path: string): string {
    if (typeof window === 'undefined') return path;
    
    const url = new URL(path, window.location.origin);
    
    // If already in PWA, don't add the parameter
    if (this.isPWA()) {
      return url.toString();
    }
    
    // Add parameter to indicate this is a shared link
    url.searchParams.set('from', 'share');
    return url.toString();
  },

  /**
   * Open URL in PWA if installed, otherwise show install prompt
   */
  openLink(url: string): void {
    if (this.isPWA()) {
      window.location.href = url;
    } else {
      // Store URL and redirect to install page
      sessionStorage.setItem('aboki_return_url', url);
      window.location.href = `/install?redirect=${encodeURIComponent(new URL(url).pathname)}`;
    }
  },

  /**
   * Handle redirect after PWA installation
   */
  handlePostInstallRedirect(): void {
    if (!this.isPWA()) return;
    
    // Check for redirect parameter in URL
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect');
      
      if (redirect) {
        window.location.href = redirect;
        return;
      }
    }
    
    // Fallback to session storage
    const returnUrl = sessionStorage.getItem('aboki_return_url');
    if (returnUrl) {
      sessionStorage.removeItem('aboki_return_url');
      window.location.href = returnUrl;
    }
  }
};

// ============= hooks/usePWA.ts =============
import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePWA() {
  const [isPWA, setIsPWA] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Initial checks
    setIsPWA(PWAUtils.isPWA());
    setIsIOS(PWAUtils.isIOS());
    setIsAndroid(PWAUtils.isAndroid());

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };

    // Listen for successful installation
    const handleAppInstalled = () => {
      setIsPWA(true);
      setCanInstall(false);
      setDeferredPrompt(null);
      PWAUtils.handlePostInstallRedirect();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) {
      if (isIOS) {
        // Return instructions for iOS
        return { 
          success: false, 
          showInstructions: true,
          instructions: PWAUtils.getInstallInstructions()
        };
      }
      return { success: false, showInstructions: false };
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
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
    instructions: PWAUtils.getInstallInstructions()
  };
}