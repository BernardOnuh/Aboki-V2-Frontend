"use client"

import { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeftIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

const MOCK_BALANCE_USD = 7517.49;
const EXCHANGE_RATE = 1450; 

function BankAmountContent() {
  const searchParams = useSearchParams();
  const username = searchParams.get("username") || "Unknown Bank";
  const avatar = searchParams.get("avatar") || "BK";
  
  const [ngnAmount, setNgnAmount] = useState("");
  const displayNgn = ngnAmount ? parseInt(ngnAmount).toLocaleString() : "";

  const usdEquivalent = useMemo(() => {
    const val = parseFloat(ngnAmount || "0");
    return (val / EXCHANGE_RATE).toFixed(2);
  }, [ngnAmount]);

  const isOverBalance = parseFloat(usdEquivalent) > MOCK_BALANCE_USD;

  const handleInput = (val: string) => {
    const clean = val.replace(/[^\d]/g, "");
    setNgnAmount(clean);
  };

  return (
    <div className="w-full max-w-[1080px] mx-auto min-h-screen bg-[#F6EDFF]/50 dark:bg-[#252525] transition-colors duration-300 overflow-hidden flex flex-col">
      
      <header className="px-6 py-6 relative flex items-center justify-center">
        {/* FIXED BACK LINK: Always goes to Bank selector */}
        <Link 
          href="/send/bank" 
          className="absolute left-6 p-3 -ml-3 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors z-10"
        >
          <ChevronLeftIcon className="w-6 h-6 text-slate-900 dark:text-white" />
        </Link>
        
        <div className="flex items-center gap-3 bg-white dark:bg-[#3D3D3D] px-5 py-2.5 rounded-full border-2 border-slate-100 dark:border-[#A3A3A3] shadow-sm">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600">
            {avatar}
          </div>
          <div className="flex flex-col items-start leading-none">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Sending to Bank</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">{username}</span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 -mt-10">
        
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full mb-6">
          <ArrowPathIcon className="w-3 h-3 text-slate-500" />
          <span className="text-xs font-bold text-slate-500">Rate: $1 = ₦{EXCHANGE_RATE.toLocaleString()}</span>
        </div>

        <div className="relative flex items-center justify-center gap-2 mb-2 w-full">
           <span className={`text-5xl md:text-7xl font-bold tracking-tighter transition-colors ${ngnAmount ? 'text-slate-900 dark:text-white' : 'text-slate-300 dark:text-slate-700'}`}>
              ₦
           </span>
           <input 
              type="tel" 
              placeholder="0" 
              autoFocus
              value={displayNgn}
              onChange={(e) => handleInput(e.target.value)}
              className="w-full max-w-[400px] bg-transparent text-5xl md:text-7xl font-bold tracking-tighter text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700 text-center focus:outline-none focus:ring-0 p-0 border-none"
           />
        </div>

        <div className="h-16 flex flex-col items-center justify-center gap-1">
          {ngnAmount && (
            <p className="text-lg font-bold text-slate-500">
              ≈ ${usdEquivalent} USD
            </p>
          )}
          
          {isOverBalance ? (
             <span className="text-red-500 font-bold text-sm animate-pulse">
               Insufficient Balance ($7,517.49)
             </span>
          ) : (
             <p className="text-slate-400 text-sm font-medium">
               Balance: $7,517.49
             </p>
          )}
        </div>

        <div className="flex gap-3 mt-8">
          {["5000", "10000", "50000"].map((val) => (
            <button 
              key={val}
              onClick={() => handleInput(val)}
              className="px-5 py-2.5 rounded-full bg-white dark:bg-[#3D3D3D] border-2 border-slate-200 dark:border-[#A3A3A3] font-bold text-slate-600 dark:text-slate-300 hover:border-[#D364DB] hover:text-[#D364DB] transition-all shadow-sm"
            >
              ₦{(parseInt(val)/1000)}k
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        <Link 
          href={!ngnAmount || isOverBalance ? "#" : `/send/review?username=${username}&amount=${usdEquivalent}&fiat=${ngnAmount}&type=bank&source=bank`}
        >
          <button 
            disabled={!ngnAmount || isOverBalance}
            className="w-full py-4 rounded-2xl bg-[#D364DB] text-white font-bold text-lg shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.8)] hover:-translate-y-1 transition-all disabled:opacity-50 disabled:transform-none disabled:shadow-none"
          >
            Review Payment
          </button>
        </Link>
      </div>
    </div>
  );
}

export default function BankAmountInput() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BankAmountContent />
    </Suspense>
  );
}
