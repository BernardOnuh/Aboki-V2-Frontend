"use client"

import { useState } from "react";
import Link from "next/link";
import { ChevronLeftIcon, BuildingLibraryIcon, CheckBadgeIcon } from "@heroicons/react/24/outline";

export default function BankTransfer() {
  const [account, setAccount] = useState("");
  const [bank, setBank] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = (val: string) => {
    setAccount(val);
    if (val.length === 10 && bank) {
      setLoading(true);
      setTimeout(() => {
        setName("JADONAMITE UGOCHUKWU"); 
        setLoading(false);
      }, 800);
    } else {
      setName("");
    }
  };

  return (
    <div className="w-full max-w-[1080px] mx-auto min-h-screen bg-[#F6EDFF]/50 dark:bg-[#252525] transition-colors duration-300 overflow-hidden flex flex-col">
      
      <header className="px-6 py-6 flex items-center gap-4">
        <Link href="/send" className="p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
          <ChevronLeftIcon className="w-6 h-6 text-slate-900 dark:text-white" />
        </Link>
        <h1 className="font-bold text-xl text-slate-900 dark:text-white">
          Bank Transfer
        </h1>
      </header>

      <div className="px-6 mt-4 flex flex-col gap-6 flex-1">
        
        {/* Bank Selector */}
        <div>
           <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block pl-1">Select Bank</label>
           <div className="relative">
             <select 
               className="w-full p-4 bg-white dark:bg-[#3D3D3D] border-2 border-slate-200 dark:border-[#A3A3A3] rounded-2xl text-slate-900 dark:text-white font-bold focus:border-[#D364DB] focus:outline-none appearance-none cursor-pointer transition-colors"
               value={bank}
               onChange={(e) => setBank(e.target.value)}
             >
               <option value="">Choose a bank...</option>
               <option value="gtb">GTBank</option>
               <option value="zenith">Zenith Bank</option>
               <option value="access">Access Bank</option>
               <option value="opay">OPay</option>
               <option value="kuda">Kuda</option>
             </select>
             <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
               <BuildingLibraryIcon className="w-5 h-5 text-slate-400" />
             </div>
           </div>
        </div>

        {/* Account Number */}
        <div>
           <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block pl-1">Account Number</label>
           <input 
             type="tel" 
             maxLength={10}
             placeholder="0123456789"
             value={account}
             onChange={(e) => handleVerify(e.target.value)}
             className="w-full p-4 bg-white dark:bg-[#3D3D3D] border-2 border-slate-200 dark:border-[#A3A3A3] rounded-2xl text-2xl font-mono text-slate-900 dark:text-white placeholder:text-slate-300 focus:border-[#D364DB] focus:outline-none transition-colors"
           />
        </div>

        {/* Verification State */}
        {loading && (
           <div className="flex items-center gap-2 text-slate-500 animate-pulse px-1">
             <div className="w-4 h-4 border-2 border-[#D364DB] border-t-transparent rounded-full animate-spin" />
             <span className="text-sm font-bold">Verifying account...</span>
           </div>
        )}

        {name && !loading && (
          <div className="p-4 bg-purple-100 dark:bg-purple-900/30 border-2 border-purple-200 dark:border-purple-800 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
            <div className="w-10 h-10 rounded-full bg-[#D364DB] flex items-center justify-center text-white shrink-0">
              <CheckBadgeIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 dark:text-gray-300 uppercase tracking-wider">Verified Name</p>
              <p className="font-bold text-slate-900 dark:text-white text-lg">{name}</p>
            </div>
          </div>
        )}

      </div>

      {/* Continue Button */}
      <div className="p-6">
        {/* FIXED LINK: Points to /amount-ngn and passes source=bank */}
        <Link href={name ? `/send/amount-ngn?username=${name}&avatar=BK&source=bank` : "#"}>
          <button 
            disabled={!name}
            className="w-full py-4 rounded-2xl bg-[#D364DB] text-white font-bold text-lg shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.8)] hover:-translate-y-1 transition-all disabled:opacity-50 disabled:transform-none disabled:shadow-none"
          >
            Continue
          </button>
        </Link>
      </div>
    </div>
  );
}
