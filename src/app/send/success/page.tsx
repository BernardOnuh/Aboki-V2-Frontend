"use client"

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  CheckCircleIcon, 
  ArrowTopRightOnSquareIcon 
} from "@heroicons/react/24/outline";

function SendSuccessContent() {
  const searchParams = useSearchParams();
  
  const txHash = searchParams.get("txHash") || "";
  const amount = searchParams.get("amount") || "0";
  const to = searchParams.get("to") || "@unknown";

  // Create explorer URL (Base Sepolia)
  const explorerUrl = `https://sepolia.basescan.org/tx/${txHash}`;

  return (
    <div className="w-full max-w-[1080px] mx-auto min-h-screen bg-[#F6EDFF]/50 dark:bg-[#252525] transition-colors duration-300 overflow-hidden flex flex-col items-center justify-center p-6">
      
      {/* Success Animation */}
      <div className="mb-8 relative">
        <div className="absolute inset-0 bg-green-500 rounded-full opacity-20 animate-ping"></div>
        <div className="relative bg-white dark:bg-[#3D3D3D] rounded-full p-6 border-4 border-green-500 shadow-lg">
          <CheckCircleIcon className="w-20 h-20 text-green-500" />
        </div>
      </div>

      {/* Success Message */}
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 text-center">
        Payment Sent!
      </h1>
      <p className="text-slate-500 dark:text-slate-400 text-center mb-8 max-w-sm">
        Your transaction has been successfully processed
      </p>

      {/* Transaction Details Card */}
      <div className="w-full max-w-md bg-white dark:bg-[#3D3D3D] border-2 border-slate-200 dark:border-[#A3A3A3] rounded-3xl p-6 mb-6 shadow-lg">
        
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-700">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Amount Sent
            </span>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              ${amount} USDC
            </span>
          </div>

          <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-700">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Sent To
            </span>
            <span className="text-base font-bold text-slate-900 dark:text-white">
              {to}
            </span>
          </div>

          <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-700">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Network Fee
            </span>
            <span className="text-sm font-bold text-green-600 dark:text-green-400">
              FREE (Sponsored)
            </span>
          </div>

          {txHash && (
            <div>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400 block mb-2">
                Transaction Hash
              </span>
              <a 
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors group"
              >
                <span className="flex-1 text-xs font-mono text-slate-600 dark:text-slate-300 truncate">
                  {txHash}
                </span>
                <ArrowTopRightOnSquareIcon className="w-4 h-4 text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 flex-shrink-0" />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full max-w-md space-y-3">
        <Link href="/send" className="block">
          <button className="w-full py-4 rounded-2xl bg-[#D364DB] text-white font-bold text-lg shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.8)] hover:-translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] transition-all">
            Send Another Payment
          </button>
        </Link>
        
        <Link href="/" className="block">
          <button className="w-full py-4 rounded-2xl bg-white dark:bg-[#3D3D3D] text-slate-900 dark:text-white font-bold text-lg border-2 border-slate-200 dark:border-[#A3A3A3] hover:border-[#D364DB] transition-all">
            Back to Home
          </button>
        </Link>
      </div>
    </div>
  );
}

export default function SendSuccess() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SendSuccessContent />
    </Suspense>
  );
}