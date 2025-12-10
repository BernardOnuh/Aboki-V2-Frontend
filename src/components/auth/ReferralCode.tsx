"use client"

import { useState } from "react";
import Link from "next/link";
import { ArrowRightIcon, CheckBadgeIcon } from "@heroicons/react/24/solid";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import AuthLayout from "./AuthLayout";

export default function ReferralCode() {
  const [code, setCode] = useState("");
  const [isValid, setIsValid] = useState(false);

  const handleInput = (val: string) => {
    setCode(val.toUpperCase());
    if (val.length >= 4) setIsValid(true);
    else setIsValid(false);
  };

  return (
    <AuthLayout>
      <div className="space-y-8">
        
        {/* Back Button */}
        <div className="-mt-12 md:-mt-0 mb-4">
          <Link href="/login" className="inline-block p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-[#404040] transition-colors">
            <ChevronLeftIcon className="w-6 h-6 text-slate-900 dark:text-white" />
          </Link>
        </div>

        {/* Text Moved Here */}
        <div className="space-y-2">
           <h2 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-wide">
             STILL IN BETA
           </h2>
           <p className="text-slate-500 dark:text-gray-400 font-medium">
             Enter your invite code to continue or join the waitlist.
           </p>
        </div>

        {/* Input Group */}
        <div className="flex gap-3">
          <div className="relative flex-1">
             <input 
               type="text" 
               placeholder="CODE" 
               value={code}
               onChange={(e) => handleInput(e.target.value)}
               className="w-full h-14 pl-5 pr-12 rounded-xl bg-slate-50 dark:bg-[#252525] border-2 border-slate-200 dark:border-[#A3A3A3] text-lg font-bold text-slate-900 dark:text-white placeholder:text-slate-300 focus:border-[#D364DB] focus:outline-none uppercase tracking-widest transition-colors"
             />
             {isValid && (
               <div className="absolute right-4 top-1/2 -translate-y-1/2 animate-in fade-in zoom-in">
                 <CheckBadgeIcon className="w-6 h-6 text-green-500" />
               </div>
             )}
          </div>

          <Link href={isValid ? "/username" : "#"}>
            <button 
              disabled={!isValid}
              className="h-14 w-14 rounded-xl bg-slate-100 dark:bg-[#252525] border-2 border-slate-900 dark:border-white text-slate-900 dark:text-white flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.9)] hover:-translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-y-0 active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            >
              <ArrowRightIcon className="w-6 h-6" />
            </button>
          </Link>
        </div>

        {/* Divider */}
        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-slate-200 dark:border-[#A3A3A3]"></div>
          <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-bold uppercase">or</span>
          <div className="flex-grow border-t border-slate-200 dark:border-[#A3A3A3]"></div>
        </div>

        {/* Waitlist Button */}
        <button className="w-full py-4 rounded-xl bg-white dark:bg-[#252525] border-2 border-slate-200 dark:border-[#A3A3A3] text-slate-600 dark:text-gray-200 font-bold hover:border-[#D364DB] transition-all">
          Join Waitlist
        </button>

      </div>
    </AuthLayout>
  );
}
