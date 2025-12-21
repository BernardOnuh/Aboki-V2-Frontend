"use client"

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  ChevronLeftIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";
import apiClient from "@/lib/api-client";

function ReviewBankContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const name = searchParams.get("name") || "";
  const account = searchParams.get("account") || "";
  const bank = searchParams.get("bank") || "";
  const bankName = searchParams.get("bankName") || "";
  const amountUSDC = searchParams.get("amountUSDC") || "0";
  const amountNGN = searchParams.get("amountNGN") || "0";
  const fee = searchParams.get("fee") || "0";

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"review" | "passkey" | "processing" | "success">("review");
  const [transactionRef, setTransactionRef] = useState("");

  /**
   * Convert base64url to Uint8Array
   * WebAuthn uses base64url encoding (- and _ instead of + and /)
   */
  const base64ToUint8Array = (base64: string): Uint8Array => {
    try {
      // Convert base64url to standard base64
      // Replace URL-safe characters and add padding if needed
      let base64Standard = base64
        .replace(/-/g, '+')
        .replace(/_/g, '/');
      
      // Add padding if needed
      const padLength = (4 - (base64Standard.length % 4)) % 4;
      base64Standard += '='.repeat(padLength);
      
      const binaryString = atob(base64Standard);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
    } catch (err: any) {
      console.error('❌ Base64 decode error:', err);
      console.error('Input string:', base64);
      throw new Error(`Failed to decode base64: ${err.message}`);
    }
  };

  /**
   * Convert Uint8Array to base64url
   * WebAuthn expects base64url format (no padding, URL-safe chars)
   */
  const uint8ArrayToBase64 = (buffer: Uint8Array): string => {
    let binary = '';
    for (let i = 0; i < buffer.byteLength; i++) {
      binary += String.fromCharCode(buffer[i]);
    }
    const base64 = btoa(binary);
    
    // Convert to base64url format (URL-safe, no padding)
    return base64
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  };

  const handleInitiate = async () => {
    setProcessing(true);
    setError("");

    try {
      console.log('📝 Initiating offramp...');
      
      const response = await apiClient.initiateOfframp({
        amountUSDC: parseFloat(amountUSDC),
        accountNumber: account,
        bankCode: bank,
        name: name
      });

      console.log('API Response:', response);

      if (!response.success || !response.data) {
        const errorMessage = response.error || "Failed to initiate transaction";
        console.error('❌ Initiate failed:', errorMessage);
        throw new Error(errorMessage);
      }

      console.log('✅ Offramp initiated:', response.data.transactionReference);
      setTransactionRef(response.data.transactionReference);
      
      // Move to passkey step
      setStep("passkey");
      setProcessing(false);
      
    } catch (err: any) {
      console.error('❌ Initiate error:', err);
      setError(err.message || "Failed to initiate transaction");
      setProcessing(false);
    }
  };

  const handlePasskeyVerification = async () => {
    setProcessing(true);
    setError("");

    try {
      console.log('🔐 Step 1: Getting passkey challenge...');
      
      // Step 2a: Get passkey challenge
      const optionsResponse = await fetch("https://apis.aboki.xyz/api/auth/passkey/transaction-verify-options", {
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
      });

      if (!optionsResponse.ok) {
        const errorData = await optionsResponse.json();
        throw new Error(errorData.error || "Failed to get passkey challenge");
      }

      const options = await optionsResponse.json();
      console.log('✅ Challenge received');
      console.log('Challenge data:', options.data);

      // Step 2b: User performs biometric authentication
      console.log('👆 Requesting biometric authentication...');
      
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: base64ToUint8Array(options.data.challenge),
          timeout: options.data.timeout || 60000,
          rpId: options.data.rpId || "aboki.xyz",
          allowCredentials: [],
          userVerification: "required"
        }
      }) as PublicKeyCredential;

      if (!credential) {
        throw new Error("Passkey verification cancelled");
      }

      console.log('✅ Biometric authentication successful');
      console.log('Credential ID:', credential.id);

      // Step 2c: Verify passkey signature and get verification token
      const response = credential.response as AuthenticatorAssertionResponse;
      console.log('🔐 Verifying passkey signature...');
      
      const verifyPayload = {
        credentialId: credential.id,
        authenticatorData: uint8ArrayToBase64(new Uint8Array(response.authenticatorData)),
        clientDataJSON: uint8ArrayToBase64(new Uint8Array(response.clientDataJSON)),
        signature: uint8ArrayToBase64(new Uint8Array(response.signature)),
        userHandle: response.userHandle ? uint8ArrayToBase64(new Uint8Array(response.userHandle)) : null,
        // ✅ FIXED: Transaction data must be nested object
        transactionData: {
          type: "withdraw",
          amount: parseFloat(amountUSDC),
          recipient: name,
          transactionReference: transactionRef
        }
      };

      console.log('Verify payload:', {
        credentialId: credential.id.slice(0, 20) + '...',
        authenticatorDataLength: verifyPayload.authenticatorData.length,
        clientDataJSONLength: verifyPayload.clientDataJSON.length,
        signatureLength: verifyPayload.signature.length,
        transactionReference: transactionRef
      });
      
      const verifyResponse = await fetch("https://apis.aboki.xyz/api/auth/passkey/transaction-verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiClient.getToken()}`
        },
        body: JSON.stringify(verifyPayload)
      });

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json();
        console.error('❌ Verify failed:', errorData);
        throw new Error(errorData.error || "Passkey verification failed");
      }

      const verifyData = await verifyResponse.json();
      console.log('Verify response:', verifyData);
      
      if (!verifyData.data?.token) {
        throw new Error("No verification token received");
      }

      console.log('✅ Passkey verified, token received');

      // Store the verification token in the API client
      apiClient.setPasskeyVerificationToken(verifyData.data.token);

      // Step 3: Confirm account and sign (with passkey verification)
      setStep("processing");
      console.log('💸 Confirming account and initiating settlement...');
      
      const confirmResponse = await apiClient.confirmOfframpAndSign({
        transactionReference: transactionRef,
        accountNumber: account,
        bankCode: bank
      });

      if (!confirmResponse.success) {
        throw new Error(confirmResponse.error || "Transaction confirmation failed");
      }

      console.log('✅ Settlement initiated:', confirmResponse.data);

      // Clear the passkey verification token
      apiClient.clearPasskeyVerificationToken();

      setStep("success");
      
      setTimeout(() => {
        router.push(`/send/bank-success?ref=${transactionRef}&amount=${amountNGN}&recipient=${encodeURIComponent(name)}&bank=${encodeURIComponent(bankName)}`);
      }, 2000);

    } catch (err: any) {
      console.error("❌ Passkey error:", err);
      console.error("Error stack:", err.stack);
      setError(err.message || "Passkey verification failed");
      setStep("review");
      setProcessing(false);
      apiClient.clearPasskeyVerificationToken();
    }
  };

  return (
    <div className="min-h-screen bg-[#F6EDFF]/50 dark:bg-[#252525] flex justify-center">
      <div className="w-full max-w-[1080px] min-h-screen bg-[#F6EDFF]/50 dark:bg-[#252525] transition-colors duration-300 overflow-hidden flex flex-col">
        
        <header className="px-6 py-6 flex items-center gap-4">
          {step === "review" && (
            <Link href={`/send/amount-ngn?name=${encodeURIComponent(name)}&account=${account}&bank=${bank}&bankName=${encodeURIComponent(bankName)}`} className="p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
              <ChevronLeftIcon className="w-6 h-6 text-slate-900 dark:text-white" />
            </Link>
          )}
          <h1 className="font-bold text-xl text-slate-900 dark:text-white">
            {step === "review" && "Review Payment"}
            {step === "passkey" && "Verify with Passkey"}
            {step === "processing" && "Processing..."}
            {step === "success" && "Success!"}
          </h1>
        </header>

        <div className="flex-1 px-6 flex flex-col justify-center pb-8">
          
          {step === "review" && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#3D3D3D] rounded-3xl p-6 border-2 border-slate-200 dark:border-[#A3A3A3]">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Sending to</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-lg font-bold text-white">
                    {name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-lg text-slate-900 dark:text-white">{name}</p>
                    <p className="text-sm text-slate-500">{bankName}</p>
                    <p className="text-xs text-slate-400 font-mono">{account}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#D364DB] to-[#C554CB] rounded-3xl p-6 text-white">
                <p className="text-xs font-bold uppercase tracking-wider mb-2 opacity-80">They Receive</p>
                <p className="text-4xl font-bold mb-1">₦{parseInt(amountNGN).toLocaleString()}</p>
                <p className="text-sm opacity-80">You send: ${parseFloat(amountUSDC).toFixed(2)} USDC</p>
              </div>

              <div className="bg-white dark:bg-[#3D3D3D] rounded-2xl p-4 border-2 border-slate-200 dark:border-[#A3A3A3] space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">USDC Amount</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">${(parseFloat(amountUSDC) - parseFloat(fee)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Fee (1%)</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">${parseFloat(fee).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Processing Time</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">5-15 mins</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">Total Debit</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">${parseFloat(amountUSDC).toFixed(2)} USDC</span>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl flex items-start gap-3">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold text-red-600 dark:text-red-400 text-sm mb-1">Transaction Failed</p>
                    <p className="text-red-500 dark:text-red-300 text-xs">{error}</p>
                  </div>
                </div>
              )}

              <div className="mt-8 mb-32">
                <button
                  onClick={handleInitiate}
                  disabled={processing}
                  className="w-full py-4 rounded-2xl bg-[#D364DB] text-white font-bold text-lg shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.8)] hover:-translate-y-1 transition-all disabled:opacity-50 disabled:transform-none disabled:shadow-none"
                >
                  {processing ? "Initiating..." : "Confirm Transfer"}
                </button>
              </div>
            </div>
          )}

          {step === "passkey" && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#D364DB] to-[#C554CB] rounded-full flex items-center justify-center">
                <ShieldCheckIcon className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Verify Transaction</h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Use your fingerprint or face ID to authorize this withdrawal
                </p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-2xl">
                <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                  Withdrawing <span className="font-bold">${parseFloat(amountUSDC).toFixed(2)} USDC</span>
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {name} will receive ₦{parseInt(amountNGN).toLocaleString()}
                </p>
              </div>
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl">
                  <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                </div>
              )}

              <div className="mt-8 mb-32">
                <button
                  onClick={handlePasskeyVerification}
                  disabled={processing}
                  className="w-full py-4 rounded-2xl bg-[#D364DB] text-white font-bold text-lg shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.8)] hover:-translate-y-1 transition-all disabled:opacity-50 disabled:transform-none disabled:shadow-none flex items-center justify-center gap-2"
                >
                  <ShieldCheckIcon className="w-5 h-5" />
                  {processing ? "Verifying..." : "Verify with Passkey"}
                </button>
              </div>
            </div>
          )}

          {step === "processing" && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto border-4 border-[#D364DB] border-t-transparent rounded-full animate-spin" />
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Processing Transfer</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-1">
                  Sending ₦{parseInt(amountNGN).toLocaleString()} to {name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  This may take a few moments...
                </p>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircleIcon className="w-12 h-12 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Transfer Initiated!</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-1">
                  ₦{parseInt(amountNGN).toLocaleString()} is on its way to {name}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
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