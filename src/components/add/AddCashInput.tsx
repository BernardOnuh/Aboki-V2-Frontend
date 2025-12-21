"use client"

import { useState, useMemo, useEffect } from "react";
import { 
  ChevronLeftIcon, 
  ArrowPathIcon, 
  ShieldCheckIcon, 
  InformationCircleIcon,
  CheckCircleIcon,
  PhoneIcon,
  XMarkIcon,
  PencilIcon
} from "@heroicons/react/24/outline";

const TIER_1_LIMIT = 50000; // 50k Naira limit
const API_BASE_URL = "https://apis.aboki.xyz/api";
const FEE_PERCENTAGE = 1.5;
const MAX_FEE = 2000;

interface UserData {
  _id: string;
  name: string;
  username: string;
  email: string;
  wallet: {
    ownerAddress: string;
    smartAccountAddress: string;
    network: string;
  };
  createdAt: string;
}

export default function AddCashInput() {
  const [ngnAmount, setNgnAmount] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [error, setError] = useState("");
  const [paymentData, setPaymentData] = useState<any>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [fetchingUser, setFetchingUser] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(1450);
  const [fetchingRate, setFetchingRate] = useState(true);
  const [rateSource, setRateSource] = useState("");
  const [showFeeInfo, setShowFeeInfo] = useState(false);

  // Calculate fee and totals
  const calculateFeeAndTotal = useMemo(() => {
    const amount = parseFloat(ngnAmount || "0");
    const feeAmount = Math.min((amount * FEE_PERCENTAGE) / 100, MAX_FEE);
    const totalPayable = amount + feeAmount;
    const usdcAmount = amount / exchangeRate;
    
    return {
      feeAmount,
      totalPayable,
      usdcAmount: usdcAmount.toFixed(2)
    };
  }, [ngnAmount, exchangeRate]);

  // Format Display (e.g., 50,000)
  const displayNgn = ngnAmount ? parseInt(ngnAmount).toLocaleString() : "";

  // Calculate USDC (based on amount only, not total)
  const usdReceive = calculateFeeAndTotal.usdcAmount;

  // Check Limit
  const rawAmount = parseFloat(ngnAmount || "0");
  const isOverLimit = rawAmount > TIER_1_LIMIT;
  const progressPercent = Math.min(100, (rawAmount / TIER_1_LIMIT) * 100);

  const handleInput = (val: string) => {
    const clean = val.replace(/[^\d]/g, "");
    setNgnAmount(clean);
    setError("");
  };

  const handlePhoneInput = (val: string) => {
    const clean = val.replace(/[^\d]/g, "");
    if (clean.length <= 11) {
      setPhoneNumber(clean);
    }
  };

  // Fetch exchange rate on mount
  useEffect(() => {
    const fetchRate = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/onramp/rate`);
        const data = await response.json();
        
        if (data.success && data.data) {
          setExchangeRate(data.data.onrampRate);
          setRateSource(data.data.source || "API");
        }
      } catch (err) {
        console.error("Failed to fetch exchange rate:", err);
        // Keep default rate
      } finally {
        setFetchingRate(false);
      }
    };

    fetchRate();
  }, []);

  // Fetch user data on mount (non-blocking)
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("aboki_auth_token");
        
        if (!token) {
          setAuthError(true);
          setFetchingUser(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/users/me`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "accept": "application/json"
          }
        });

        if (response.status === 401) {
          setAuthError(true);
          setFetchingUser(false);
          return;
        }

        const data = await response.json();
        if (data.success && data.data) {
          setUserData(data.data);
          setAuthError(false);
        }
      } catch (err) {
        console.error("Failed to fetch user data:", err);
      } finally {
        setFetchingUser(false);
      }
    };

    fetchUserData();
  }, []);

  const verifyPayment = async (reference: string) => {
    setProcessingPayment(true);
    try {
      const token = localStorage.getItem("aboki_auth_token");
      if (!token) {
        setError("Authentication required. Please log in.");
        setProcessingPayment(false);
        return;
      }
      
      const maxAttempts = 60;
      let attempts = 0;

      const checkStatus = async (): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/onramp/verify/${reference}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "accept": "application/json"
          }
        });

        if (response.status === 401) {
          setError("Session expired. Please log in again.");
          setProcessingPayment(false);
          return;
        }

        const data = await response.json();

        if (data.success && data.data.status === "COMPLETED") {
          setShowSuccessModal(true);
          setProcessingPayment(false);
          setLoading(false);
          return;
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 2000);
        } else {
          setError("Payment verification taking longer than expected. Check your transaction history.");
          setProcessingPayment(false);
          setLoading(false);
        }
      };

      await checkStatus();
    } catch (err: any) {
      setError(err.message || "Failed to verify payment");
      setProcessingPayment(false);
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (!ngnAmount || isOverLimit) return;

    const token = localStorage.getItem("aboki_auth_token");
    if (!token || authError) {
      setError("Please log in to continue with your purchase");
      setTimeout(() => {
        window.location.href = "/auth";
      }, 2000);
      return;
    }

    // Clear any previous errors
    setError("");

    // Show phone modal if no phone number
    if (!phoneNumber) {
      setShowPhoneModal(true);
      return;
    }

    // Proceed with payment
    initializeMonnify();
  };

  const initializeMonnify = async () => {
    const token = localStorage.getItem("aboki_auth_token");
    if (!token) {
      setError("Authentication required. Please log in.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/onramp/initialize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "accept": "application/json"
        },
        body: JSON.stringify({
          amountNGN: parseFloat(ngnAmount),
          customerEmail: userData?.email || "user@example.com",
          customerPhone: phoneNumber
        })
      });

      if (response.status === 401) {
        setError("Session expired. Please log in again.");
        setLoading(false);
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to initialize payment");
      }

      if (data.success && data.data) {
        setPaymentData(data.data);
        setShowPhoneModal(false);
        
        // Initialize Monnify SDK
        if (typeof window !== 'undefined' && (window as any).MonnifySDK) {
          (window as any).MonnifySDK.initialize({
            ...data.data.monnifyConfig,
            onComplete: (response: any) => {
              console.log("Payment completed:", response);
              verifyPayment(data.data.paymentReference);
            },
            onClose: () => {
              console.log("Payment modal closed");
              setLoading(false);
            }
          });
        } else {
          setError("Payment system not loaded. Please refresh the page.");
          setLoading(false);
        }
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const handleBackToHome = () => {
    setShowSuccessModal(false);
    setNgnAmount("");
    setPhoneNumber("");
    setPaymentData(null);
    setShowPhoneModal(false);
    window.location.href = "/";
  };

  const handleEditAmount = () => {
    setShowPhoneModal(false);
  };

  const isPhoneValid = phoneNumber.length === 11 && phoneNumber.startsWith("0");

  return (
    <div className="min-h-screen bg-[#F6EDFF]/50 dark:bg-[#252525] flex justify-center">
      <main className="w-full max-w-[1080px] min-h-screen bg-[#F6EDFF]/50 dark:bg-[#252525] pb-20 transition-colors duration-300 overflow-hidden flex flex-col">
        
        {/* Header */}
        <header className="px-6 py-6 flex items-center justify-between relative">
          <button 
            onClick={() => window.history.back()}
            className="p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-[#3d3d3d] transition-colors"
          >
            <ChevronLeftIcon className="w-6 h-6 text-slate-900 dark:text-white" />
          </button>
          <h1 className="absolute left-1/2 -translate-x-1/2 font-bold text-xl text-slate-900 dark:text-white">
            Buy USDC
          </h1>
          <div className="w-8" />
        </header>

        <div className="flex-1 px-6 mt-4 flex flex-col items-center">
          
          {/* Rate Pill */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-[#3d3d3d] px-4 py-2 rounded-full mb-8 shadow-sm">
            <ArrowPathIcon className={`w-4 h-4 text-[#D364DB] ${fetchingRate ? 'animate-spin' : ''}`} />
            <span className="text-sm font-bold text-slate-700 dark:text-gray-300">
              $1 = ₦{exchangeRate.toLocaleString()}
            </span>
            
          </div>

          {/* Input Section */}
          <div className="w-full relative flex flex-col items-center gap-3 mb-8">
            <label className="text-sm font-bold text-slate-600 dark:text-gray-400 uppercase tracking-wide">
              Enter Amount
            </label>
            <div className="flex items-center justify-center gap-1">
              <span className={`text-6xl font-bold tracking-tighter transition-colors ${ngnAmount ? 'text-slate-900 dark:text-white' : 'text-slate-300 dark:text-gray-600'}`}>
                ₦
              </span>
              <input 
                type="tel" 
                placeholder="0" 
                autoFocus
                value={displayNgn}
                onChange={(e) => handleInput(e.target.value)}
                className="w-full max-w-[320px] bg-transparent text-6xl font-bold tracking-tighter text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-gray-600 text-center focus:outline-none p-0 border-none"
              />
            </div>
            
            {/* USDC Estimate & Fee Breakdown */}
            {ngnAmount && (
              <div className="space-y-3 w-full max-w-md">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-5 py-2.5 rounded-xl text-base font-bold shadow-sm text-center">
                  ≈ {usdReceive} USDC
                </div>

                {/* Fee Breakdown */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 px-4 py-3 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <InformationCircleIcon 
                        className="w-5 h-5 text-blue-600 dark:text-blue-400 cursor-pointer"
                        onClick={() => setShowFeeInfo(!showFeeInfo)}
                      />
                      <span className="text-sm font-bold text-blue-800 dark:text-blue-300">
                        Transaction Breakdown
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between text-slate-700 dark:text-gray-300">
                      <span>USDC Value:</span>
                      <span className="font-semibold">₦{displayNgn}</span>
                    </div>
                    <div className="flex justify-between text-slate-700 dark:text-gray-300">
                      <span className="flex items-center gap-1">
                        Service Fee ({FEE_PERCENTAGE}%):
                      </span>
                      <span className="font-semibold">₦{calculateFeeAndTotal.feeAmount.toLocaleString()}</span>
                    </div>
                    <div className="pt-2 border-t border-blue-200 dark:border-blue-700 flex justify-between text-blue-800 dark:text-blue-300 font-bold">
                      <span>Total to Pay:</span>
                      <span>₦{calculateFeeAndTotal.totalPayable.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Fee Explanation */}
                  {showFeeInfo && (
                    <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700 text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                      <p className="font-bold mb-1">Why this fee?</p>
                      <p>This {FEE_PERCENTAGE}% fee covers:</p>
                      <ul className="mt-1 ml-4 space-y-0.5 list-disc">
                        <li>Payment processing costs (Monnify gateway)</li>
                        <li>Blockchain gas fees for USDC transfer</li>
                        <li>Platform maintenance and security</li>
                      </ul>
                      <p className="mt-2 text-blue-600 dark:text-blue-300 font-semibold">
                        Fee is capped at ₦{MAX_FEE.toLocaleString()} maximum
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Amounts */}
          <div className="w-full mb-8">
            <p className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-3 text-center">
              Quick Select
            </p>
            <div className="flex gap-3 mx-auto justify-center">
              {["5000", "10000", "20000", "50000"].map((val) => (
                <button 
                  key={val}
                  onClick={() => handleInput(val)}
                  className={`px-6 py-3 rounded-2xl font-bold transition-all shadow-sm hover:shadow-md ${
                    ngnAmount === val
                      ? 'bg-[#D364DB] text-white border-2 border-[#D364DB] scale-105'
                      : 'bg-white dark:bg-[#404040] border-2 border-slate-200 dark:border-[#A3A3A3] text-slate-700 dark:text-gray-200 hover:border-[#D364DB]'
                  }`}
                >
                  ₦{(parseInt(val)/1000)}k
                </button>
              ))}
            </div>
          </div>

          {/* KYC Limit Bar */}
          <div className="w-full bg-gradient-to-br from-white to-slate-50 dark:from-[#404040] dark:to-[#383838] p-6 rounded-3xl border border-slate-200 dark:border-[#A3A3A3] shadow-lg">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <ShieldCheckIcon className="w-5 h-5 text-[#D364DB]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Tier 1 Limit</p>
                  <p className="text-xs text-slate-400 dark:text-gray-500">Daily Transaction Limit</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold ${isOverLimit ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
                  ₦{displayNgn || 0}
                </p>
                <p className="text-xs text-slate-400 dark:text-gray-500">/ ₦{TIER_1_LIMIT.toLocaleString()}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 bg-slate-200 dark:bg-[#2d2d2d] rounded-full overflow-hidden mb-4">
              <div 
                className={`h-full transition-all duration-500 rounded-full ${
                  isOverLimit 
                    ? 'bg-gradient-to-r from-red-500 to-red-600' 
                    : 'bg-gradient-to-r from-[#D364DB] to-[#C554CB]'
                }`} 
                style={{ width: `${progressPercent}%` }} 
              />
            </div>

            {isOverLimit && (
              <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <InformationCircleIcon className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-red-600 dark:text-red-400 mb-1">Limit Exceeded</p>
                  <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed">
                    You've exceeded your daily limit. Verify your BVN to increase to ₦500,000.
                  </p>
                </div>
              </div>
            )}

            {!isOverLimit && rawAmount > TIER_1_LIMIT * 0.8 && (
              <div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl">
                <InformationCircleIcon className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                <p className="text-xs text-orange-600 dark:text-orange-400 leading-relaxed">
                  Approaching your daily limit. <span className="font-bold">Verify BVN</span> to increase to ₦500,000.
                </p>
              </div>
            )}

            {!isOverLimit && rawAmount <= TIER_1_LIMIT * 0.8 && (
              <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                <InformationCircleIcon className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-600 dark:text-blue-400 leading-relaxed">
                  You're on <span className="font-bold">Tier 1</span>. Verify your BVN to unlock higher limits.
                </p>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="w-full mt-6 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl flex items-start gap-3 animate-in slide-in-from-top-2">
              <XMarkIcon className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
            </div>
          )}
        </div>

        {/* Continue Button */}
        <div className="p-6 pb-24">
          <button 
            onClick={handleContinue}
            disabled={!ngnAmount || isOverLimit || loading || processingPayment}
            className="w-full py-5 rounded-2xl bg-gradient-to-r from-[#D364DB] to-[#C554CB] text-white font-bold text-lg shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.9)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.9)] transition-all disabled:opacity-50 disabled:transform-none disabled:shadow-none disabled:cursor-not-allowed active:translate-y-0"
          >
            {loading || processingPayment ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                {processingPayment ? "Verifying Payment..." : "Processing..."}
              </span>
            ) : isOverLimit ? (
              "Upgrade Account to Continue"
            ) : (
              `Pay ₦${calculateFeeAndTotal.totalPayable.toLocaleString()}`
            )}
          </button>
        </div>
      </main>

      {/* Phone Number Modal */}
      {showPhoneModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-in fade-in">
          <div className="bg-white dark:bg-[#2d2d2d] rounded-3xl p-8 max-w-md w-full shadow-2xl border border-purple-200/50 dark:border-purple-900/20 animate-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                  <PhoneIcon className="w-6 h-6 text-[#D364DB]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Phone Number</h2>
                  <p className="text-sm text-slate-500 dark:text-gray-400">Required for transaction</p>
                </div>
              </div>
              <button
                onClick={() => setShowPhoneModal(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-[#3d3d3d] rounded-full transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            {/* Transaction Summary */}
            <div className="mb-6 p-5 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border border-purple-200 dark:border-purple-800">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-xs text-slate-600 dark:text-gray-400 font-medium mb-1">USDC Value</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">₦{displayNgn}</p>
                </div>
                <button
                  onClick={handleEditAmount}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-[#3d3d3d] rounded-lg text-xs font-bold text-[#D364DB] hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all"
                >
                  <PencilIcon className="w-3 h-3" />
                  Edit
                </button>
              </div>
              
              {/* Fee Breakdown in Modal */}
              <div className="space-y-2 py-3 border-y border-purple-200 dark:border-purple-800 text-sm">
                <div className="flex justify-between text-slate-600 dark:text-gray-400">
                  <span>USDC Amount:</span>
                  <span className="font-semibold">{usdReceive} USDC</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-gray-400">
                  <span>Service Fee ({FEE_PERCENTAGE}%):</span>
                  <span className="font-semibold">₦{calculateFeeAndTotal.feeAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3">
                <span className="text-sm text-slate-600 dark:text-gray-400 font-bold">Total to Pay</span>
                <span className="text-2xl font-bold text-[#D364DB]">₦{calculateFeeAndTotal.totalPayable.toLocaleString()}</span>
              </div>
            </div>

            {/* Phone Input */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">
                Nigerian Phone Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="08012345678"
                  value={phoneNumber}
                  onChange={(e) => handlePhoneInput(e.target.value)}
                  className={`w-full px-4 py-4 rounded-xl bg-slate-50 dark:bg-[#3d3d3d] border-2 ${
                    phoneNumber && !isPhoneValid
                      ? 'border-red-300 dark:border-red-700'
                      : 'border-slate-200 dark:border-[#A3A3A3]'
                  } text-slate-900 dark:text-white text-lg font-medium focus:outline-none focus:border-[#D364DB] transition-colors`}
                  maxLength={11}
                  autoFocus
                />
                {phoneNumber && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {isPhoneValid ? (
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    ) : (
                      <span className="text-xs text-red-500 font-medium">{11 - phoneNumber.length} more</span>
                    )}
                  </div>
                )}
              </div>
              {phoneNumber && !isPhoneValid && (
                <p className="text-xs text-red-500 mt-2">Please enter a valid 11-digit Nigerian number</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowPhoneModal(false)}
                className="flex-1 py-4 rounded-xl border-2 border-slate-200 dark:border-[#A3A3A3] text-slate-700 dark:text-white font-bold hover:bg-slate-50 dark:hover:bg-[#3d3d3d] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={initializeMonnify}
                disabled={!isPhoneValid || loading}
                className="flex-1 py-4 rounded-xl bg-gradient-to-r from-[#D364DB] to-[#C554CB] text-white font-bold hover:scale-[1.02] transition-all disabled:opacity-50 disabled:scale-100 shadow-lg disabled:shadow-none"
              >
                {loading ? "Processing..." : "Pay Now"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-in fade-in">
          <div className="bg-white dark:bg-[#2d2d2d] rounded-3xl p-10 max-w-md w-full text-center shadow-2xl border border-green-200 dark:border-green-900/20 animate-in zoom-in">
            <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <CheckCircleIcon className="w-14 h-14 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Payment Successful! 🎉</h2>
            <p className="text-slate-600 dark:text-gray-400 mb-2">
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">{paymentData?.expectedUSDC} USDC</span>
            </p>
            <p className="text-sm text-slate-500 dark:text-gray-500 mb-8">
              has been credited to your wallet
            </p>
            <div className="p-4 bg-slate-50 dark:bg-[#3d3d3d] rounded-xl mb-8">
              <p className="text-xs text-slate-500 dark:text-gray-500 mb-1">Transaction Reference</p>
              <p className="text-sm font-mono text-slate-900 dark:text-white font-medium break-all">
                {paymentData?.paymentReference}
              </p>
            </div>
            <button 
              onClick={handleBackToHome}
              className="w-full py-4 bg-gradient-to-r from-[#D364DB] to-[#C554CB] text-white font-bold rounded-2xl shadow-lg hover:scale-[1.02] transition-all"
            >
              Back to Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
}