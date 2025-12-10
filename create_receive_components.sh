#!/bin/bash

# Create directory if not exi

cat << 'EOF' > src/components/add/AddCashInput.tsx
"use client"

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  ChevronLeftIcon, 
  ArrowPathIcon, 
  ShieldCheckIcon, 
  InformationCircleIcon 
} from "@heroicons/react/24/outline";

const EXCHANGE_RATE = 1450; // $1 = ₦1,450
const TIER_1_LIMIT = 50000; // 50k Naira limit

export default function AddCashInput() {
  const [ngnAmount, setNgnAmount] = useState("");

  // Format Display (e.g., 50,000)
  const displayNgn = ngnAmount ? parseInt(ngnAmount).toLocaleString() : "";

  // Calculate USDC
  const usdReceive = useMemo(() => {
    const val = parseFloat(ngnAmount || "0");
    return (val / EXCHANGE_RATE).toFixed(2);
  }, [ngnAmount]);

  // Check Limit
  const rawAmount = parseFloat(ngnAmount || "0");
  const isOverLimit = rawAmount > TIER_1_LIMIT;
  const progressPercent = Math.min(100, (rawAmount / TIER_1_LIMIT) * 100);

  const handleInput = (val: string) => {
    const clean = val.replace(/[^\d]/g, "");
    setNgnAmount(clean);
  };

  return (
    <div className="min-h-screen bg-[#F6EDFF]/50 dark:bg-[#252525] flex justify-center">
      <main className="w-full max-w-[1080px] min-h-screen bg-[#F6EDFF]/50 dark:bg-[#252525] pb-20 transition-colors duration-300 overflow-hidden flex flex-col">
        
        {/* Header */}
        <header className="px-6 py-6 flex items-center justify-between relative">
          <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-[#3d3d3d] transition-colors">
            <ChevronLeftIcon className="w-6 h-6 text-slate-900 dark:text-white" />
          </Link>
          <h1 className="absolute left-1/2 -translate-x-1/2 font-bold text-xl text-slate-900 dark:text-white">
            Add Cash
          </h1>
          <div className="w-8" /> {/* Spacer for centering */}
        </header>

        <div className="flex-1 px-6 mt-4 flex flex-col items-center">
          
          {/* Rate Pill */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-[#3d3d3d] px-3 py-1.5 rounded-full mb-8">
            <ArrowPathIcon className="w-3 h-3 text-slate-500" />
            <span className="text-xs font-bold text-slate-500">Rate: $1 = ₦{EXCHANGE_RATE.toLocaleString()}</span>
          </div>

          {/* Input Section */}
          <div className="w-full relative flex flex-col items-center gap-2 mb-8">
             <div className="flex items-center justify-center gap-1">
                <span className={`text-5xl font-bold tracking-tighter transition-colors ${ngnAmount ? 'text-slate-900 dark:text-white' : 'text-slate-300 dark:text-gray-600'}`}>
                   ₦
                </span>
                <input 
                   type="tel" 
                   placeholder="0" 
                   autoFocus
                   value={displayNgn}
                   onChange={(e) => handleInput(e.target.value)}
                   className="w-full max-w-[300px] bg-transparent text-5xl font-bold tracking-tighter text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-gray-600 text-center focus:outline-none p-0 border-none"
                />
             </div>
             
             {/* USDC Estimate */}
             {ngnAmount && (
                <div className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-3 py-1 rounded-lg text-sm font-bold animate-in fade-in slide-in-from-top-1">
                  You receive ≈ {usdReceive} USDC
                </div>
             )}
          </div>

          {/* Quick Amounts */}
          <div className="flex gap-3 mb-12">
            {["5000", "10000", "20000"].map((val) => (
              <button 
                key={val}
                onClick={() => handleInput(val)}
                className="px-5 py-2.5 rounded-full bg-white dark:bg-[#404040] border border-slate-200 dark:border-[#A3A3A3] font-bold text-slate-600 dark:text-gray-200 hover:border-[#D364DB] hover:text-[#D364DB] transition-all shadow-sm"
              >
                ₦{(parseInt(val)/1000)}k
              </button>
            ))}
          </div>

          {/* KYC Limit Bar */}
          <div className="w-full bg-white dark:bg-[#404040] p-5 rounded-2xl border border-slate-200 dark:border-[#A3A3A3] shadow-sm">
             <div className="flex justify-between items-center mb-2">
               <div className="flex items-center gap-2">
                 <ShieldCheckIcon className="w-4 h-4 text-slate-400" />
                 <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tier 1 Limit</span>
               </div>
               <span className={`text-xs font-bold ${isOverLimit ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
                 {isOverLimit ? "Limit Exceeded" : `₦${displayNgn || 0} / ₦${TIER_1_LIMIT.toLocaleString()}`}
               </span>
             </div>

             {/* Progress Bar */}
             <div className="w-full h-2 bg-slate-100 dark:bg-[#3d3d3d] rounded-full overflow-hidden">
               <div 
                 className={`h-full transition-all duration-500 ${isOverLimit ? 'bg-red-500' : 'bg-[#D364DB]'}`} 
                 style={{ width: `${progressPercent}%` }} 
               />
             </div>

             {/* Upgrade Prompt */}
             <div className="mt-4 flex gap-3 items-start">
               <InformationCircleIcon className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
               <p className="text-xs text-slate-500 leading-relaxed">
                 You are on <span className="font-bold text-slate-700 dark:text-gray-300">Tier 1</span> (Phone Number). 
                 Verify your BVN to increase your daily limit to ₦500,000.
               </p>
             </div>
          </div>

        </div>

        {/* Continue Button */}
        <div className="p-6 pb-24"> {/* Extra padding for bottom nav */}
          <Link href={!ngnAmount || isOverLimit ? "#" : "/add/payment"}>
             <button 
               disabled={!ngnAmount || isOverLimit}
               className="w-full py-4 rounded-2xl bg-[#D364DB] text-white font-bold text-lg shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.9)] hover:-translate-y-1 transition-all disabled:opacity-50 disabled:transform-none disabled:shadow-none"
             >
               {isOverLimit ? "Upgrade to Continue" : "Continue"}
             </button>
          </Link>
        </div>

      </main>
    </div>
  );
}
EOF


mkdir -p src/app/add

cat << 'EOF' > src/app/add/page.tsx
import AddCashInput from "@/components/add/AddCashInput";

export default function Page() {
  return <AddCashInput />;
}
EOF
