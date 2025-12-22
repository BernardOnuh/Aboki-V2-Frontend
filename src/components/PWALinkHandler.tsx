// ============= components/PWALinkHandler.tsx =============
"use client"

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ArrowDownTrayIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function PWALinkHandler() {
  const router = useRouter();
  const pathname = usePathname();
  const [showBanner, setShowBanner] = useState(false);
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    // Check if running as PWA
    const checkPWA = () => {
      return window.matchMedia('(display-mode: standalone)').matches ||
             (window.navigator as any).standalone ||
             document.referrer.includes('android-app://');
    };

    const pwaStatus = checkPWA();
    setIsPWA(pwaStatus);

    // If not PWA and on a deep link (not home or install), show banner
    if (!pwaStatus && pathname !== '/' && pathname !== '/install' && pathname !== '/auth') {
      // Store the current path for after install
      sessionStorage.setItem('aboki_return_url', window.location.href);
      
      // Show banner for a few seconds before redirecting
      setShowBanner(true);
      
      // Auto-redirect after 5 seconds
      const timer = setTimeout(() => {
        router.push(`/install?redirect=${encodeURIComponent(pathname)}`);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [pathname, router]);

  const handleInstallNow = () => {
    router.push(`/install?redirect=${encodeURIComponent(pathname)}`);
  };

  const handleOpenInBrowser = () => {
    // Add PWA parameter to URL to bypass middleware
    const url = new URL(window.location.href);
    url.searchParams.set('pwa', 'bypass');
    window.location.href = url.toString();
    setShowBanner(false);
  };

  if (isPWA || !showBanner) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 animate-slide-down">
      <div className="bg-gradient-to-r from-[#D364DB] to-[#C554CB] text-white shadow-2xl">
        <div className="max-w-[1080px] mx-auto p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <ArrowDownTrayIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm">Install Aboki App</p>
                  <p className="text-xs text-white/80">For better security and experience</p>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setShowBanner(false)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors flex-shrink-0"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="flex gap-2 mt-3">
            <button
              onClick={handleInstallNow}
              className="flex-1 py-2.5 bg-white text-[#D364DB] font-bold rounded-xl hover:bg-white/90 transition-all text-sm"
            >
              Install Now
            </button>
            <button
              onClick={handleOpenInBrowser}
              className="flex-1 py-2.5 bg-white/10 backdrop-blur-sm font-bold rounded-xl hover:bg-white/20 transition-all text-sm"
            >
              Continue in Browser
            </button>
          </div>
          
          <p className="text-xs text-white/60 text-center mt-3">
            Redirecting to install page in 5 seconds...
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-down {
          from {
            transform: translateY(-100%);
          }
          to {
            transform: translateY(0);
          }
        }

        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}