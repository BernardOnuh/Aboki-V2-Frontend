"use client"

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon, QrCodeIcon, ClipboardDocumentIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

export default function ExternalWallet() {
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  // Ethereum address validation
  const isValidAddress = /^0x[a-fA-F0-9]{40}$/.test(address);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setAddress(text.trim());
    } catch (err) {
      console.error("Failed to read clipboard", err);
    }
  };

  const handleContinue = () => {
    if (!isValidAddress) return;
    
    // Create shortened display version for URL
    const shortAddress = `${address.slice(0,6)}...${address.slice(-4)}`;
    
    // Navigate to amount page with full address
    router.push(`/send/amount?source=crypto&username=${encodeURIComponent(shortAddress)}&avatar=0x&fullAddress=${encodeURIComponent(address)}`);
  };

  return (
    <div className="w-full min-h-screen bg-[#F6EDFF]/50 dark:bg-[#252525] transition-colors duration-300 overflow-hidden flex flex-col">
      
      {/* Header */}
      <header className="px-6 py-6 flex items-center gap-4">
        <Link href="/send" className="p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
          <ChevronLeftIcon className="w-6 h-6 text-slate-900 dark:text-white" />
        </Link>
        <h1 className="font-bold text-xl text-slate-900 dark:text-white">
          Enter Wallet Address
        </h1>
      </header>

      {/* Main Content - Centered */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-[1080px]">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
            Recipient Address (Base Network)
          </label>
          
          <div className="relative mb-4">
            <textarea 
              placeholder="0x..." 
              value={address}
              onChange={(e) => setAddress(e.target.value.trim())}
              className="w-full h-40 p-5 bg-white dark:bg-[#3D3D3D] border-2 border-slate-200 dark:border-[#A3A3A3] rounded-3xl text-lg font-mono text-slate-900 dark:text-white placeholder:text-slate-300 focus:border-[#D364DB] focus:outline-none resize-none shadow-sm transition-all"
            />
            
            {/* Action Tools */}
            <div className="absolute bottom-4 right-4 flex gap-2">
              <button 
                onClick={handlePaste}
                className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
              >
                <ClipboardDocumentIcon className="w-3.5 h-3.5" /> PASTE
              </button>
              <button 
                className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
                onClick={() => {
                  alert("QR Scanner coming soon!");
                }}
              >
                <QrCodeIcon className="w-3.5 h-3.5" /> SCAN
              </button>
            </div>
          </div>

          {/* Validation Feedback */}
          {address && (
            <div className={`mb-6 p-4 rounded-2xl text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
              isValidAddress 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              <div className={`w-2.5 h-2.5 rounded-full ${isValidAddress ? 'bg-green-500' : 'bg-red-500'}`} />
              {isValidAddress ? (
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5" />
                  <span>Valid Base Address</span>
                </div>
              ) : (
                <span>Invalid address format. Must be a valid Ethereum address (0x...)</span>
              )}
            </div>
          )}

          {/* Info Box */}
          <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-2xl border border-purple-200 dark:border-purple-800">
            <p className="text-sm text-slate-700 dark:text-slate-300">
              <span className="font-bold text-purple-600 dark:text-purple-400">✨ Gasless Transfer:</span> Send USDC to any Base wallet address without paying gas fees. The transaction is sponsored by Coinbase!
            </p>
          </div>

          {/* Continue Button */}
          <button 
            onClick={handleContinue}
            disabled={!isValidAddress || isValidating}
            className="w-full py-4 rounded-2xl bg-[#D364DB] text-white font-bold text-lg shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.8)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] active:translate-y-0 active:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
          >
            Continue
          </button>
          
          <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-4">
            Make sure the address is on Base network
          </p>
        </div>
      </div>
    </div>
  );
}