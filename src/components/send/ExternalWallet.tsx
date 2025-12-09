
"use client"

import { useState } from "react";
import Link from "next/link";
import { ChevronLeftIcon, QrCodeIcon, ClipboardDocumentIcon } from "@heroicons/react/24/outline";

export default function ExternalWallet() {
  const [address, setAddress] = useState("");

  // Simple Eth address validation
  const isValidAddress = address.startsWith("0x") && address.length === 42;

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setAddress(text);
    } catch (err) {
      console.error("Failed to read clipboard", err);
    }
  };

  return (
    <div className="w-full max-w-[1080px] mx-auto min-h-screen bg-[#F6EDFF]/50 dark:bg-slate-950 transition-colors duration-300 overflow-hidden flex flex-col">
      
      {/* Header */}
      <header className="px-6 py-6 flex items-center gap-4">
        <Link href="/send" className="p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
          <ChevronLeftIcon className="w-6 h-6 text-slate-900 dark:text-white" />
        </Link>
        <h1 className="font-bold text-xl text-slate-900 dark:text-white">
          Enter Address
        </h1>
      </header>

      <div className="px-6 mt-4 flex-1">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
          Wallet Address (Base/ERC-20)
        </label>
        
        <div className="relative">
          <textarea 
            placeholder="0x..." 
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full h-40 p-5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl text-lg font-mono text-slate-900 dark:text-white placeholder:text-slate-300 focus:border-[#D364DB] focus:outline-none resize-none shadow-sm transition-all"
          />
          
          {/* Action Tools */}
          <div className="absolute bottom-4 right-4 flex gap-2">
            <button 
              onClick={handlePaste}
              className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
            >
              <ClipboardDocumentIcon className="w-3.5 h-3.5" /> PASTE
            </button>
            <button className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5">
              <QrCodeIcon className="w-3.5 h-3.5" /> SCAN
            </button>
          </div>
        </div>

        {/* Validation Feedback */}
        {address && (
          <div className={`mt-4 p-4 rounded-2xl text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${isValidAddress ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
             <div className={`w-2.5 h-2.5 rounded-full ${isValidAddress ? 'bg-green-500' : 'bg-red-500'}`} />
             {isValidAddress ? "Valid Base Address" : "Invalid Address Format"}
          </div>
        )}
      </div>

      {/* Continue Button */}
      <div className="p-6">
        <Link href={isValidAddress ? `/send/amount?source=crypto&username=${address.slice(0,6)}...${address.slice(-4)}&avatar=0x` : "#"}>
          <button 
            disabled={!isValidAddress}
            className="w-full py-4 rounded-2xl bg-[#D364DB] text-white font-bold text-lg shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.8)] hover:-translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] transition-all disabled:opacity-50 disabled:transform-none disabled:shadow-none"
          >
            Continue
          </button>
        </Link>
      </div>
    </div>
  );
}


