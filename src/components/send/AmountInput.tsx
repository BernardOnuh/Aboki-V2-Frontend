"use client"

import { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  ChevronLeftIcon, 
  ChevronUpIcon, 
  ChevronDownIcon,
  PencilSquareIcon 
} from "@heroicons/react/24/outline";

const MOCK_BALANCE = 7517.49;

// We wrap the main logic in a component to handle SearchParams safely
function AmountInputContent() {
  const searchParams = useSearchParams();
  // READ DATA: Get dynamic values or fallback to defaults
  const username = searchParams.get("username") || "@unknown";
  const avatar = searchParams.get("avatar") || "?";

  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const formatAmount = (val: string) => {
    if (!val) return "";
    return val.replace(/[^\d.]/g, "");
  };

  const isOverBalance = useMemo(() => {
    const val = parseFloat(amount || "0");
    return val > MOCK_BALANCE;
  }, [amount]);

  const adjustAmount = (delta: number) => {
    const current = parseFloat(amount || "0");
    const newValue = Math.max(0, current + delta).toFixed(0); 
    setAmount(newValue);
  };

  const handleQuickAdd = (val: string) => {
    setAmount(val);
  };

  return (
    <div className="w-full max-w-[1080px] mx-auto min-h-screen bg-[#F6EDFF]/50 dark:bg-slate-950 transition-colors duration-300 overflow-hidden flex flex-col">
      
      {/* Header */}
      <header className="px-6 py-6 relative flex items-center justify-center">
        <Link 
          href={searchParams.get("source") === "crypto" ? "/send/crypto" : "/send/contacts"} 
          className="absolute left-6 p-3 -ml-3 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors z-10"
        >
          <ChevronLeftIcon className="w-6 h-6 text-slate-900 dark:text-white" />
        </Link>
        
        {/* DYNAMIC RECIPIENT DISPLAY */}
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-5 py-2.5 rounded-full border-2 border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-sm font-bold text-purple-600">
              {avatar}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border-2 border-white dark:border-slate-900"></span>
            </span>
          </div>
          <div className="flex flex-col items-start leading-none">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Sending to</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">{username}</span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 -mt-10">
        
        <span className="text-slate-400 font-bold tracking-widest text-sm mb-6">
          USD AMOUNT
        </span>

        {/* Input Wrapper */}
        <div className="relative flex items-center justify-center gap-6 mb-2">
          <div className="flex items-center relative">
             <span className={`text-6xl md:text-8xl font-bold tracking-tighter transition-colors ${amount ? (isOverBalance ? 'text-red-500' : 'text-slate-900 dark:text-white') : 'text-slate-300 dark:text-slate-700'}`}>
                $
             </span>
             <input 
                type="number" 
                placeholder="0" 
                autoFocus
                value={amount}
                onChange={(e) => setAmount(formatAmount(e.target.value))}
                className={`w-full max-w-[300px] bg-transparent text-6xl md:text-8xl font-bold tracking-tighter text-center focus:outline-none focus:ring-0 p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-colors ${isOverBalance ? 'text-red-500' : 'text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700'}`}
             />
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={() => adjustAmount(1)}
              className="w-12 h-12 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 flex items-center justify-center hover:border-[#D364DB] active:scale-95 transition-all shadow-sm group"
            >
              <ChevronUpIcon className="w-6 h-6 text-slate-400 group-hover:text-[#D364DB]" />
            </button>
            <button 
              onClick={() => adjustAmount(-1)}
              className="w-12 h-12 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 flex items-center justify-center hover:border-[#D364DB] active:scale-95 transition-all shadow-sm group"
            >
              <ChevronDownIcon className="w-6 h-6 text-slate-400 group-hover:text-[#D364DB]" />
            </button>
          </div>
        </div>

        <div className="h-8 flex flex-col items-center justify-center">
          {isOverBalance ? (
            <span className="text-red-500 font-bold animate-pulse">
              Exceeds balance ($7,517.49)
            </span>
          ) : (
            <p className="text-slate-500 font-medium">
              Balance: $7,517.49
            </p>
          )}
        </div>

        <div className="flex gap-3 mt-8">
          {["5", "10", "50"].map((val) => (
            <button 
              key={val}
              onClick={() => handleQuickAdd(val)}
              className="px-5 py-2.5 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 font-bold text-slate-600 dark:text-slate-300 hover:border-[#D364DB] hover:text-[#D364DB] transition-all shadow-sm"
            >
              ${val}
            </button>
          ))}
          <button 
            onClick={() => handleQuickAdd(MOCK_BALANCE.toString())}
            className="px-5 py-2.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-[#D364DB] font-bold border-2 border-transparent hover:border-[#D364DB] transition-all"
          >
            Max
          </button>
        </div>

        <div className="w-full max-w-xs mt-8 relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <PencilSquareIcon className="h-5 w-5 text-slate-400" />
          </div>
          <input 
            type="text" 
            placeholder="Add a note (optional)" 
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-slate-900/50 border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:border-[#D364DB] dark:focus:border-[#D364DB] rounded-xl text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-900 transition-all text-center"
          />
        </div>

      </div>

      <div className="p-6">
        {/* Pass data to next screen too! */}
        <Link 
          href={!amount || isOverBalance ? "#" : `/send/review?username=${username}&amount=${amount}&note=${note}`}
        >
          <button 
            disabled={!amount || isOverBalance}
            className="w-full py-4 rounded-2xl bg-[#D364DB] text-white font-bold text-lg shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.8)] hover:-translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-y-0 active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
          >
            Review Payment
          </button>
        </Link>
      </div>

    </div>
  );
}

// Wrap in Suspense to prevent Next.js build errors with useSearchParams
export default function AmountInput() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <AmountInputContent />
    </Suspense>
  );
}
