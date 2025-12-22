// ============= app/install/page.tsx =============
"use client"

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowDownTrayIcon, DevicePhoneMobileIcon, CheckCircleIcon, ShieldCheckIcon, BoltIcon, WifiIcon } from "@heroicons/react/24/outline";
import { usePWA } from "@/hooks/usePWA";

export default function InstallPage() {
  const router = useRouter();
  const { isPWA, isIOS, isAndroid, canInstall, install, instructions } = usePWA();
  const [installing, setInstalling] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  // Get redirect path from URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect');
      if (redirect) {
        setRedirectPath(redirect);
      }
    }
  }, []);

  // Redirect if already in PWA mode
  useEffect(() => {
    if (isPWA) {
      // Redirect to the original path or home
      const destination = redirectPath || '/';
      router.push(destination);
    }
  }, [isPWA, router, redirectPath]);

  const handleInstall = async () => {
    setInstalling(true);
    
    try {
      const result = await install();
      
      if (result.showInstructions) {
        setShowInstructions(true);
      } else if (result.success) {
        // Will be redirected by PWA detection
        const destination = redirectPath || '/';
        setTimeout(() => router.push(destination), 2000);
      }
    } catch (error) {
      console.error('Install error:', error);
    } finally {
      setInstalling(false);
    }
  };

  if (isPWA) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6EDFF] via-[#E8D5FF] to-[#D9C4FF] dark:from-[#1a1a1a] dark:via-[#252525] dark:to-[#2d2d2d] flex items-center justify-center p-6">
      <div className="max-w-5xl w-full">
        
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="relative h-24 w-64 mx-auto mb-8">
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
          
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
            Experience Aboki as an App
          </h1>
          
          <p className="text-lg text-gray-600 dark:text-purple-100/80 max-w-2xl mx-auto leading-relaxed">
            Get the full Aboki experience with enhanced security, offline access, and native app performance. Install now for the best crypto wallet experience.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Feature 1 */}
          <div className="bg-white/90 dark:bg-[#2d2d2d]/90 backdrop-blur-xl rounded-3xl p-8 border border-purple-200/50 dark:border-purple-900/20 shadow-xl">
            <div className="w-16 h-16 bg-gradient-to-br from-[#D364DB] to-[#C554CB] rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <ShieldCheckIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Enhanced Security
            </h3>
            <p className="text-gray-600 dark:text-purple-100/80 leading-relaxed">
              Biometric authentication, secure passkey storage, and isolated app environment for maximum protection of your crypto assets.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white/90 dark:bg-[#2d2d2d]/90 backdrop-blur-xl rounded-3xl p-8 border border-purple-200/50 dark:border-purple-900/20 shadow-xl">
            <div className="w-16 h-16 bg-gradient-to-br from-[#D364DB] to-[#C554CB] rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <BoltIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Lightning Fast
            </h3>
            <p className="text-gray-600 dark:text-purple-100/80 leading-relaxed">
              Native app performance with instant loading, smooth animations, and optimized resource usage for a seamless experience.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white/90 dark:bg-[#2d2d2d]/90 backdrop-blur-xl rounded-3xl p-8 border border-purple-200/50 dark:border-purple-900/20 shadow-xl">
            <div className="w-16 h-16 bg-gradient-to-br from-[#D364DB] to-[#C554CB] rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <WifiIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Works Offline
            </h3>
            <p className="text-gray-600 dark:text-purple-100/80 leading-relaxed">
              Access your wallet, view balances, and check transaction history even without an internet connection. Syncs when you're back online.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white/90 dark:bg-[#2d2d2d]/90 backdrop-blur-xl rounded-3xl p-8 border border-purple-200/50 dark:border-purple-900/20 shadow-xl">
            <div className="w-16 h-16 bg-gradient-to-br from-[#D364DB] to-[#C554CB] rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <DevicePhoneMobileIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Native Experience
            </h3>
            <p className="text-gray-600 dark:text-purple-100/80 leading-relaxed">
              Push notifications, home screen access, full-screen mode, and seamless integration with your device's OS features.
            </p>
          </div>
        </div>

        {/* Install CTA */}
        <div className="bg-white/90 dark:bg-[#2d2d2d]/90 backdrop-blur-xl rounded-3xl p-10 border border-purple-200/50 dark:border-purple-900/20 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#D364DB] to-[#C554CB] rounded-full flex items-center justify-center shadow-xl animate-bounce-slow">
              <ArrowDownTrayIcon className="w-10 h-10 text-white" />
            </div>
            
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">
              Ready to Install?
            </h2>
            
            <p className="text-gray-600 dark:text-purple-100/80 mb-8 max-w-md mx-auto">
              {isIOS && "Tap the button below for step-by-step installation instructions on iOS."}
              {isAndroid && "Tap the button below to install Aboki on your Android device."}
              {!isIOS && !isAndroid && "Click the button below to install Aboki on your device."}
            </p>

            <button
              onClick={handleInstall}
              disabled={installing}
              className="px-12 py-5 bg-gradient-to-r from-[#D364DB] to-[#C554CB] hover:from-[#C554CB] hover:to-[#B544BB] text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto"
            >
              {installing ? (
                <>
                  <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Installing...
                </>
              ) : (
                <>
                  <ArrowDownTrayIcon className="w-6 h-6" />
                  {isIOS ? 'View Install Guide' : 'Install Aboki Now'}
                </>
              )}
            </button>
          </div>

          {/* Install Instructions Modal */}
          {showInstructions && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6 animate-fade-in" onClick={() => setShowInstructions(false)}>
              <div className="bg-white dark:bg-[#2d2d2d] rounded-3xl p-10 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#D364DB] to-[#C554CB] rounded-full flex items-center justify-center">
                    <DevicePhoneMobileIcon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {isIOS ? 'Install on iOS' : isAndroid ? 'Install on Android' : 'Install Aboki'}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-purple-100/60">
                    Follow these simple steps
                  </p>
                </div>

                <ol className="space-y-4 mb-8">
                  {instructions.map((step: string, index: number) => (
                    <li key={index} className="flex gap-4">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#D364DB] to-[#C554CB] text-white flex items-center justify-center text-sm font-bold shadow-lg">
                        {index + 1}
                      </span>
                      <span className="text-gray-700 dark:text-purple-100/90 pt-1">
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>

                <button
                  onClick={() => setShowInstructions(false)}
                  className="w-full py-4 bg-gradient-to-r from-[#D364DB] to-[#C554CB] hover:from-[#C554CB] hover:to-[#B544BB] text-white font-bold rounded-2xl transition-all hover:scale-105 active:scale-95"
                >
                  Got it!
                </button>
              </div>
            </div>
          )}

          {/* Browser compatibility note */}
          <div className="mt-8 pt-8 border-t border-purple-200/50 dark:border-purple-900/20">
            <p className="text-xs text-center text-gray-500 dark:text-purple-100/40">
              {isIOS && '📱 Use Safari on iOS to install Aboki as an app'}
              {isAndroid && '🤖 Use Chrome, Edge, or Samsung Internet on Android'}
              {!isIOS && !isAndroid && '💻 Use Chrome, Edge, or Safari for the best experience'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-600 dark:text-purple-100/60 mb-4">
            Already installed? <button onClick={() => router.push('/')} className="text-[#D364DB] dark:text-purple-400 font-bold hover:underline">Open Aboki</button>
          </p>
          <p className="text-xs text-gray-500 dark:text-purple-100/40">
            🔒 Secured with military-grade encryption
          </p>
        </div>
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