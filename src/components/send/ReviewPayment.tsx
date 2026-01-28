// ============= src/components/ReviewPaymentContent.tsx (WITH PIN MODAL) =============
"use client"

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  ChevronLeftIcon, 
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  LockClosedIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";
import apiClient from "@/lib/api-client";
import PinVerificationModal from "./PinVerificationModal";

function ReviewPaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const username = searchParams.get("username") || "@unknown";
  const amount = searchParams.get("amount") || "0";
  const note = searchParams.get("note") || "";
  const source = searchParams.get("source");
  const avatar = searchParams.get("avatar") || "?";
  const fullAddress = searchParams.get("fullAddress");

  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [explorerUrl, setExplorerUrl] = useState<string | null>(null);
  const [pinVerified, setPinVerified] = useState(false);
  const [verificationToken, setVerificationToken] = useState<string | null>(null);
  
  // PIN modal state
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinAttempts, setPinAttempts] = useState(0);

  // Determine back link based on source
  let backLink = `/send/amount?username=${username}&avatar=${avatar}&source=${source}`;
  if (source === "crypto" && fullAddress) {
    backLink = `/send/amount?username=${encodeURIComponent(username)}&avatar=${avatar}&source=crypto&fullAddress=${encodeURIComponent(fullAddress)}`;
  }

  // ============= PIN VERIFICATION FUNCTION =============
  const handlePinVerification = async (pin: string): Promise<boolean> => {
    setIsVerifying(true);
    setPinError(null);

    try {
      if (!pin || pin.length < 4) {
        setPinError("PIN must be at least 4 digits");
        setIsVerifying(false);
        return false;
      }

      console.log("🔐 Starting PIN verification...");

      // ============= STEP 1: Request verification options =============
      const transactionType = source === "crypto" ? "withdraw" : "send";
      
      console.log('📱 Requesting verification options:', {
        transactionType,
        amount: parseFloat(amount),
        recipient: source === "crypto" ? fullAddress : username.replace('@', '')
      });

      const optionsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://apis.aboki.xyz'}/api/auth/pin/transaction-verify-options`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiClient.getToken()}`
          },
          body: JSON.stringify({
            transactionType,
            amount: parseFloat(amount),
            recipient: source === "crypto" ? fullAddress : username.replace('@', ''),
            message: note || undefined
          })
        }
      );

      if (!optionsResponse.ok) {
        const errorData = await optionsResponse.json();
        console.error('❌ Options request failed:', errorData);
        setPinError(errorData.error || "Failed to get verification options");
        setIsVerifying(false);
        return false;
      }

      const optionsData = await optionsResponse.json();
      console.log('✅ Verification options received');

      // ============= STEP 2: Verify PIN with backend =============
      const verifyPayload = {
        transactionId: optionsData.data.transactionId,
        pin: pin
      };

      console.log('🔐 Verifying PIN with backend...');

      const verifyResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://apis.aboki.xyz'}/api/auth/pin/transaction-verify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiClient.getToken()}`
          },
          body: JSON.stringify(verifyPayload)
        }
      );

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json();
        console.error('❌ Verification failed:', errorData);
        
        // Increment PIN attempts
        const newAttempts = pinAttempts + 1;
        setPinAttempts(newAttempts);

        if (newAttempts >= 3) {
          setPinError("Too many incorrect PIN attempts. Please try again later.");
        } else {
          setPinError(`Incorrect PIN. ${3 - newAttempts} attempt${3 - newAttempts > 1 ? 's' : ''} remaining.`);
        }
        
        setIsVerifying(false);
        return false;
      }

      const verifyData = await verifyResponse.json();

      if (!verifyData.data?.verificationToken) {
        console.error('❌ No verification token in response');
        setPinError("No verification token received");
        setIsVerifying(false);
        return false;
      }

      // ============= STEP 3: Store verification token =============
      console.log('✅ PIN verification successful');
      
      apiClient.setPinVerificationToken(verifyData.data.verificationToken);
      setVerificationToken(verifyData.data.verificationToken);

      setPinVerified(true);
      setShowPinModal(false);
      setPinError(null);
      setIsVerifying(false);
      
      // Auto-proceed to send transaction
      setTimeout(() => {
        handleSendTransaction();
      }, 500);
      
      return true;

    } catch (err: any) {
      console.error("❌ PIN verification error:", err);
      setPinError(err.message || "PIN verification failed");
      setIsVerifying(false);
      return false;
    }
  };

  // ============= SEND TRANSACTION FUNCTION =============
  const handleSendTransaction = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const token = apiClient.getToken();
      if (!token) {
        setError("Please log in to send payments");
        setIsProcessing(false);
        router.push(`/auth?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
        return;
      }

      const pinToken = apiClient.getPinVerificationToken();
      if (!pinToken) {
        console.warn('⚠️ Verification token missing - requesting re-verification');
        setPinVerified(false);
        setShowPinModal(true);
        setIsProcessing(false);
        return;
      }

      console.log('📡 Sending transaction with PIN verification...');

      let response;

      if (source === "crypto") {
        // ============= EXTERNAL WALLET =============
        if (!fullAddress) {
          setError("Invalid wallet address");
          setIsProcessing(false);
          return;
        }

        console.log("🔷 Sending to external wallet:", {
          address: fullAddress.slice(0, 10) + '...',
          amount: parseFloat(amount),
          hasVerificationToken: !!pinToken
        });

        response = await apiClient.sendToExternal({
          address: fullAddress,
          amount: parseFloat(amount),
          message: note || undefined
        });

      } else {
        // ============= USERNAME =============
        const cleanUsername = username.replace('@', '');
        
        console.log("👤 Sending to username:", {
          username: cleanUsername,
          amount: parseFloat(amount),
          hasVerificationToken: !!pinToken
        });

        response = await apiClient.sendToUsername({
          username: cleanUsername,
          amount: parseFloat(amount),
          message: note || undefined
        });
      }

      // ============= HANDLE RESPONSE =============
      if (response.success && response.data) {
        console.log('✅ Transaction successful!');
        setSuccess(true);
        setTxHash(response.data.transactionHash);
        setExplorerUrl(response.data.explorerUrl || null);

        apiClient.clearPinVerificationToken();

        setTimeout(() => {
          router.push(`/send/success?txHash=${response.data!.transactionHash}&amount=${amount}&to=${username}`);
        }, 2000);
      } else {
        console.error('❌ Transaction failed:', response.error);
        
        if (response.error?.includes('verification') || response.error?.includes('PIN')) {
          setPinVerified(false);
          setError("Transaction verification expired. Please verify again.");
          setShowPinModal(true);
        } else {
          setError(response.error || "Transaction failed");
        }

        apiClient.clearPinVerificationToken();
      }
    } catch (err: any) {
      console.error("❌ Send error:", err);
      setError(err.message || "An unexpected error occurred");
      
      apiClient.clearPinVerificationToken();
      setPinVerified(false);
    } finally {
      setIsProcessing(false);
    }
  };

  // ============= INITIATE PAYMENT (SHOWS PIN MODAL) =============
  const handleInitiatePayment = () => {
    if (!pinVerified) {
      setShowPinModal(true);
    } else {
      handleSendTransaction();
    }
  };

  // ============= JSX RENDER =============
  return (
    <div className="w-full max-w-[1080px] mx-auto h-screen bg-[#F6EDFF]/50 dark:bg-[#252525] transition-colors duration-300 flex flex-col">
      
      {/* PIN Verification Modal */}
      <PinVerificationModal
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        onVerify={handlePinVerification}
        isVerifying={isVerifying}
        error={pinError}
        attempts={pinAttempts}
        amount={amount}
        recipient={source === "crypto" && fullAddress ? `${fullAddress.slice(0, 6)}...${fullAddress.slice(-4)}` : username}
      />

      {/* Header - Fixed at top */}
      <header className="flex-shrink-0 px-6 py-4 flex items-center gap-4 border-b border-slate-200 dark:border-slate-700">
        <Link href={backLink} className="p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
          <ChevronLeftIcon className="w-6 h-6 text-slate-900 dark:text-white" />
        </Link>
        <h1 className="font-bold text-xl text-slate-900 dark:text-white">
          Review Payment
        </h1>
      </header>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="flex flex-col items-center">
          
          {/* Error Display */}
          {error && (
            <div className="w-full max-w-md mb-6 p-4 bg-red-100 dark:bg-red-900/30 border-2 border-red-500 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <ExclamationCircleIcon className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-red-900 dark:text-red-200 text-sm mb-1">
                  Transaction Failed
                </p>
                <p className="text-red-700 dark:text-red-300 text-sm">
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* Success Display */}
          {success && (
            <div className="w-full max-w-md mb-6 p-4 bg-green-100 dark:bg-green-900/30 border-2 border-green-500 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-green-900 dark:text-green-200 text-sm mb-1">
                  Payment Successful! 🎉
                </p>
                <p className="text-green-700 dark:text-green-300 text-sm">
                  Redirecting to confirmation...
                </p>
              </div>
            </div>
          )}

          {/* PIN Verification Status */}
          {pinVerified && !success && (
            <div className="w-full max-w-md mb-6 p-4 bg-green-100 dark:bg-green-900/30 border-2 border-green-500 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <ShieldCheckIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
              <div className="flex-1">
                <p className="font-bold text-green-900 dark:text-green-200 text-sm">
                  Verified with PIN ✓
                </p>
                <p className="text-green-700 dark:text-green-300 text-xs">
                  Transaction authenticated and ready to send
                </p>
              </div>
            </div>
          )}

          {/* Payment Summary Card */}
          <div className="w-full max-w-md bg-white dark:bg-[#3D3D3D] border-2 border-slate-200 dark:border-[#A3A3A3] rounded-3xl p-6 shadow-lg mb-4">
            
            {/* Recipient */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
              <div className="w-14 h-14 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-lg font-bold text-purple-600 dark:text-purple-400">
                {avatar}
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Sending to</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white truncate">
                  {username}
                </span>
                {source === "crypto" && fullAddress && (
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400 truncate">
                    {fullAddress.slice(0, 10)}...{fullAddress.slice(-8)}
                  </span>
                )}
              </div>
            </div>

            {/* Amount */}
            <div className="mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-2">Amount</span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-slate-900 dark:text-white">${amount}</span>
                <span className="text-lg text-slate-500">USDC</span>
              </div>
            </div>

            {/* Note */}
            {note && (
              <div className="mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-2">Note</span>
                <p className="text-slate-700 dark:text-slate-200 text-sm italic">
                  "{note}"
                </p>
              </div>
            )}

            {/* Security Info */}
            <div className="mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <LockClosedIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Security</span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-200">
                {pinVerified 
                  ? "✓ Verified with PIN authentication" 
                  : "Requires PIN verification to proceed"
                }
              </p>
            </div>

            {/* Payment Method */}
            <div className="mb-6">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-2">Payment Method</span>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">$</span>
                </div>
                <span className="text-slate-900 dark:text-white font-medium">
                  {source === "crypto" ? "External Wallet (Base)" : "Aboki Balance"}
                </span>
              </div>
            </div>

            {/* Network Fee Info */}
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Network Fee</span>
                <span className="text-sm font-bold text-purple-600 dark:text-purple-400">FREE 🎉</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Gas sponsored by Coinbase
              </p>
            </div>
          </div>

          {/* Transaction Hash (if processing or success) */}
          {(isProcessing || txHash) && (
            <div className="w-full max-w-md mb-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 font-bold">
                {isProcessing ? "Processing Transaction..." : "Transaction Hash"}
              </p>
              {txHash ? (
                <a 
                  href={explorerUrl || `https://basescan.org/tx/${txHash}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm font-mono text-purple-600 dark:text-purple-400 hover:underline break-all"
                >
                  {txHash.slice(0, 20)}...{txHash.slice(-20)}
                </a>
              ) : (
                <div className="flex items-center gap-2">
                  <ArrowPathIcon className="w-4 h-4 animate-spin text-slate-400" />
                  <span className="text-sm text-slate-500 dark:text-slate-400">Confirming on blockchain...</span>
                </div>
              )}
            </div>
          )}

          {/* Action Button */}
          <div className="w-full max-w-md mb-6">
            <button 
              onClick={handleInitiatePayment}
              disabled={isProcessing || success}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-lg shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.8)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] active:translate-y-0 active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : success ? (
                <>
                  <CheckCircleIcon className="w-5 h-5" />
                  Sent Successfully
                </>
              ) : pinVerified ? (
                <>
                  <ShieldCheckIcon className="w-5 h-5" />
                  Complete Payment (FREE)
                </>
              ) : (
                <>
                  <LockClosedIcon className="w-5 h-5" />
                  Verify & Send (FREE)
                </>
              )}
            </button>

            <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-4">
              {pinVerified 
                ? "Your transaction is verified. Click to complete the transfer."
                : "Click to verify with PIN and send payment securely"
              }
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}

export default function ReviewPayment() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F6EDFF]/50 dark:bg-[#252525] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#D364DB]"></div>
      </div>
    }>
      <ReviewPaymentContent />
    </Suspense>
  );
}