// ============= components/PWAGate.tsx =============
"use client"

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowDownTrayIcon, DevicePhoneMobileIcon } from "@heroicons/react/24/outline";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAGate({ children }: { children: React.ReactNode }) {
  const [isPWA, setIsPWA] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Check if running as PWA
    const checkPWA = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                          (window.navigator as any).standalone ||
                          document.referrer.includes('android-app://');
      
      console.log('🔍 PWA Check:', {
        isStandalone,
        displayMode: window.matchMedia('(display-mode: standalone)').matches,
        standalone: (window.navigator as any).standalone,
        referrer: document.referrer
      });

      return isStandalone;
    };

    // Detect device type
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iOS = /iphone|ipad|ipod/.test(userAgent);
    const android = /android/.test(userAgent);
    
    setIsIOS(iOS);
    setIsAndroid(android);
    setIsPWA(checkPWA());

    // Listen for PWA install prompt (Android/Desktop)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      console.log('📱 Install prompt available');
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for successful PWA installation
    window.addEventListener('appinstalled', () => {
      console.log('✅ PWA installed successfully');
      setIsPWA(true);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // If no prompt available (iOS), show instructions
      if (isIOS) {
        setShowIOSInstructions(true);
      } else {
        alert('Installation not available. Please use Chrome, Edge, or Safari.');
      }
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log(`User ${outcome} the install prompt`);
      
      if (outcome === 'accepted') {
        setIsPWA(true);
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Install error:', error);
    }
  };

  // If already installed as PWA, show content
  if (isPWA) {
    return <>{children}</>;
  }

  // Allow access to /install page even without PWA
  if (typeof window !== 'undefined' && window.location.pathname === '/install') {
    return <>{children}</>;
  }

  // Show install gate
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6EDFF] via-[#E8D5FF] to-[#D9C4FF] dark:from-[#1a1a1a] dark:via-[#252525] dark:to-[#2d2d2d] flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="relative h-20 w-56 mx-auto mb-6">
            <Image 
              src="/LogoLight.svg" 
              alt="Aboki" 
              fill 
              className="object-contain dark:hidden" 
              priority 
            />
            <Image 
              src="/LogoDark.svg" 
              alt="Aboki" 
              fill 
              className="object-contain hidden dark:block" 
              priority 
            />
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white/90 dark:bg-[#2d2d2d]/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-purple-200/50 dark:border-purple-900/20">
          
          {/* Icon */}
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-[#D364DB] to-[#C554CB] rounded-3xl flex items-center justify-center shadow-xl animate-bounce-slow">
            <DevicePhoneMobileIcon className="w-12 h-12 text-white" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-black text-gray-900 dark:text-white text-center mb-3">
            Install Aboki App
          </h1>
          
          {/* Description */}
          <p className="text-gray-600 dark:text-purple-100/80 text-center mb-8 leading-relaxed">
            For the best experience and enhanced security, Aboki must be installed as an app on your device.
          </p>

          {/* iOS Instructions Modal */}
          {showIOSInstructions && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6 animate-fade-in">
              <div className="bg-white dark:bg-[#2d2d2d] rounded-3xl p-8 max-w-sm w-full shadow-2xl">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Install on iOS
                </h3>
                <ol className="space-y-3 text-sm text-gray-600 dark:text-purple-100/80">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#D364DB] text-white flex items-center justify-center text-xs font-bold">1</span>
                    <span>Tap the <strong>Share</strong> button at the bottom of Safari</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#D364DB] text-white flex items-center justify-center text-xs font-bold">2</span>
                    <span>Scroll down and tap <strong>"Add to Home Screen"</strong></span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#D364DB] text-white flex items-center justify-center text-xs font-bold">3</span>
                    <span>Tap <strong>"Add"</strong> in the top right corner</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#D364DB] text-white flex items-center justify-center text-xs font-bold">4</span>
                    <span>Open Aboki from your home screen</span>
                  </li>
                </ol>
                <button
                  onClick={() => setShowIOSInstructions(false)}
                  className="w-full mt-6 py-3 bg-[#D364DB] hover:bg-[#C554CB] text-white font-bold rounded-2xl transition-all"
                >
                  Got it!
                </button>
              </div>
            </div>
          )}

          {/* Install Button */}
          <button
            onClick={handleInstallClick}
            className="w-full py-4 bg-gradient-to-r from-[#D364DB] to-[#C554CB] hover:from-[#C554CB] hover:to-[#B544BB] text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <ArrowDownTrayIcon className="w-6 h-6" />
            {isIOS ? 'View Install Instructions' : 'Install Aboki'}
          </button>

          {/* Features */}
          <div className="mt-8 space-y-3">
            <div className="flex items-start gap-3 text-sm">
              <span className="text-green-500 text-lg flex-shrink-0">✓</span>
              <span className="text-gray-600 dark:text-purple-100/80">Faster, smoother experience</span>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <span className="text-green-500 text-lg flex-shrink-0">✓</span>
              <span className="text-gray-600 dark:text-purple-100/80">Works offline with cached data</span>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <span className="text-green-500 text-lg flex-shrink-0">✓</span>
              <span className="text-gray-600 dark:text-purple-100/80">Enhanced security & biometric access</span>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <span className="text-green-500 text-lg flex-shrink-0">✓</span>
              <span className="text-gray-600 dark:text-purple-100/80">Push notifications for transactions</span>
            </div>
          </div>

          {/* Browser Info */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-200 dark:border-blue-500/20">
            <p className="text-xs text-gray-600 dark:text-purple-100/80 text-center">
              <strong className="font-bold text-gray-900 dark:text-white">
                {isIOS ? '📱 iOS User?' : isAndroid ? '🤖 Android User?' : '💻 Desktop User?'}
              </strong>
              <br />
              {isIOS && 'Use Safari to install as an app'}
              {isAndroid && 'Chrome will show an install prompt'}
              {!isIOS && !isAndroid && 'Use Chrome, Edge, or Safari for best experience'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs text-center text-gray-500 dark:text-purple-100/40 mt-6">
          🔒 Your security is our priority
        </p>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}