"use client"

import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

export default function Onboarding() {
  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#F6EDFF]/30 dark:bg-[#252525] transition-colors duration-300">
      
      {/* SECTION 1: VISUALS (Top on Mobile, Left on Desktop) */}
      <div className="flex-1 flex flex-col items-center justify-center p-10 relative overflow-hidden">
        
        {/* Background Blob for aesthetics */}
        <div className="absolute w-[500px] h-[500px] bg-purple-200/50 dark:bg-purple-900/20 rounded-full blur-3xl -z-10 animate-pulse" />

        {/* Bouncing Logo Animation */}
        <div className="relative w-32 h-32 md:w-48 md:h-48 mb-8 animate-bounce-custom">
          {/* Using the icon directly since we don't have the SVG file logic handy, 
              but assuming you have the file. Replacing with a placeholder structure if needed. */}
          <div className="w-full h-full bg-[#D364DB] rounded-[2rem] flex items-center justify-center shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.9)] transform rotate-3">
             {/* If you have the image, use <Image /> here. Using text/icon placeholder for demo */}
             <span className="text-white font-bold text-5xl md:text-7xl">ab</span>
          </div>
        </div>

        {/* Text Header */}
        <div className="text-center space-y-3 z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
            Aboki V2
          </h1>
          <p className="text-slate-500 dark:text-gray-400 text-lg md:text-xl font-medium max-w-xs mx-auto">
            Crypto without the headache.
            <br />
            Send, Receive, and Spend.
          </p>
        </div>
      </div>

      {/* SECTION 2: ACTIONS (Bottom on Mobile, Right on Desktop) */}
      <div className="flex-1 bg-white dark:bg-[#3d3d3d] flex flex-col items-center justify-center p-8 md:p-16 rounded-t-[3rem] md:rounded-l-[3rem] md:rounded-tr-none shadow-[0_-10px_40px_rgba(0,0,0,0.05)] border-t border-l border-slate-100 dark:border-[#A3A3A3]">
        
        <div className="w-full max-w-sm space-y-8">
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Get Started
            </h2>
            <p className="text-slate-400 text-sm">
              Create a smart wallet in seconds. No seed phrases.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            
            {/* SIGN UP (Primary Brand Color) */}
            <button className="w-full py-5 rounded-2xl bg-[#D364DB] text-white font-bold text-lg shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.9)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] transition-all flex items-center justify-center gap-2 group">
              Create Account
              <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* LOGIN (Secondary) */}
            <button className="w-full py-5 rounded-2xl bg-white dark:bg-[#252525] text-slate-900 dark:text-white border-2 border-slate-900 dark:border-white font-bold text-lg shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.9)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] transition-all">
              I have an account
            </button>

          </div>

          {/* Footer / Terms */}
          <p className="text-center text-xs text-slate-400 mt-8">
            By continuing, you agree to our <span className="underline cursor-pointer hover:text-purple-500">Terms</span> & <span className="underline cursor-pointer hover:text-purple-500">Privacy Policy</span>.
          </p>
        </div>

      </div>

      {/* Custom Keyframes for that "Cool Bouncing" feel */}
      <style jsx global>{`
        @keyframes custom-bounce {
          0%, 100% { transform: translateY(-5%) rotate(3deg); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); }
          50% { transform: translateY(5%) rotate(-3deg); animation-timing-function: cubic-bezier(0, 0, 0.2, 1); }
        }
        .animate-bounce-custom {
          animation: custom-bounce 3s infinite;
        }
      `}</style>
    </div>
  );
}
