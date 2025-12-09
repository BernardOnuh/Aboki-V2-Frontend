
"use client"

import { useState } from "react";
import Link from "next/link";
import { ChevronLeftIcon, LinkIcon, SparklesIcon } from "@heroicons/react/24/outline";

export default function CreateLink() {
  const [amount, setAmount] = useState("");

  const formatAmount = (val: string) => {
    if (!val) return "";
    return val.replace(/[^\d.]/g, "");
  };

  return (
    <div className="w-full max-w-[1080px] mx-auto min-h-screen bg-[#F6EDFF]/50 dark:bg-[#252525] transition-colors duration-300 overflow-hidden flex flex-col">
      
      <header className="px-6 py-6 flex items-center gap-4">
        <Link href="/send" className="p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
          <ChevronLeftIcon className="w-6 h-6 text-slate-900 dark:text-white" />
        </Link>
        <h1 className="font-bold text-xl text-slate-900 dark:text-white">
          Create Money Link
        </h1>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 -mt-10">
        
        {/* Magic Icon */}
        <div className="w-16 h-16 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center mb-6 animate-bounce">
            <LinkIcon className="w-8 h-8 text-pink-500" />
        </div>

        <span className="text-slate-400 font-bold tracking-widest text-sm mb-6 uppercase">
          Amount to Wrap
        </span>

        {/* Input */}
        <div className="flex items-center justify-center relative">
           <span className={`text-6xl font-bold tracking-tighter ${amount ? 'text-slate-900 dark:text-white' : 'text-slate-300'}`}>$</span>
           <input 
              type="number" 
              placeholder="0" 
              autoFocus
              value={amount}
              onChange={(e) => setAmount(formatAmount(e.target.value))}
              className="w-full max-w-[300px] bg-transparent text-6xl font-bold tracking-tighter text-slate-900 dark:text-white placeholder:text-slate-300 text-center focus:outline-none focus:ring-0 p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
           />
        </div>

        <p className="mt-4 text-slate-500 font-medium text-center max-w-xs">
          Anyone with the link can claim this money instantly.
        </p>
      </div>

      <div className="p-6">
        {/* For now, this just goes to Review, but passing a 'link' flag */}
        <Link href={amount ? `/send/review?username=Magic Link&amount=${amount}&avatar=LK` : "#"}>
          <button 
            disabled={!amount}
            className="w-full py-4 rounded-2xl bg-pink-500 text-white font-bold text-lg shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.8)] hover:-translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:transform-none disabled:shadow-none"
          >
            <SparklesIcon className="w-5 h-5" />
            Create Link
          </button>
        </Link>
      </div>
    </div>
  );
}