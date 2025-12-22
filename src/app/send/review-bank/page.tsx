"use client"

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  ChevronLeftIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  ClockIcon
} from "@heroicons/react/24/outline";
import apiClient from "@/lib/api-client";

// ============= CONFIGURATION =============
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://apis.aboki.xyz';
const MAX_RETRIES = 3;
const TRANSACTION_TIMEOUT = 2 * 60 * 1000; // 2 minutes
const TOKEN_EXPIRY_WARNING_MS = 30000; // 30 seconds

// ============= ERROR MESSAGES =============
const ERROR_MESSAGES: Record<string, string> = {
  'PASSKEY_VERIFICATION_REQUIRED': 'Security verification failed. Please try again.',
  'LENCO_ERROR': 'Payment processing issue. Your USDC is safe. Contact support.',
  'INSUFFICIENT_BALANCE': 'Insufficient USDC balance in your wallet.',
  'INVALID_ACCOUNT': 'Invalid bank account details. Please verify.',
  'RATE_EXPIRED': 'Exchange rate expired. Please restart transaction.',
  'TOKEN_EXPIRED': 'Verification expired. Please try again.',
  'NETWORK_ERROR': 'Network error. Please check your connection.',
  'SERVER_ERROR': 'Server error. Please try again in a moment.',
};

