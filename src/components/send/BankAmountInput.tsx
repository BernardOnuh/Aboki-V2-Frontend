"use client"

import { useState, useMemo, Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeftIcon, ArrowPathIcon, ArrowsRightLeftIcon } from "@heroicons/react/24/outline";
import apiClient from "@/lib/api-client";

type InputMode = "NGN" | "USDC";

interface RateData {
  baseRate: number;
  offrampRate: number;
  markup: number;
  fee: {
    percentage: number;
    amountUSDC: number;
    amountNGN: number;
    maxFeeUSD: number;
    effectiveFeePercent: number;
  };
  calculation?: {
    amountUSDC: number;
    feeUSDC: number;
    netUSDC: number;
    ngnAmount: number;
    effectiveRate: number;
    lpFeeUSDC: number;
    breakdown: string;
  };
  source?: string;
  cached?: boolean;
  timestamp?: string;
}

function BankAmountContent() {
  const searchParams = useSearchParams();
  const name = searchParams.get("name") || "Unknown";
  const account = searchParams.get("account") || "";
  const bank = searchParams.get("bank") || "";
  const bankName = searchParams.get("bankName") || "Bank";
  const recipientType = searchParams.get("type") || "bank"; // "bank" or "business"
  
  const [inputMode, setInputMode] = useState<InputMode>("NGN");
  const [inputValue, setInputValue] = useState("");
  const [rateData, setRateData] = useState<RateData | null>(null);
  const [loadingRate, setLoadingRate] = useState(true);
  const [balance, setBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(true);

  const displayValue = inputValue ? parseFloat(inputValue).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: inputMode === "USDC" ? 6 : 2
  }) : "";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const rateResponse = await apiClient.getOfframpRate(1);
        if (rateResponse.success && rateResponse.data) {
          setRateData(rateResponse.data);
        }
        setLoadingRate(false);

        const balanceResponse = await apiClient.getWalletBalance();
        if (balanceResponse.success && balanceResponse.data) {
          const usdcBalance = parseFloat(balanceResponse.data.usdcBalance || balanceResponse.data.balance || '0');
          setBalance(usdcBalance);
        }
        setLoadingBalance(false);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setLoadingRate(false);
        setLoadingBalance(false);
      }
    };

    fetchData();
    const interval = setInterval(() => {
      apiClient.getOfframpRate(1).then(response => {
        if (response.success && response.data) {
          setRateData(response.data);
        }
      });
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (inputMode !== "USDC" || !inputValue) return;

    const val = parseFloat(inputValue);
    if (isNaN(val) || val <= 0) return;

    const timeoutId = setTimeout(() => {
      apiClient.getOfframpRate(val).then(response => {
        if (response.success && response.data) {
          setRateData(response.data);
        }
      });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [inputValue, inputMode]);

  // ✅ FIXED: Correct fee calculation with decimal support
  const { usdcAmount, ngnAmount, feeUSDC, feeNGN, netNGN, totalUSDC } = useMemo(() => {
    if (!rateData || !inputValue) {
      return { 
        usdcAmount: "0.00", 
        ngnAmount: "0", 
        feeUSDC: "0.00", 
        feeNGN: "0",
        netNGN: "0",
        totalUSDC: "0.00"
      };
    }

    const val = parseFloat(inputValue);
    if (isNaN(val) || val <= 0) {
      return { 
        usdcAmount: "0.00", 
        ngnAmount: "0", 
        feeUSDC: "0.00", 
        feeNGN: "0",
        netNGN: "0",
        totalUSDC: "0.00"
      };
    }

    if (inputMode === "USDC") {
      // User enters USDC - calculate NGN they'll receive
      const feePercentage = rateData.fee.percentage / 100;
      const fee = Math.min(val * feePercentage, rateData.fee.maxFeeUSD);
      const netUSDC = val - fee;
      const ngn = netUSDC * rateData.offrampRate;
      const feeNGNAmount = fee * rateData.offrampRate;

      return {
        usdcAmount: val.toFixed(6),
        ngnAmount: ngn.toFixed(2),
        feeUSDC: fee.toFixed(6),
        feeNGN: feeNGNAmount.toFixed(2),
        netNGN: ngn.toFixed(2),
        totalUSDC: val.toFixed(6)
      };
    } else {
      // ✅ FIXED: User enters NGN they want to RECEIVE (with decimal support)
      const feePercentage = rateData.fee.percentage / 100;
      
      // USDC needed to get the NGN amount (before fee)
      const usdcForNGN = val / rateData.offrampRate;
      
      // Calculate fee - it's 1.5% of the USDC amount but capped at max fee
      let fee = Math.min(usdcForNGN * feePercentage, rateData.fee.maxFeeUSD);
      
      // Total USDC needed
      const totalUSDCNeeded = usdcForNGN + fee;
      
      // Recalculate fee on the total to be accurate
      fee = Math.min(totalUSDCNeeded * feePercentage, rateData.fee.maxFeeUSD);
      
      // Final calculation
      const final = usdcForNGN + fee;
      const feeNGNAmount = fee * rateData.offrampRate;

      return {
        usdcAmount: final.toFixed(6),
        ngnAmount: val.toFixed(2), // Keep exact user input with decimals
        feeUSDC: fee.toFixed(6),
        feeNGN: feeNGNAmount.toFixed(2),
        netNGN: val.toFixed(2),
        totalUSDC: final.toFixed(6)
      };
    }
  }, [inputValue, inputMode, rateData]);

  const hasInsufficientBalance = useMemo(() => {
    if (balance === null || !inputValue || !rateData) return false;
    const totalNeeded = parseFloat(totalUSDC);
    return totalNeeded > balance;
  }, [balance, totalUSDC, inputValue, rateData]);

  const handleInput = (val: string) => {
    // ✅ FIXED: Allow decimals in both NGN and USDC modes
    const clean = val.replace(/[^\d.]/g, "");
    const parts = clean.split(".");
    if (parts.length > 2) return; // Only one decimal point
    setInputValue(clean);
  };

  const toggleInputMode = () => {
    const newMode = inputMode === "NGN" ? "USDC" : "NGN";
    
    if (inputValue && rateData) {
      const val = parseFloat(inputValue);
      if (!isNaN(val) && val > 0) {
        if (inputMode === "NGN") {
          // Switching from NGN to USDC
          setInputValue(totalUSDC);
        } else {
          // Switching from USDC to NGN
          const feePercentage = rateData.fee.percentage / 100;
          const usdcForNGN = val / rateData.offrampRate;
          const fee = Math.min(usdcForNGN * feePercentage, rateData.fee.maxFeeUSD);
          const ngn = (val - fee) * rateData.offrampRate;
          setInputValue(ngn.toFixed(2));
        }
      }
    }
    
    setInputMode(newMode);
  };

  const handleQuickAmount = (amount: string) => {
    setInputValue(amount);
  };

  const currencySymbol = inputMode === "NGN" ? "₦" : "$";
  const oppositeCurrency = inputMode === "NGN" ? "USDC" : "NGN";
  const oppositeAmount = inputMode === "NGN" ? totalUSDC : ngnAmount;

  return (
    <div className="min-h-screen bg-[#F6EDFF]/50 dark:bg-[#252525] flex justify-center">
      <div className="w-full max-w-[1080px] min-h-screen bg-[#F6EDFF]/50 dark:bg-[#252525] transition-colors duration-300 overflow-hidden flex flex-col">
        
        <header className="px-6 py-6 relative flex items-center justify-center">
          <Link 
            href={recipientType === "business" ? "/send" : "/send/bank"} 
            className="absolute left-6 p-3 -ml-3 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors z-10"
          >
            <ChevronLeftIcon className="w-6 h-6 text-slate-900 dark:text-white" />
          </Link>
          
          <div className="flex items-center gap-3 bg-white dark:bg-[#3D3D3D] px-5 py-2.5 rounded-full border-2 border-slate-100 dark:border-[#A3A3A3] shadow-sm">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-sm font-bold text-white">
              {name.charAt(0)}
            </div>
            <div className="flex flex-col items-start leading-none">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">
                {recipientType === "business" ? "Paying" : "Sending to"}
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">{name}</span>
              <span className="text-xs text-slate-500">
                {recipientType === "business" ? "Business Account" : bankName}
              </span>
            </div>
          </div>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center px-6 -mt-10">
          
          <div className="flex items-center gap-3 mb-6 flex-wrap justify-center">
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
              {loadingRate ? (
                <div className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <ArrowPathIcon className="w-3 h-3 text-slate-500" />
              )}
              <span className="text-xs font-bold text-slate-500">
                {loadingRate ? (
                  "Loading rate..."
                ) : rateData ? (
                  `Rate: $1 = ₦${rateData.offrampRate.toLocaleString()}`
                ) : (
                  "Rate unavailable"
                )}
              </span>
            </div>

            <div className="flex items-center gap-2 bg-red-100 dark:bg-red-900/30 px-3 py-1.5 rounded-full">
              <span className="text-xs font-bold text-red-600 dark:text-red-400">
                Fee: {rateData?.fee.percentage}% (capped at ${rateData?.fee.maxFeeUSD})
              </span>
            </div>

            <button
              onClick={toggleInputMode}
              className="flex items-center gap-1.5 bg-[#D364DB] hover:bg-[#C554CB] px-3 py-1.5 rounded-full transition-colors"
              title={`Switch to ${inputMode === "NGN" ? "USDC" : "NGN"} input`}
            >
              <ArrowsRightLeftIcon className="w-3 h-3 text-white" />
              <span className="text-xs font-bold text-white">{inputMode}</span>
            </button>
          </div>

          <div className="relative flex items-center justify-center gap-2 mb-2 w-full">
             <span className={`text-5xl md:text-7xl font-bold tracking-tighter transition-colors ${inputValue ? 'text-slate-900 dark:text-white' : 'text-slate-300 dark:text-slate-700'}`}>
                {currencySymbol}
             </span>
             <input 
                type="tel" 
                placeholder="0" 
                autoFocus
                value={displayValue}
                onChange={(e) => handleInput(e.target.value)}
                className="w-full max-w-[400px] bg-transparent text-5xl md:text-7xl font-bold tracking-tighter text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700 text-center focus:outline-none focus:ring-0 p-0 border-none"
             />
          </div>

          <div className="h-24 flex flex-col items-center justify-center gap-2">
            {inputValue && rateData && (
              <>
                <p className="text-lg font-bold text-slate-500">
                  Total you'll send: {inputMode === "NGN" ? "$" : "₦"}{parseFloat(oppositeAmount).toLocaleString(undefined, {
                    minimumFractionDigits: inputMode === "NGN" ? 2 : 6,
                    maximumFractionDigits: inputMode === "NGN" ? 2 : 6
                  })} {oppositeCurrency}
                </p>
                
                <div className="bg-white dark:bg-[#3D3D3D] border-2 border-slate-200 dark:border-slate-700 rounded-xl p-4 w-full max-w-md text-center">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                    ✅ {recipientType === "business" ? "They'll receive" : "You'll receive"}:
                  </p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400 mb-3">
                    ₦{parseFloat(ngnAmount).toLocaleString(undefined, {
                      minimumFractionDigits: ngnAmount.includes('.') ? 2 : 0,
                      maximumFractionDigits: 2
                    })}
                  </p>
                  <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700 pt-3">
                    <p>
                      Fee: ${feeUSDC} USD = ₦{parseFloat(feeNGN).toLocaleString(undefined, {
                        minimumFractionDigits: feeNGN.includes('.') ? 2 : 0,
                        maximumFractionDigits: 2
                      })}
                    </p>
                    <p className="text-slate-400">
                      📌 Fee is {rateData.fee.percentage}% of transaction (different from exchange rate)
                    </p>
                  </div>
                </div>
              </>
            )}
            
            {hasInsufficientBalance ? (
               <span className="text-red-500 font-bold text-sm animate-pulse mt-2">
                 ❌ Need ${parseFloat(totalUSDC).toFixed(2)} (You have ${balance?.toFixed(2)})
               </span>
            ) : loadingBalance ? (
               <p className="text-slate-400 text-sm font-medium">Loading balance...</p>
            ) : balance !== null ? (
               <p className="text-green-600 dark:text-green-400 text-sm font-medium">
                 ✅ Balance: ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
               </p>
            ) : null}
          </div>

          <div className="flex gap-3 mt-6 mb-8">
            {inputMode === "NGN" ? (
              <>
                {["500", "5000", "50000"].map((val) => (
                  <button 
                    key={val}
                    onClick={() => handleQuickAmount(val)}
                    className="px-5 py-2.5 rounded-full bg-white dark:bg-[#3D3D3D] border-2 border-slate-200 dark:border-[#A3A3A3] font-bold text-slate-600 dark:text-slate-300 hover:border-[#D364DB] hover:text-[#D364DB] transition-all shadow-sm"
                  >
                    ₦{(parseInt(val)/1000).toLocaleString(undefined, { maximumFractionDigits: 1 })}k
                  </button>
                ))}
              </>
            ) : (
              <>
                {["5", "50", "100"].map((val) => (
                  <button 
                    key={val}
                    onClick={() => handleQuickAmount(val)}
                    className="px-5 py-2.5 rounded-full bg-white dark:bg-[#3D3D3D] border-2 border-slate-200 dark:border-[#A3A3A3] font-bold text-slate-600 dark:text-slate-300 hover:border-[#D364DB] hover:text-[#D364DB] transition-all shadow-sm"
                  >
                    ${val}
                  </button>
                ))}
              </>
            )}
          </div>

          {/* Continue Button */}
          <div className="mt-8 mb-32 w-full max-w-md mx-auto">
            <Link 
              href={!inputValue || hasInsufficientBalance ? "#" : `/send/review-bank?name=${encodeURIComponent(name)}&account=${account}&bank=${bank}&bankName=${encodeURIComponent(bankName)}&amountUSDC=${totalUSDC}&amountNGN=${ngnAmount}&feeUSDC=${feeUSDC}&feeNGN=${feeNGN}&rate=${rateData?.offrampRate || 0}&recipientType=${recipientType}`}
            >
              <button 
                disabled={!inputValue || hasInsufficientBalance}
                className="w-full py-4 rounded-2xl bg-[#D364DB] text-white font-bold text-lg shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.8)] hover:-translate-y-1 transition-all disabled:opacity-50 disabled:transform-none disabled:shadow-none"
              >
                Review Payment
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BankAmountPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F6EDFF]/50 dark:bg-[#252525] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#D364DB] to-[#C554CB] rounded-full animate-pulse" />
          <p className="text-sm text-gray-600 dark:text-purple-100/60 font-medium">Loading...</p>
        </div>
      </div>
    }>
      <BankAmountContent />
    </Suspense>
  );
}