"use client" // Needed for state

import { useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { Card, CardContent } from "@/components/ui/card";

export default function BalanceCard() {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <Card className="bg-black text-white rounded-[2rem] border-0 shadow-2xl relative overflow-hidden">
      {/* Decorative gradient blur */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600 rounded-full blur-[100px] opacity-20 -mr-16 -mt-16 pointer-events-none"></div>

      <CardContent className="p-8 flex flex-col items-center justify-center min-h-[220px]">
        
        {/* Username pill */}
        <div className="bg-gray-800/50 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-medium text-gray-300 mb-6 flex items-center gap-2">
           @jadonamite
        </div>

        {/* Balance Section */}
        <div className="text-center">
          <p className="text-gray-400 text-sm font-medium mb-2">Total Balance</p>
          <div className="flex items-center justify-center gap-3">
             <h1 className="text-5xl sm:text-6xl font-bold tracking-tighter">
               {isVisible ? "$ 7, 517. 49" : "$ *******"}
             </h1>
             
             <button 
               onClick={() => setIsVisible(!isVisible)}
               className="text-gray-500 hover:text-white transition p-2"
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