#!/bin/bash

# Create directory if not exi

cat << 'EOF' > src/components/auth/AuthLayout.tsx
"use client"

import { ReactNode } from "react";
import Image from "next/image";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#F6EDFF]/30 dark:bg-[#252525] transition-colors duration-300">
      
      {/* SECTION 1: VISUALS (Static Brand Identity) */}
      <div className="flex-1 flex flex-col items-center justify-center p-10 relative overflow-hidden">
        {/* Background Blob */}
        <div className="absolute w-[500px] h-[500px] bg-purple-200/50 dark:bg-purple-900/20 rounded-full blur-3xl -z-10 animate-pulse" />

        {/* Bouncing Logo (Real SVG + High Energy Animation) */}
        <div className="relative w-32 h-32 md:w-48 md:h-48 mb-8 animate-bounce-active">
          <div className="w-full h-full bg-[#D364DB] rounded-[2rem] flex items-center justify-center shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.9)] transform rotate-3 overflow-hidden p-6">
             {/* Real Logo Image */}
             <div className="relative w-full h-full">
               <Image 
                 src="/abokiicon.svg" 
                 alt="Aboki Logo" 
                 fill 
                 className="object-contain"
               />
             </div>
          </div>
        </div>

        {/* Static Brand Header */}
        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white tracking-tighter uppercase z-10">
          ABOKI
        </h1>
      </div>

      {/* SECTION 2: ACTIONS (Dynamic Content) */}
      <div className="flex-1 bg-white dark:bg-[#3d3d3d] flex flex-col items-center justify-center p-8 md:p-16 rounded-t-[3rem] md:rounded-l-[3rem] md:rounded-tr-none shadow-[0_-10px_40px_rgba(0,0,0,0.05)] border-t border-l border-slate-100 dark:border-[#A3A3A3] min-h-[50vh] md:min-h-screen">
        <div className="w-full max-w-sm">
          {children}
        </div>
      </div>

      {/* Aggressive Bounce Animation */}
      <style jsx global>{`
        @keyframes active-bounce {
          0%, 100% { 
            transform: translateY(-20px) rotate(3deg); 
            animation-timing-function: cubic-bezier(0.8, 0, 1, 1); 
          }
          50% { 
            transform: translateY(0px) rotate(-3deg); 
            animation-timing-function: cubic-bezier(0, 0, 0.2, 1); 
          }
        }
        .animate-bounce-active {
          animation: active-bounce 1s infinite;
        }
      `}</style>
    </div>
  );
}
EOF

cat << 'EOF' > src/components/auth/PasskeySetup.tsx
"use client"

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FingerPrintIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import AuthLayout from "./AuthLayout";

export default function PasskeySetup() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCreatePasskey = () => {
    setLoading(true);
    // Simulate WebAuthn/Coinbase SDK delay
    setTimeout(() => {
      // Navigate to Home (Dashboard) after "success"
      router.push("/");
    }, 2000);
  };

  return (
    <AuthLayout>
      <div className="space-y-8">
        
        {/* Back Button */}
        <div className="-mt-12 md:-mt-0 mb-4">
          <Link href="/username" className="inline-block p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-[#404040] transition-colors">
            <ChevronLeftIcon className="w-6 h-6 text-slate-900 dark:text-white" />
          </Link>
        </div>

        <div className="space-y-2">
           <h2 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-wide">
             SET UP PASSKEY
           </h2>
           <p className="text-slate-500 dark:text-gray-400 font-medium">
             No passwords. Just use your face or fingerprint to secure your wallet.
           </p>
        </div>

        {/* Visual Icon Group */}
        <div className="flex justify-center py-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-[#252525] border-2 border-slate-200 dark:border-[#A3A3A3] flex items-center justify-center animate-pulse">
              <FingerPrintIcon className="w-12 h-12 text-slate-400 dark:text-gray-400" />
            </div>
            {/* Security Badge Overlay */}
            <div className="absolute -bottom-2 -right-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-2 rounded-full border border-white dark:border-[#3d3d3d] shadow-sm">
               <ShieldCheckIcon className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Main Action Button */}
        <button 
          onClick={handleCreatePasskey}
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-[#D364DB] text-white font-bold text-lg shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.9)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-wait"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Creating...
            </>
          ) : (
            "Create Passkey"
          )}
        </button>

        {/* Maybe Later */}
        <button 
          onClick={() => router.push("/")}
          className="w-full py-4 text-slate-400 dark:text-gray-500 font-bold hover:text-slate-600 dark:hover:text-gray-300 transition-colors"
        >
          Maybe later
        </button>

      </div>
    </AuthLayout>
  );
}
EOF
mkdir -p src/app/passkey
cat << 'EOF' > src/app/passkey/page.tsx
import PasskeySetup from "@/components/auth/PasskeySetup";
export default function Page() { return <PasskeySetup />; }
EOF
