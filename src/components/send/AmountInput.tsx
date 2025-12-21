"use client"

import { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  ChevronLeftIcon, 
  ChevronUpIcon, 
  ChevronDownIcon,
  PencilSquareIcon,
  ExclamationCircleIcon
} from "@heroicons/react/24/outline";
import apiClient from "@/lib/api-client";

function AmountInputContent() {
  const searchParams = useSearchParams();
  const username = searchParams.get("username") || "unknown";
  const avatar = searchParams.get("avatar") || "?";
  const source = searchParams.get("source");
  const fullAddress = searchParams.get("fullAddress");

  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [balance, setBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [balanceError, setBalanceError] = useState<string | null>(null);

  let backLink = "/send/contacts";
  if (source === "crypto") backLink = "/send/crypto";

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        setLoadingBalance(true);
        setBalanceError(null);
        
        console.log("💰 Fetching wallet balance...");
        const response = await apiClient.getWalletBalance();
        
        console.log("📊 Balance response:", response);
        
        if (response.success && response.data) {
          const data = response.data as any;
          const balanceValue = parseFloat(
            data.usdcBalance || 
            data.balance || 
            data.formattedBalance || 
            "0"
          );
          
          setBalance(balanceValue);
          console.log("✅ Balance loaded:", balanceValue);
        } else {
          setBalanceError(response.error || "Failed to load balance");
          console.error("❌ Failed to load balance:", response.error);
          setBalance(null);
        }
      } catch (err: any) {
        console.error("❌ Error fetching balance:", err);
        setBalanceError(err.message || "Failed to load balance");
        setBalance(null);
      } finally {
        setLoadingBalance(false);
      }
    };

    fetchBalance();
  }, []);

  const formatAmount = (val: string) => {
    if (!val) return "";
    const cleaned = val.replace(/[^\d.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length > 2) {
      return parts[0] + "." + parts.slice(1).join("");
    }
    return cleaned;
  };

  const isOverBalance = useMemo(() => {
    if (balance === null) return false;
    const val = parseFloat(amount || "0");
    return val > balance;
  }, [amount, balance]);

  const adjustAmount = (delta: number) => {
    const current = parseFloat(amount || "0");
    const newValue = Math.max(0, current + delta).toFixed(2); 
    setAmount(newValue);
  };

  const handleQuickAdd = (val: string) => {
    setAmount(val);
  };

  const displayBalance = balance !== null ? balance.toFixed(2) : "0.00";

  const isDisabled = !amount || parseFloat(amount) <= 0 || isOverBalance || loadingBalance || !!balanceError;

  useEffect(() => {
    console.log("🔘 Button state:", {
      amount,
      amountValue: parseFloat(amount || "0"),
      isOverBalance,
      loadingBalance,
      balanceError,
      isDisabled,
      balance
    });
  }, [amount, isOverBalance, loadingBalance, balanceError, balance, isDisabled]);

  return (
    <div className="w-full max-w-[1080px] mx-auto h-screen bg-[#F6EDFF]/50 dark:bg-[#252525] transition-colors duration-300 flex flex-col">
      
      {/* Header - Fixed at top */}
      <header className="flex-shrink-0 px-6 py-4 relative flex items-center justify-center">
        <Link 
          href={backLink} 
          className="absolute left-6 p-3 -ml-3 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors z-10"
        >
          <ChevronLeftIcon className="w-6 h-6 text-slate-900 dark:text-white" />
        </Link>
        
        <div className="flex items-center gap-3 bg-white dark:bg-[#3D3D3D] px-5 py-2.5 rounded-full border-2 border-slate-100 dark:border-[#A3A3A3] shadow-sm">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-sm font-bold text-purple-600">
              {avatar}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border-2 border-white dark:border-slate-900"></span>
            </span>
          </div>
          <div className="flex flex-col items-start leading-none">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Sending to</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {username.startsWith('@') ? username : `@${username}`}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="flex flex-col items-center justify-start pt-8">
          
          <span className="text-slate-400 font-bold tracking-widest text-sm mb-6">
            USD AMOUNT
          </span>

          <div className="relative flex items-center justify-center gap-6 mb-2">
            <div className="flex items-center relative">
              <span className={`text-6xl md:text-7xl font-bold tracking-tighter transition-colors ${amount ? (isOverBalance ? 'text-red-500' : 'text-slate-900 dark:text-white') : 'text-slate-300 dark:text-slate-700'}`}>
                $
              </span>
              <input 
                type="text"
                inputMode="decimal"
                placeholder="0" 
                autoFocus
                value={amount}
                onChange={(e) => setAmount(formatAmount(e.target.value))}
                className={`w-full max-w-[250px] bg-transparent text-6xl md:text-7xl font-bold tracking-tighter text-center focus:outline-none focus:ring-0 p-0 transition-colors ${isOverBalance ? 'text-red-500' : 'text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700'}`}
              />
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={() => adjustAmount(1)}
                className="w-12 h-12 rounded-full bg-white dark:bg-[#3D3D3D] border-2 border-slate-200 dark:border-[#A3A3A3] flex items-center justify-center hover:border-[#D364DB] active:scale-95 transition-all shadow-sm group"
              >
                <ChevronUpIcon className="w-6 h-6 text-slate-400 group-hover:text-[#D364DB]" />
              </button>
              <button 
                onClick={() => adjustAmount(-1)}
                className="w-12 h-12 rounded-full bg-white dark:bg-[#3D3D3D] border-2 border-slate-200 dark:border-[#A3A3A3] flex items-center justify-center hover:border-[#D364DB] active:scale-95 transition-all shadow-sm group"
              >
                <ChevronDownIcon className="w-6 h-6 text-slate-400 group-hover:text-[#D364DB]" />
              </button>
            </div>
          </div>

          <div className="h-8 flex flex-col items-center justify-center mb-6">
            {loadingBalance ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
                <span className="text-slate-500 text-sm">Loading balance...</span>
              </div>
            ) : balanceError ? (
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-2">
                  <ExclamationCircleIcon className="w-4 h-4 text-red-500" />
                  <span className="text-red-600 dark:text-red-400 text-sm font-medium">
                    {balanceError}
                  </span>
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="text-xs text-purple-600 dark:text-purple-400 underline hover:no-underline"
                >
                  Retry
                </button>
              </div>
            ) : isOverBalance ? (
              <span className="text-red-500 font-bold animate-pulse">
                Exceeds balance (${displayBalance})
              </span>
            ) : (
              <p className="text-slate-500 font-medium">
                Balance: ${displayBalance} USDC
              </p>
            )}
          </div>

          <div className="flex gap-3 mb-6">
            {["5", "10", "50"].map((val) => (
              <button 
                key={val}
                onClick={() => handleQuickAdd(val)}
                disabled={loadingBalance || !!balanceError}
                className="px-5 py-2.5 rounded-full bg-white dark:bg-[#3D3D3D] border-2 border-slate-200 dark:border-[#A3A3A3] font-bold text-slate-600 dark:text-slate-300 hover:border-[#D364DB] hover:text-[#D364DB] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ${val}
              </button>
            ))}
            <button 
              onClick={() => balance !== null && handleQuickAdd(balance.toFixed(2))}
              disabled={balance === null || loadingBalance || !!balanceError}
              className="px-5 py-2.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-[#D364DB] font-bold border-2 border-transparent hover:border-[#D364DB] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Max
            </button>
          </div>

          <div className="w-full max-w-xs relative mb-6">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <PencilSquareIcon className="h-5 w-5 text-slate-400" />
            </div>
            <input 
              type="text" 
              placeholder="Add a note (optional)" 
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={200}
              className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-[#3D3D3D]/50 border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:border-[#D364DB] dark:focus:border-[#D364DB] rounded-xl text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-900 transition-all text-center"
            />
          </div>

          {/* Button moved here - inside scrollable area */}
          <div className="w-full max-w-md">
            {/* Show why button is disabled */}
            {isDisabled && (
              <div className="mb-3 text-center">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {!amount || parseFloat(amount) <= 0 ? "⬆️ Enter an amount to continue" :
                   loadingBalance ? "⏳ Loading balance..." :
                   balanceError ? "❌ Balance error - please retry" :
                   isOverBalance ? "❌ Amount exceeds balance" :
                   "Please enter a valid amount"}
                </p>
              </div>
            )}

            <Link 
              href={
                isDisabled
                  ? "#" 
                  : `/send/review?username=${username}&amount=${amount}&note=${encodeURIComponent(note)}&source=${source || 'contacts'}${fullAddress ? `&fullAddress=${fullAddress}` : ''}&avatar=${avatar}`
              }
              onClick={(e) => {
                if (isDisabled) {
                  e.preventDefault();
                  console.log("❌ Button disabled:", { amount, isOverBalance, loadingBalance, balanceError });
                }
              }}
            >
              <button 
                disabled={isDisabled}
                className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${
                  isDisabled
                    ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                    : 'bg-[#D364DB] text-white shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.8)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] active:translate-y-0 active:shadow-none'
                }`}
              >
                {loadingBalance ? "Loading Balance..." : 
                 balanceError ? "Balance Error - Retry" : 
                 "Review Payment"}
              </button>
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
}

export default function AmountInput() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F6EDFF]/50 dark:bg-[#252525] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#D364DB]"></div>
      </div>
    }>
      <AmountInputContent />
    </Suspense>
  );
}