// ============= MAIN COMPONENT =============
function ReviewBankContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // URL Parameters
  const name = searchParams.get("name") || "";
  const account = searchParams.get("account") || "";
  const bank = searchParams.get("bank") || "";
  const bankName = searchParams.get("bankName") || "";
  const amountUSDC = searchParams.get("amountUSDC") || "0";
  const amountNGN = searchParams.get("amountNGN") || "0";
  const fee = searchParams.get("fee") || "0";

  // State Management
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"review" | "processing" | "success">("review");
  const [statusMessage, setStatusMessage] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // ============= TIMER FOR ELAPSED TIME =============
  useEffect(() => {
    if (step === "processing") {
      const interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setElapsedTime(0);
    }
  }, [step]);

  // ============= CLEANUP ON UNMOUNT =============
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  // ============= HELPER FUNCTIONS =============

  const base64ToUint8Array = (base64: string): Uint8Array => {
    try {
      let base64Standard = base64
        .replace(/-/g, '+')
        .replace(/_/g, '/');
      
      const padLength = (4 - (base64Standard.length % 4)) % 4;
      base64Standard += '='.repeat(padLength);
      
      const binaryString = atob(base64Standard);
      const buffer = new ArrayBuffer(binaryString.length);
      const bytes = new Uint8Array(buffer);
      
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      return bytes;
    } catch (err: any) {
      console.error('❌ Base64 decode error:', err);
      throw new Error(`Failed to decode base64: ${err.message}`);
    }
  };

  const uint8ArrayToBase64 = (buffer: Uint8Array): string => {
    let binary = '';
    for (let i = 0; i < buffer.byteLength; i++) {
      binary += String.fromCharCode(buffer[i]);
    }
    const base64 = btoa(binary);
    
    return base64
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  };

  const getUserFriendlyError = (error: string): string => {
    // Check for specific error codes
    for (const [code, message] of Object.entries(ERROR_MESSAGES)) {
      if (error.toUpperCase().includes(code)) {
        return message;
      }
    }

    // Check for common error patterns
    if (error.includes("cancelled") || error.includes("abort")) {
      return "You cancelled the verification. Your funds are safe.";
    }
    if (error.includes("timeout") || error.includes("expired")) {
      return "Verification timed out. Please try again.";
    }
    if (error.includes("NotAllowedError") || error.includes("biometric")) {
      return "Biometric authentication failed. Please try again.";
    }
    if (error.includes("challenge") || error.includes("token")) {
      return "Security verification failed. Please try again.";
    }
    if (error.includes("network") || error.includes("fetch")) {
      return "Network error. Please check your connection and try again.";
    }
    if (error.includes("500") || error.includes("Internal Server Error")) {
      return "Server error. Please try again in a moment.";
    }
    if (error.includes("execute Aboki order")) {
      return "Payment processing error. Please try again in a moment.";
    }

    return error || "Transaction failed. Please try again or contact support.";
  };

  const storeTransactionForSuccess = (transactionRef: string) => {
    // Store in sessionStorage for security
    sessionStorage.setItem('lastTransaction', JSON.stringify({
      ref: transactionRef,
      amount: amountNGN,
      recipient: name,
      bank: bankName,
      timestamp: Date.now()
    }));
  };

  // ============= MAIN TRANSACTION HANDLER =============
  
  const handleCompleteTransaction = async () => {
    // Check retry limit
    if (retryCount >= MAX_RETRIES) {
      setError(
        `Maximum retry attempts (${MAX_RETRIES}) reached. Please contact support if the issue persists.`
      );
      return;
    }

    setProcessing(true);
    setError("");
    setStep("processing");
    setElapsedTime(0);
    let transactionRef = "";
    let passkeyTokenTimestamp = 0;

    // Set transaction timeout
    const timeout = setTimeout(() => {
      setError('Transaction timed out. Please try again.');
      setProcessing(false);
      setStep('review');
      setStatusMessage('');
      apiClient.clearPasskeyVerificationToken();
    }, TRANSACTION_TIMEOUT);

    setTimeoutId(timeout);

    try {
      // ============= STEP 1: Initiate Offramp =============
      setStatusMessage("Initiating transaction...");
      console.log('📝 Step 1: Initiating offramp...');
      
      const initiateResponse = await apiClient.initiateOfframp({
        amountUSDC: parseFloat(amountUSDC),
        accountNumber: account,
        bankCode: bank,
        name: name
      });

      if (!initiateResponse.success || !initiateResponse.data) {
        throw new Error(initiateResponse.error || "Failed to initiate transaction");
      }

      transactionRef = initiateResponse.data.transactionReference;
      console.log('✅ Offramp initiated:', transactionRef);

      // ============= STEP 2: Get Passkey Challenge =============
      setStatusMessage("Preparing security verification...");
      console.log('🔐 Step 2: Getting passkey challenge...');
      
      const optionsResponse = await fetch(
        `${API_BASE_URL}/api/auth/passkey/transaction-verify-options`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiClient.getToken()}`
          },
          body: JSON.stringify({
            type: "withdraw",
            amount: parseFloat(amountUSDC),
            recipient: name
          })
        }
      );

      if (!optionsResponse.ok) {
        const errorData = await optionsResponse.json();
        throw new Error(errorData.error || "Failed to get passkey challenge");
      }

      const options = await optionsResponse.json();
      console.log('✅ Challenge received');

      // ============= STEP 3: Biometric Authentication =============
      setStatusMessage("Waiting for biometric verification...");
      console.log('👆 Step 3: Requesting biometric authentication...');
      
      const challengeBuffer = base64ToUint8Array(options.data.challenge);
      
      let credential: PublicKeyCredential | null = null;
      
      try {
        credential = await navigator.credentials.get({
          publicKey: {
            challenge: challengeBuffer as BufferSource,
            timeout: options.data.timeout || 60000,
            rpId: options.data.rpId || "aboki.xyz",
            allowCredentials: [],
            userVerification: "required"
          }
        }) as PublicKeyCredential;
      } catch (credError: any) {
        if (credError.name === 'NotAllowedError') {
          throw new Error("Biometric verification was cancelled or failed");
        }
        throw new Error(`Biometric authentication failed: ${credError.message}`);
      }

      if (!credential) {
        throw new Error("Passkey verification was cancelled");
      }

      console.log('✅ Biometric authentication successful');

      // ============= STEP 4: Verify Passkey =============
      setStatusMessage("Verifying your identity...");
      console.log('🔐 Step 4: Verifying passkey signature...');
      
      const response = credential.response as AuthenticatorAssertionResponse;
      
      const verifyPayload = {
        credentialId: credential.id,
        authenticatorData: uint8ArrayToBase64(new Uint8Array(response.authenticatorData)),
        clientDataJSON: uint8ArrayToBase64(new Uint8Array(response.clientDataJSON)),
        signature: uint8ArrayToBase64(new Uint8Array(response.signature)),
        userHandle: response.userHandle 
          ? uint8ArrayToBase64(new Uint8Array(response.userHandle)) 
          : null,
        transactionData: {
          type: "withdraw",
          amount: parseFloat(amountUSDC),
          recipient: name,
          transactionReference: transactionRef
        }
      };
      
      const verifyResponse = await fetch(
        `${API_BASE_URL}/api/auth/passkey/transaction-verify`,
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
        console.error('❌ Verify failed:', errorData);
        throw new Error(errorData.error || "Passkey verification failed");
      }

      const verifyData = await verifyResponse.json();
      
      if (!verifyData.data?.token) {
        throw new Error("No verification token received");
      }

      // Store token timestamp for expiration tracking
      passkeyTokenTimestamp = Date.now();
      apiClient.setPasskeyVerificationToken(verifyData.data.token);
      
      console.log('✅ Passkey verified, token received');
      console.log(`   Token valid for: ${Math.round((apiClient.getPasskeyTokenTimeRemaining() || 0) / 1000)}s`);

      // ============= STEP 5: Confirm and Settle =============
      setStatusMessage("Processing payment...");
      console.log('💸 Step 5: Confirming account and initiating settlement...');
      
      // Check if token is still valid before using
      const timeRemaining = apiClient.getPasskeyTokenTimeRemaining() || 0;
      if (timeRemaining < 5000) { // Less than 5 seconds
        throw new Error("Verification token expired. Please try again.");
      }

      if (timeRemaining < TOKEN_EXPIRY_WARNING_MS) {
        console.warn(`⚠️ Token expiring soon: ${Math.round(timeRemaining / 1000)}s remaining`);
      }
      
      const confirmResponse = await apiClient.confirmOfframpAndSign({
        transactionReference: transactionRef,
        accountNumber: account,
        bankCode: bank
      });

      if (!confirmResponse.success) {
        throw new Error(confirmResponse.error || "Transaction confirmation failed");
      }

      console.log('✅ Settlement initiated:', confirmResponse.data);
      apiClient.clearPasskeyVerificationToken();

      // Clear timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
        setTimeoutId(null);
      }

      // Store transaction details securely
      storeTransactionForSuccess(transactionRef);

      setStatusMessage("Transaction successful!");
      setStep("success");
      setRetryCount(0); // Reset retry count on success
      
      // Redirect to success page
      setTimeout(() => {
        router.push(`/send/bank-success?ref=${transactionRef}`);
      }, 2000);

    } catch (err: any) {
      console.error("❌ Transaction error:", err);
      console.error("Error stack:", err.stack);
      
      // Clear timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
        setTimeoutId(null);
      }
      
      // Get user-friendly error message
      const errorMessage = getUserFriendlyError(err.message);
      
      setError(errorMessage);
      setStep("review");
      setProcessing(false);
      setStatusMessage("");
      setRetryCount(prev => prev + 1);
      
      // Always clear token on error to ensure fresh state for retry
      apiClient.clearPasskeyVerificationToken();
    }
  };

  // ============= RENDER =============

  return (
    <div className="bg-[#F6EDFF]/50 dark:bg-[#252525]">
      <div className="w-full max-w-[1080px] mx-auto bg-[#F6EDFF]/50 dark:bg-[#252525] transition-colors duration-300 min-h-screen">
        
        {/* Header */}
        <header className="px-6 py-6 flex items-center gap-4 sticky top-0 bg-[#F6EDFF] dark:bg-[#252525] z-10 border-b border-slate-200/50 dark:border-slate-700/50">
          {step === "review" && (
            <Link 
              href={`/send/amount-ngn?name=${encodeURIComponent(name)}&account=${account}&bank=${bank}&bankName=${encodeURIComponent(bankName)}`} 
              className="p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronLeftIcon className="w-6 h-6 text-slate-900 dark:text-white" />
            </Link>
          )}
          <h1 className="font-bold text-xl text-slate-900 dark:text-white">
            {step === "review" && "Review Payment"}
            {step === "processing" && "Processing Payment"}
            {step === "success" && "Payment Successful"}
          </h1>
        </header>

        <div className="px-6 pt-4" style={{ paddingBottom: '250px' }}>
          
          {/* ============= REVIEW STEP ============= */}
          {step === "review" && (
            <div className="space-y-6 max-w-md mx-auto w-full">
              
              {/* Recipient Info */}
              <div className="bg-white dark:bg-[#3D3D3D] rounded-2xl p-5 border-2 border-slate-200 dark:border-[#A3A3A3]">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                  Sending to
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-lg font-bold text-white shrink-0">
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-base text-slate-900 dark:text-white truncate">
                      {name}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                      {bankName}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500 font-mono">
                      {account}
                    </p>
                  </div>
                </div>
              </div>

              {/* Amount Card */}
              <div className="bg-gradient-to-br from-[#D364DB] to-[#C554CB] rounded-2xl p-6 text-white">
                <p className="text-xs font-bold uppercase tracking-wider mb-2 opacity-90">
                  They'll Receive
                </p>
                <p className="text-4xl font-bold mb-3">
                  ₦{parseFloat(amountNGN).toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2
                  })}
                </p>
                <div className="bg-white/20 rounded-lg px-3 py-2 backdrop-blur-sm">
                  <p className="text-sm opacity-90">
                    You'll send: <span className="font-bold">${parseFloat(amountUSDC).toFixed(2)} USDC</span>
                  </p>
                </div>
              </div>

              {/* Transaction Details */}
              <div className="bg-white dark:bg-[#3D3D3D] rounded-2xl p-5 border-2 border-slate-200 dark:border-[#A3A3A3] space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Amount</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    ${(parseFloat(amountUSDC) - parseFloat(fee)).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Transaction Fee</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    ${parseFloat(fee).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Estimated Time</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">5-15 mins</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t-2 border-slate-200 dark:border-slate-700">
                  <span className="text-base font-bold text-slate-900 dark:text-white">Total</span>
                  <span className="text-base font-bold text-slate-900 dark:text-white">
                    ${parseFloat(amountUSDC).toFixed(2)} USDC
                  </span>
                </div>
              </div>

              {/* Error Message with Retry Info */}
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl">
                  <div className="flex items-start gap-3">
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-red-600 dark:text-red-400 text-sm mb-1">
                        Payment Failed
                      </p>
                      <p className="text-red-600 dark:text-red-300 text-xs mb-2">
                        {error}
                      </p>
                      {retryCount > 0 && (
                        <p className="text-red-500 dark:text-red-400 text-xs">
                          Attempt {retryCount + 1} of {MAX_RETRIES} - Your funds are safe
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Security Notice */}
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                <div className="flex items-start gap-3">
                  <ShieldCheckIcon className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-purple-900 dark:text-purple-300 mb-1">
                      Secure Transaction
                    </p>
                    <p className="text-xs text-purple-700 dark:text-purple-400">
                      You'll be asked to verify with your fingerprint or face ID
                    </p>
                  </div>
                </div>
              </div>

              {/* Confirm Button */}
              <button
                onClick={handleCompleteTransaction}
                disabled={processing || retryCount >= MAX_RETRIES}
                className="w-full py-4 rounded-2xl bg-[#D364DB] text-white font-bold text-lg shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.8)] hover:-translate-y-1 transition-all disabled:opacity-50 disabled:transform-none disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ShieldCheckIcon className="w-5 h-5" />
                {processing ? "Processing..." : retryCount >= MAX_RETRIES ? "Max Retries Reached" : "Confirm & Pay"}
              </button>

              {retryCount >= MAX_RETRIES && (
                <p className="text-center text-sm text-red-600 dark:text-red-400">
                  Please contact support for assistance
                </p>
              )}
            </div>
          )}

          {/* ============= PROCESSING STEP ============= */}
          {step === "processing" && (
            <div className="text-center space-y-6 max-w-md mx-auto">
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 border-4 border-purple-200 dark:border-purple-900 rounded-full" />
                <div className="absolute inset-0 border-4 border-[#D364DB] border-t-transparent rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <ArrowPathIcon className="w-8 h-8 text-[#D364DB]" />
                </div>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  {statusMessage || "Processing..."}
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mb-2">
                  Sending ₦{parseFloat(amountNGN).toLocaleString()} to {name}
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-500">
                  <ClockIcon className="w-4 h-4" />
                  <span>{elapsedTime}s elapsed (typically takes 30-60s)</span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
                  Please don't close this window
                </p>
              </div>

              {/* Progress Steps */}
              <div className="bg-white dark:bg-[#3D3D3D] rounded-2xl p-5 border-2 border-slate-200 dark:border-[#A3A3A3] text-left">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                      <CheckCircleIcon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      Transaction initiated
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full border-2 border-[#D364DB] flex items-center justify-center shrink-0">
                      <div className="w-2 h-2 bg-[#D364DB] rounded-full animate-pulse" />
                    </div>
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {statusMessage}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============= SUCCESS STEP ============= */}
          {step === "success" && (
            <div className="text-center space-y-6 max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                <CheckCircleIcon className="w-14 h-14 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  Payment Successful!
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mb-2">
                  ₦{parseFloat(amountNGN).toLocaleString()} is on its way to {name}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-500">
                  Estimated arrival: 5-15 minutes
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ============= EXPORTED COMPONENT WITH SUSPENSE =============

export default function ReviewBankPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F6EDFF]/50 dark:bg-[#252525] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#D364DB] to-[#C554CB] rounded-full animate-pulse" />
          <p className="text-sm text-gray-600 dark:text-purple-100/60 font-medium">Loading...</p>
        </div>
      </div>
    }>
      <ReviewBankContent />
    </Suspense>
  );
}