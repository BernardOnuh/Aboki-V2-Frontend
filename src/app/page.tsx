"use client"

import Image from "next/image";
import { useTheme } from "next-themes";
import BalanceCard from "@/components/dashboard/BalanceCard";
import ActionGrid from "@/components/dashboard/ActionGrid";
import RecentActivity from "@/components/dashboard/RecentActivity";
import ScanSection from "@/components/dashboard/ScanSection";
import { BellIcon, MoonIcon, SunIcon, StarIcon } from "@heroicons/react/24/outline";

export default function Dashboard() {
  const { setTheme, theme } = useTheme();

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 transition-colors duration-500">
      
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5 sticky top-0 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md z-20">
        
        {/* Logo */}
        <div className="relative h-6 w-24">
          <Image 
            src="/Logo lockup.svg" 
            alt="Aboki Logo" 
            fill 
            className="object-contain object-left dark:invert" 
            priority
          />
        </div>
        
        <div className="flex items-center gap-4">
          {/* Points */}
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-400/10 rounded-full text-yellow-600 dark:text-yellow-400 hover:bg-yellow-400/20 transition">
            <StarIcon className="w-4 h-4" />
            <span className="text-xs font-bold">120 pts</span>
          </button>

          {/* Theme Toggle - Fixed Animation & Alignment */}
          <button 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="relative w-9 h-9 flex items-center justify-center rounded-full text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <SunIcon className="w-5 h-5 absolute transition-all duration-300 rotate-0 scale-100 dark:-rotate-90 dark:scale-0" />
            <MoonIcon className="w-5 h-5 absolute transition-all duration-300 rotate-90 scale-0 dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </button>

          {/* Notifications */}
          <button className="relative w-9 h-9 flex items-center justify-center rounded-full text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <BellIcon className="w-6 h-6" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-slate-50 dark:ring-slate-950" />
          </button>
        </div>
      </header>

      {/* Body Content */}
      <div className="px-6 mt-6 flex flex-col gap-6">
        <div className="space-y-4">
          <BalanceCard />
          <ScanSection />
        </div>

        <ActionGrid />
        <RecentActivity />
      </div>
    </main>
  );
}