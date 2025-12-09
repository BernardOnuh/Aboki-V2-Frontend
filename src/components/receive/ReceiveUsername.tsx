"use client"

import { useState } from "react";
import Link from "next/link";
import { ChevronLeftIcon, DocumentDuplicateIcon, ShareIcon } from "@heroicons/react/24/outline";

export default function ReceiveUsername() {
  const [copied, setCopied] = useState(false);
  const username = "@jadonamite";

  const handleCopy = () => {
    navigator.clipboard.writeText(username);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-[1080px] mx-auto min-h-screen bg-[#F6EDFF]/50 dark:bg-slate-950 transition-colors duration-300 overflow-hidden flex flex-col">
      
      {/* Fixed Header: Removed negative margins, cleaner z-index */}
      <header className="px-6 py-6 flex items-center gap-4 relative z-10">
        <Link 
          href="/receive" 
          className="p-3 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <ChevronLeftIcon className="w-6 h-6 text-slate-900 dark:text-white" />
        </Link>
        <h1 className="font-bold text-xl text-slate-900 dark:text-white">Aboki Username</h1>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 -mt-20">
        <div className="w-24 h-24 bg-purple-200 rounded-full flex items-center justify-center mb-6 border-4 border-white dark:border-slate-800 shadow-xl">
          <span className="text-3xl font-bold text-purple-700">J</span>
        </div>
        
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">YOUR USERNAME</h2>
        <div className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-8">
          {username}
        </div>

        <div className="flex gap-4 w-full max-w-xs">
          <button 
            onClick={handleCopy}
            className="flex-1 py-3 px-4 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 flex items-center justify-center gap-2 hover:border-[#D364DB] active:scale-95 transition-all shadow-sm"
          >
            {copied ? <span className="text-green-600 font-bold">Copied!</span> : (
               <>
                 <DocumentDuplicateIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                 <span className="font-bold text-slate-700 dark:text-white">Copy</span>
               </>
            )}
          </button>
          <button className="flex-1 py-3 px-4 rounded-xl bg-[#D364DB] text-white font-bold flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.8)] hover:-translate-y-0.5 transition-all">
            <ShareIcon className="w-5 h-5" />
            Share
          </button>
        </div>
      </div>
    </div>
  );
}