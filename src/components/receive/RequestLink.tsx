"use client"

import { useState } from "react";
import Link from "next/link";
import { ChevronLeftIcon, LinkIcon, ClipboardDocumentIcon } from "@heroicons/react/24/outline";

export default function RequestLink() {
  const [amount, setAmount] = useState("");
  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);

  const formatAmount = (val: string) => val.replace(/[^\d.]/g, "");

  const generateLink = () => {
    setLink(`https://aboki.com/pay/me?amt=${amount}`);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
  };

  if (link) {
    // Success View
    return (
      <div className="w-full max-w-[1080px] mx-auto min-h-screen bg-[#F6EDFF]/50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
         <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mb-6">
            <LinkIcon className="w-10 h-10 text-pink-500" />
         </div>
         <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Request Ready!</h1>
         <p className="text-slate-500 mb-8">Share this link to get paid ${amount}.</p>

         <div className="w-full max-w-sm bg-white dark:bg-slate-900 p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 mb-8 flex items-center gap-3">
            <p className="flex-1 text-slate-900 dark:text-white font-mono text-sm truncate">{link}</p>
            <button onClick={copyLink}>
              {copied ? <span className="text-green-500 font-bold text-xs">Copied</span> : <ClipboardDocumentIcon className="w-5 h-5 text-slate-400" />}
            </button>
         </div>

         <button onClick={() => setLink("")} className="text-slate-500 font-bold hover:text-slate-900">Create another</button>
      </div>
    );
  }

  // Input View
  return (
    <div className="w-full max-w-[1080px] mx-auto min-h-screen bg-[#F6EDFF]/50 dark:bg-slate-950 transition-colors duration-300 overflow-hidden flex flex-col">
      <header className="px-6 py-6 flex items-center gap-4">
        <Link href="/receive" className="p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
          <ChevronLeftIcon className="w-6 h-6 text-slate-900 dark:text-white" />
        </Link>
        <h1 className="font-bold text-xl text-slate-900 dark:text-white">Request Money</h1>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 -mt-10">
        <span className="text-slate-400 font-bold tracking-widest text-sm mb-6">AMOUNT TO REQUEST</span>
        <div className="flex items-center justify-center relative mb-8">
           <span className={`text-6xl font-bold tracking-tighter ${amount ? 'text-slate-900 dark:text-white' : 'text-slate-300'}`}>$</span>
           <input 
              type="number" placeholder="0" autoFocus
              value={amount} onChange={(e) => setAmount(formatAmount(e.target.value))}
              className="w-full max-w-[300px] bg-transparent text-6xl font-bold tracking-tighter text-slate-900 dark:text-white placeholder:text-slate-300 text-center focus:outline-none p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none"
           />
        </div>
        <button 
          disabled={!amount}
          onClick={generateLink}
          className="w-full max-w-sm py-4 rounded-2xl bg-[#D364DB] text-white font-bold text-lg shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:-translate-y-1 transition-all disabled:opacity-50 disabled:transform-none disabled:shadow-none"
        >
          Create Request Link
        </button>
      </div>
    </div>
  );
}
