"use client"

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  ChevronLeftIcon, 
  ShieldCheckIcon,
  CheckCircleIcon,
  LinkIcon,
  ClipboardDocumentIcon
} from "@heroicons/react/24/outline";

function ReviewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Data Params
  const username = searchParams.get("username") || "@unknown";
  const amount = searchParams.get("amount") || "0";
  const fiatAmount = searchParams.get("fiat"); // For Bank
  const type = searchParams.get("type"); // 'bank', 'link', 'crypto'
  const source = searchParams.get("source"); // For back button logic

  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isSent, setIsSent] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");
  const [copied, setCopied] = useState(false);

  // Dynamic Back Link logic
  const getBackLink = () => {
    if (type === 'bank') return "/send/amount-ngn"; // Go back to NGN input
    return "/send/amount"; // Go back to standard USD input
  };

  const HOLD_DURATION = 1500;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isHolding && !isSent) {
      const step = 100 / (HOLD_DURATION / 20);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsSent(true);
            setIsHolding(false);
            // If it's a magic link, generate one
            if (username === "Magic Link") {
               setGeneratedLink(`https://aboki.com/claim/${Math.random().toString(36).substring(7)}`);
            }
            clearInterval(interval);
            return 100;
          }
          return prev + step;
        });
      }, 20);
    } else if (!isSent) {
      setProgress(0);
    }
    return () => clearInterval(interval);
  }, [isHolding, isSent, username]);

  const copyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
  };

  // --- SUCCESS SCREEN ---
  if (isSent) {
    // SCENARIO A: Magic Link Success
    if (username === "Magic Link") {
      return (
        <div className="w-full max-w-[1080px] mx-auto min-h-screen bg-[#F6EDFF]/50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
           <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
              <LinkIcon className="w-10 h-10 text-pink-500" />
           </div>
           <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Link Created!</h1>
           <p className="text-slate-500 mb-8">Anyone with this link can claim ${amount}.</p>

           {/* The Link Card */}
           <div className="w-full max-w-sm bg-white dark:bg-slate-900 p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 mb-8 flex items-center gap-3">
              <div className="flex-1 overflow-hidden">
                <p className="text-slate-900 dark:text-white font-mono text-sm truncate">{generatedLink}</p>
              </div>
              <button onClick={copyLink} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                {copied ? <span className="text-green-500 font-bold text-xs">Copied</span> : <ClipboardDocumentIcon className="w-5 h-5 text-slate-400" />}
              </button>
           </div>

           <Link href="/">
              <button className="px-8 py-3 bg-[#D364DB] text-white font-bold rounded-full shadow-lg">
                Done
              </button>
           </Link>
        </div>
      );
    }

    // SCENARIO B: Standard Success (Bank/P2P)
    return (
      <div className="w-full max-w-[1080px] mx-auto min-h-screen bg-[#D364DB] flex flex-col items-center justify-center text-white p-6 text-center animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-6">
          <CheckCircleIcon className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-4xl font-bold mb-2">Sent!</h1>
        <p className="text-lg opacity-90 mb-8">
          {fiatAmount ? `You sent ₦${parseInt(fiatAmount).toLocaleString()}` : `You sent $${amount}`} to {username}
        </p>
        <Link href="/">
          <button className="px-8 py-3 bg-white text-[#D364DB] font-bold rounded-full shadow-lg hover:scale-105 transition-transform">
            Done
          </button>
        </Link>
      </div>
    );
  }

  // --- REVIEW SCREEN ---
  return (
    <div className="w-full max-w-[1080px] mx-auto min-h-screen bg-[#F6EDFF]/50 dark:bg-slate-950 transition-colors duration-300 overflow-hidden flex flex-col">
      
      <header className="px-6 py-6 flex items-center justify-center relative">
        <button 
          onClick={() => router.back()} // Use router.back() to rely on browser history or fallback
          className="absolute left-6 p-3 -ml-3 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
        >
          <ChevronLeftIcon className="w-6 h-6 text-slate-900 dark:text-white" />
        </button>
        <h1 className="font-bold text-xl text-slate-900 dark:text-white">Review</h1>
      </header>

      <div className="flex-1 px-6 mt-4">
        
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="text-center py-6 border-b border-dashed border-slate-200 dark:border-slate-700">
            <span className="text-sm font-bold text-slate-400 tracking-wider">YOU SEND</span>
            
            {/* Display NGN if Bank, else USD */}
            {fiatAmount ? (
               <div className="text-4xl font-bold text-slate-900 dark:text-white mt-2 tracking-tighter">
                 ₦{parseInt(fiatAmount).toLocaleString()}
               </div>
            ) : (
               <div className="text-5xl font-bold text-slate-900 dark:text-white mt-2 tracking-tighter">
                 ${amount}<span className="text-3xl text-slate-400">.00</span>
               </div>
            )}
          </div>

          <div className="py-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">To</span>
              <div className="flex items-center gap-2">
                 <span className="font-bold text-slate-900 dark:text-white">{username}</span>
              </div>
            </div>

            {/* If Bank, show the rate used */}
            {fiatAmount && (
               <div className="flex items-center justify-between">
                 <span className="text-slate-500 font-medium">Rate</span>
                 <span className="font-bold text-slate-900 dark:text-white">$1 = ₦1,450</span>
               </div>
            )}

            <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white">Total Deduction</span>
              <span className="font-bold text-slate-900 dark:text-white">${amount} USD</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mt-6 text-slate-400">
          <ShieldCheckIcon className="w-4 h-4" />
          <span className="text-xs font-medium">Secured by Coinbase Smart Wallet</span>
        </div>
      </div>

      <div className="p-6 pb-10">
        <div className="relative w-full h-16 rounded-2xl bg-slate-200 dark:bg-slate-800 overflow-hidden select-none touch-none shadow-inner">
          <div 
            className="absolute top-0 left-0 h-full bg-[#D364DB] transition-all duration-[20ms] ease-linear"
            style={{ width: `${progress}%` }}
          />
          <button
            onMouseDown={() => !isSent && setIsHolding(true)}
            onMouseUp={() => setIsHolding(false)}
            onMouseLeave={() => setIsHolding(false)}
            onTouchStart={() => !isSent && setIsHolding(true)}
            onTouchEnd={() => setIsHolding(false)}
            className="absolute inset-0 w-full h-full flex items-center justify-center z-10 focus:outline-none"
          >
            <span className={`font-bold text-lg transition-colors ${progress > 50 ? 'text-white' : 'text-slate-500'}`}>
              {isHolding ? "Keep holding..." : (username === "Magic Link" ? "Hold to Create Link" : "Hold to Send")}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ReviewPayment() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReviewContent />
    </Suspense>
  );
}