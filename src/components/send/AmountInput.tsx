
"use client"

import { useState } from "react";
import Link from "next/link";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";

export default function AmountInput() {
  const [amount, setAmount] = useState("");

  // Helper to format display (e.g. 5000 -> 5,000)
  const formatAmount = (val: string) => {
    if (!val) return "";
    // Remove non-digits
    const clean = val.replace(/[^\d.]/g, "");
    return clean;
  };

  const handleQuickAdd = (val: string) => {
    setAmount(val);
  };

  return (
    <div className="w-full max-w-[1080px] mx-auto min-h-screen bg-[#F6EDFF]/50 dark:bg-slate-950 transition-colors duration-300 overflow-hidden flex flex-col">
      
      {/* Header */}
      <header className="px-6 py-6 flex items-center justify-between">
        <Link href="/send/contacts" className="p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
          <ChevronLeftIcon className="w-6 h-6 text-slate-900 dark:text-white" />
        </Link>
        
        {/* Recipient Pill */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800">
          <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center text-[10px] font-bold text-purple-600">
            E
          </div>
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            @emeka
          </span>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 -mt-20">
        
        {/* Currency Label */}
        <span className="text-slate-400 font-bold tracking-widest text-sm mb-4">
          USD AMOUNT
        </span>

        {/* Massive Input Area */}
        <div className="relative flex items-center justify-center w-full">
          <span className={`text-6xl md:text-8xl font-bold tracking-tighter transition-colors ${amount ? 'text-slate-900 dark:text-white' : 'text-slate-300 dark:text-slate-700'}`}>
            $
          </span>
          <input 
            type="number" 
            placeholder="0" 
            autoFocus
            value={amount}
            onChange={(e) => setAmount(formatAmount(e.target.value))}
            className="w-full max-w-[300px] bg-transparent text-6xl md:text-8xl font-bold tracking-tighter text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700 text-center focus:outline-none focus:ring-0 p-0"
          />
        </div>

        {/* Balance Context */}
        <p className="mt-4 text-slate-500 font-medium">
          Balance: $7,517.49
        </p>

        {/* Quick Actions */}
        <div className="flex gap-3 mt-8">
          {["10", "50", "100"].map((val) => (
            <button 
              key={val}
              onClick={() => handleQuickAdd(val)}
              className="px-4 py-2 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 font-bold text-slate-600 dark:text-slate-300 hover:border-[#D364DB] transition-all"
            >
              ${val}
            </button>
          ))}
          <button 
            onClick={() => handleQuickAdd("7517.49")}
            className="px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-[#D364DB] font-bold border-2 border-transparent hover:border-[#D364DB] transition-all"
          >
            Max
          </button>
        </div>

      </div>

      {/* Review Button Area */}
      <div className="p-6">
        <Link href="/send/review">
          <button 
            disabled={!amount}
            className="w-full py-4 rounded-2xl bg-[#D364DB] text-white font-bold text-lg shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.8)] hover:-translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-y-0 active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
          >
            Review Payment
          </button>
        </Link>
      </div>

    </div>
  );
}
