"use client"

import { ReactNode } from "react";

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

        {/* Bouncing Logo */}
        <div className="relative w-32 h-32 md:w-48 md:h-48 mb-8 animate-bounce-custom">
          <div className="w-full h-full bg-[#D364DB] rounded-[2rem] flex items-center justify-center shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.9)] transform rotate-3">
             <span className="text-white font-bold text-5xl md:text-7xl">ab</span>
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
    </div>
  );
}
