"use client"

import { Suspense, useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  CheckCircleIcon, 
  ArrowTopRightOnSquareIcon,
  InformationCircleIcon,
  BuildingLibraryIcon
} from "@heroicons/react/24/outline";

function OfframpSuccessContent() {
  const searchParams = useSearchParams();
  
  // ✅ Use state to handle hydration issues
  const [isClient, setIsClient] = useState(false);
  const [paramData, setParamData] = useState<any>(null);
  
  // ✅ Use useRef to cache parsed values
  const cachedDataRef = useRef<any>(null);

  // ✅ Parse parameters only on client side
  useEffect(() => {
    setIsClient(true);
    
    if (searchParams && !cachedDataRef.current) {
      const data = {
        txHash: searchParams.get("txHash") || searchParams.get("hash") || "",
        amountUSDC: parseFloat(searchParams.get("amountUSDC") || "0"),
        amountNGN: parseFloat(searchParams.get("amountNGN") || searchParams.get("amount") || "0"),
        feeUSDC: parseFloat(searchParams.get("feeUSDC") || "0"),
        feeNGN: parseFloat(searchParams.get("feeNGN") || "0"),
        rate: parseFloat(searchParams.get("rate") || "1600"),
        accountName: searchParams.get("accountName") || searchParams.get("recipient") || "Your Account",
        bankName: searchParams.get("bankName") || searchParams.get("bank") || "",
        recipientType: searchParams.get("recipientType") || "bank",
        reference: searchParams.get("reference") || searchParams.get("ref") || searchParams.get("paymentReference") || "",
      };
      
      cachedDataRef.current = data;
      setParamData(data);
      
      console.log("✅ Parsed data:", data);
    }
  }, [searchParams]);

  if (!isClient || !paramData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F6EDFF]/50 dark:bg-[#252525]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#D364DB] to-[#C554CB] rounded-full animate-pulse" />
          <p className="text-sm text-gray-600 dark:text-purple-100/60 font-medium">Loading success page...</p>
        </div>
      </div>
    );
  }

  const {
    txHash,
    amountUSDC,
    amountNGN,
    feeUSDC,
    feeNGN,
    rate,
    accountName,
    bankName,
    recipientType,
    reference,
  } = paramData;

  // Create explorer URL (Base Mainnet)
  const explorerUrl = txHash ? `https://basescan.org/tx/${txHash}` : "";

  // Calculate the net USDC sent (without fee) if amountUSDC is available
  const netUSDC = amountUSDC > 0 ? amountUSDC - feeUSDC : 0;

  // Format NGN with proper decimal handling
  const formattedNGN = amountNGN.toLocaleString('en-NG', {
    minimumFractionDigits: amountNGN % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2
  });

  const formattedFeeNGN = feeNGN.toLocaleString('en-NG', {
    minimumFractionDigits: feeNGN % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2
  });

  // ✅ Debug logging
  console.log("📊 Display Values:", {
    amountNGN,
    formattedNGN,
    amountUSDC,
    feeNGN,
    bankName,
    accountName,
  });

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
      <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2 text-center">
        {recipientType === "business" ? "Payment Sent! ✅" : "Offramp Successful! ✅"}
      </h1>
      <p className="text-slate-500 dark:text-slate-400 text-center mb-8 max-w-sm">
        {recipientType === "business" 
          ? "Your USDC has been sent to the business account"
          : "Your USDC has been sent and NGN settlement is in progress"
        }
      </p>

      {/* Main Transaction Card */}
      <div className="w-full max-w-md bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 rounded-3xl p-8 mb-6 shadow-lg">
        
        {/* Amount Received */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            {recipientType === "business" ? (
              <BuildingLibraryIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
            ) : null}
            <p className="text-sm font-bold text-green-600 dark:text-green-400">
              {recipientType === "business" ? "PAYMENT SENT TO" : "YOU'LL RECEIVE IN YOUR BANK"}
            </p>
          </div>
          <p className="text-5xl font-bold text-green-700 dark:text-green-300">
            ₦{formattedNGN}
          </p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-2">
            {bankName || (recipientType === "business" ? "Business Account" : "Bank")}
          </p>
          {accountName && accountName !== "Your Account" && (
            <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
              {accountName}
            </p>
          )}
        </div>

        <div className="border-t-2 border-green-200 dark:border-green-800 pt-6 space-y-4">
          {/* USDC Sent (if available) */}
          {amountUSDC > 0 && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                  USDC Sent
                </span>
                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  {amountUSDC.toFixed(6)} USDC
                </span>
              </div>

              {/* Net USDC (for your understanding) */}
              <div className="flex justify-between items-center pb-4 border-b border-green-200 dark:border-green-800/50">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  After Fee Deduction
                </span>
                <span className="text-sm font-mono text-slate-900 dark:text-white">
                  {netUSDC.toFixed(6)} USDC
                </span>
              </div>
            </>
          )}

          {/* Exchange Rate Info */}
          {amountUSDC > 0 && (
            <div className="flex justify-between items-center pb-4 border-b border-green-200 dark:border-green-800/50">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                Exchange Rate <span className="text-xs text-slate-400">(at time of send)</span>
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                $1 = ₦{rate.toLocaleString()}
              </span>
            </div>
          )}

          {/* Fee Breakdown - CLEAR DISTINCTION */}
          {feeNGN > 0 && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-xs font-bold text-red-600 dark:text-red-400 mb-3 flex items-center gap-2">
                <InformationCircleIcon className="w-4 h-4" />
                TRANSACTION FEE (NOT EXCHANGE RATE)
              </p>
              <div className="space-y-2">
                {feeUSDC > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-red-700 dark:text-red-300">Fee in USD</span>
                    <span className="font-bold text-red-700 dark:text-red-300">${feeUSDC.toFixed(4)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-red-700 dark:text-red-300">Fee in NGN equivalent</span>
                  <span className="font-bold text-red-700 dark:text-red-300">₦{formattedFeeNGN}</span>
                </div>
                <div className="text-xs text-red-600 dark:text-red-400 mt-2">
                  💡 Fee is 1.5% of transaction amount (different from the exchange rate)
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Calculation Breakdown Card (only if we have USDC info) */}
      {amountUSDC > 0 && (
        <div className="w-full max-w-md bg-white dark:bg-[#3D3D3D] border-2 border-slate-200 dark:border-slate-700 rounded-2xl p-6 mb-6">
          <p className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-4">
            HOW YOUR AMOUNT WAS CALCULATED
          </p>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Net USDC (NGN ÷ Rate)</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{netUSDC.toFixed(6)}</span>
            </div>
            {feeUSDC > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">+ Fee (1.5%)</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">${feeUSDC.toFixed(6)}</span>
              </div>
            )}
            <div className="border-t border-slate-200 dark:border-slate-600 pt-3 flex justify-between">
              <span className="font-bold text-slate-700 dark:text-slate-300">Total USDC Sent</span>
              <span className="font-bold text-slate-900 dark:text-white text-lg">{amountUSDC.toFixed(6)} USDC</span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-800 dark:text-blue-300">
              ✅ <strong>Result:</strong> You sent exactly <strong>₦{formattedNGN}</strong> to {recipientType === "business" ? "the business" : "your bank account"}
            </p>
          </div>
        </div>
      )}

      {/* Transaction Details */}
      <div className="w-full max-w-md bg-white dark:bg-[#3D3D3D] border-2 border-slate-200 dark:border-slate-700 rounded-3xl p-6 mb-6">
        
        <div className="space-y-4">
          {/* Recipient */}
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-2">
              {recipientType === "business" ? "BUSINESS ACCOUNT" : "RECIPIENT"}
            </span>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
              <div className="font-bold text-slate-900 dark:text-white">
                {accountName}
              </div>
              {bankName && (
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {bankName}
                </div>
              )}
            </div>
          </div>

          {/* Network Fee Status */}
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-2">
              NETWORK STATUS
            </span>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-3">
              <span className="text-sm font-bold text-green-600 dark:text-green-400">
                ✅ Network Fee: FREE (Sponsored)
              </span>
            </div>
          </div>

          {/* Settlement Status */}
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-2">
              SETTLEMENT STATUS
            </span>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3">
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                {recipientType === "business" 
                  ? "⏳ Processing (varies)" 
                  : "⏳ In Progress (5-15 min)"
                }
              </span>
            </div>
          </div>

          {/* Transaction Hash */}
          {txHash ? (
            <div>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-2">
                BLOCKCHAIN HASH
              </span>
              <a 
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors group border-2 border-transparent hover:border-purple-400"
              >
                <span className="flex-1 text-xs font-mono text-slate-600 dark:text-slate-300 truncate">
                  {txHash}
                </span>
                <ArrowTopRightOnSquareIcon className="w-4 h-4 text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 flex-shrink-0" />
              </a>
            </div>
          ) : (
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
              <p className="text-xs text-amber-700 dark:text-amber-300">
                ⏳ Blockchain hash will appear after blockchain confirmation
              </p>
            </div>
          )}

          {/* Reference */}
          {reference && (
            <div className="text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Transaction ID: <span className="font-mono font-bold text-slate-900 dark:text-white break-all">{reference}</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="w-full max-w-md bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-2xl p-4 mb-6">
        <p className="text-sm text-amber-900 dark:text-amber-300">
          <strong>💡 What Happens Next:</strong>
        </p>
        <ul className="text-sm text-amber-900 dark:text-amber-300 mt-2 space-y-1 list-disc list-inside">
          {recipientType === "business" ? (
            <>
              <li>Business receives notification of payment</li>
              <li>Check your email for confirmation</li>
              <li>You can track this on Basescan using the hash</li>
            </>
          ) : (
            <>
              <li>NGN settles in 5-15 minutes</li>
              <li>Check your bank app for the deposit</li>
              <li>You can track this on Basescan using the hash</li>
            </>
          )}
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="w-full max-w-md space-y-3">
        <Link href={recipientType === "business" ? "/send" : "/offramp"} className="block">
          <button className="w-full py-4 rounded-2xl bg-[#D364DB] text-white font-bold text-lg shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.8)] hover:-translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] transition-all">
            {recipientType === "business" ? "Send Again" : "Offramp Again"}
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

export default function OfframpSuccess() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-[#F6EDFF]/50 dark:bg-[#252525]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#D364DB] to-[#C554CB] rounded-full animate-pulse" />
          <p className="text-sm text-gray-600 dark:text-purple-100/60 font-medium">Loading success page...</p>
        </div>
      </div>
    }>
      <OfframpSuccessContent />
    </Suspense>
  );
}