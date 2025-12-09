"use client"

import { useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { Card, CardContent } from "@/components/ui/card";

export default function BalanceCard() {
  const [isVisible, setIsVisible] = useState(true);

  return (
    // Removed bg-black, added transparent/adaptive text
    <Card className="bg-transparent border-0 shadow-none">
      <CardContent className="p-8 flex flex-col items-center justify-center min-h-[180px]">
        
        {/* Username pill - Adapted for contrast */}
        <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-medium text-slate-600 dark:text-slate-300 mb-6 flex items-center gap-2 border border-slate-200 dark:border-[#A3A3A3]">
           @jadonamite
        </div>

        {/* Balance Section */}
        <div className="text-center">
          <p className="text-slate-500 dark:text-gray-300 text-sm font-medium mb-2">Total Balance</p>
          <div className="flex items-center justify-center gap-3">
             <h1 className="text-5xl sm:text-6xl font-bold tracking-tighter text-slate-900 dark:text-white">
               {isVisible ? "$ 7, 517.49" : "$*******"}
             </h1>
             
             <button 
               onClick={() => setIsVisible(!isVisible)}
               className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition p-2"
             >
                {isVisible ? (
                  <EyeIcon className="w-6 h-6" />
                ) : (
                  <EyeSlashIcon className="w-6 h-6" />
                )}
             </button>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
