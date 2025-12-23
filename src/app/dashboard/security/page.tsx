"use client"
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircleIcon, ExclamationCircleIcon, FingerPrintIcon, ArrowPathIcon, ChevronLeftIcon, ShieldCheckIcon, TrashIcon } from "@heroicons/react/24/outline";
import apiClient from "@/lib/api-client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://apis.aboki.xyz';

// Type definitions
interface UserPasskey {
  credentialID?: string;
  publicKey?: string;
  counter?: number;
}

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
  passkey?: UserPasskey;
  createdAt: string;
}

export default function PasskeySetupPage() {
  const router = useRouter();
  const [step, setStep] = useState<"check" | "setup" | "has_passkey" | "loading" | "success" | "error" | "removing">("check");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [hasExistingPasskey, setHasExistingPasskey] = useState(false);

  // Check if user is authenticated and get profile on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await apiClient.getUserProfile();
        if (response.success && response.data) {
          // Cast the response data to include passkey
          const userData = response.data as UserData;
          setUserData(userData);
          
          // Check if user already has a passkey
          const userHasPasskey = userData?.passkey?.credentialID ? true : false;
          setHasExistingPasskey(userHasPasskey);
          
          if (userHasPasskey) {
            setStep("has_passkey");
          } else {
            setStep("setup");
          }
          setLoading(false);
        }
      } catch (err: any) {
        console.error('Error checking user:', err);
        router.push('/login');
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // ============= HELPER FUNCTIONS =============
  const base64ToUint8Array = (base64: string): Uint8Array => {
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

  const isPasskeySupported = (): boolean => {
    return typeof window !== 'undefined' && 
           typeof window.PublicKeyCredential !== 'undefined' && 
           typeof navigator.credentials !== 'undefined';
  };

  // ============= REMOVE PASSKEY HANDLER =============
  const handleRemovePasskey = async () => {
    setError("");
    setStep("removing");
    setStatusMessage("Removing existing passkey...");

    try {
      const removeResponse = await fetch(
        `${API_BASE_URL}/api/auth/passkey/remove`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiClient.getToken()}`
          }
        }
      );

      const removeData = await removeResponse.json();

      if (!removeResponse.ok || !removeData.success) {
        throw new Error(removeData.error || 'Failed to remove passkey');
      }

      console.log('✅ Existing passkey removed');
      
      // Update state
      setHasExistingPasskey(false);
      setStep("setup");
    } catch (err: any) {
      console.error('❌ Remove error:', err);
      setError(err.message || 'Failed to remove passkey. Please try again.');
      setStep("has_passkey");
    }
  };

  // ============= MAIN SETUP HANDLER =============
  const handleSetupPasskey = async () => {
    setError("");
    setStep("loading");
    setLoading(true);

    try {
      if (!isPasskeySupported()) {
        throw new Error("Your browser doesn't support passkeys. Please use a modern browser with biometric support.");
      }

      console.log('📝 Step 1: Getting setup options...');
      setStatusMessage("Preparing biometric setup...");

      // ============= STEP 1: Get setup options =============
      const optionsResponse = await fetch(
        `${API_BASE_URL}/api/auth/passkey/setup-options`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiClient.getToken()}`
          }
        }
      );

      if (!optionsResponse.ok) {
        const errorData = await optionsResponse.json();
        throw new Error(errorData.error || 'Failed to get setup options');
      }

      const optionsData = await optionsResponse.json();
      const { options, challenge } = optionsData.data;
      console.log('✅ Setup options received');

      // ============= STEP 2: Request passkey creation =============
      setStatusMessage("Please create a passkey using your fingerprint or face...");
      console.log('👆 Step 2: Requesting passkey creation...');

      const challengeBuffer = base64ToUint8Array(challenge);
      let credential: PublicKeyCredential | null = null;

      try {
        credential = await navigator.credentials.create({
          publicKey: {
            challenge: challengeBuffer as BufferSource,
            rp: {
              name: 'Aboki',
              id: options.rp.id
            },
            user: {
              id: new TextEncoder().encode(userData!.email),
              name: userData!.email,
              displayName: userData!.name
            },
            pubKeyCredParams: options.pubKeyCredParams,
            timeout: 60000,
            attestation: 'direct',
            authenticatorSelection: {
              authenticatorAttachment: 'platform',
              residentKey: 'preferred',
              userVerification: 'preferred'
            }
          }
        }) as PublicKeyCredential;
      } catch (credError: any) {
        if (credError.name === 'NotAllowedError') {
          throw new Error('You cancelled the passkey creation or it timed out');
        }
        throw new Error(`Failed to create passkey: ${credError.message}`);
      }

      if (!credential) {
        throw new Error('Passkey creation was cancelled');
      }

      console.log('✅ Passkey created successfully');

      // ============= STEP 3: Submit to backend =============
      setStatusMessage("Saving your passkey...");
      console.log('📡 Step 3: Submitting passkey...');

      const response = credential.response as AuthenticatorAttestationResponse;
      const attestationObject = new Uint8Array(response.attestationObject as ArrayBuffer);
      const clientDataJSON = new Uint8Array(response.clientDataJSON as ArrayBuffer);

      const setupResponse = await fetch(
        `${API_BASE_URL}/api/auth/passkey/setup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiClient.getToken()}`
          },
          body: JSON.stringify({
            passkey: {
              id: credential.id,
              rawId: uint8ArrayToBase64(new Uint8Array(credential.rawId)),
              type: credential.type,
              response: {
                clientDataJSON: uint8ArrayToBase64(clientDataJSON),
                attestationObject: uint8ArrayToBase64(attestationObject)
              },
              challenge
            }
          })
        }
      );

      const setupData = await setupResponse.json();

      if (!setupResponse.ok || !setupData.success) {
        throw new Error(setupData.error || 'Failed to setup passkey');
      }

      console.log('✅ Passkey saved successfully!');
      setStep("success");

      // Redirect after 3 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);

    } catch (err: any) {
      console.error('❌ Setup error:', err);
      setError(err.message || 'Failed to setup passkey. Please try again.');
      setStep("error");
      setLoading(false);
    }
  };

  // ============= RENDER =============
  if (step === "check" && loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F6EDFF] to-white dark:from-[#1a1a1a] dark:to-[#252525] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#D364DB] to-[#C554CB] rounded-full animate-pulse" />
          <p className="text-slate-600 dark:text-slate-400">Checking your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6EDFF] to-white dark:from-[#1a1a1a] dark:to-[#252525]">
      <div className="max-w-md mx-auto px-6 py-12 flex flex-col justify-center min-h-screen">
        {/* Header with back button */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/dashboard"
            className="p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <ChevronLeftIcon className="w-6 h-6 text-slate-900 dark:text-white" />
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Security Setup
          </h1>
        </div>

        {/* HAS EXISTING PASSKEY STEP */}
        {step === "has_passkey" && (
          <div className="space-y-6">
            {/* Status Message */}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-6 border-2 border-green-200 dark:border-green-800">
              <div className="flex items-start gap-3">
                <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-green-900 dark:text-green-300 mb-2">
                    Passkey Already Active
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-400">
                    You already have a passkey registered on this device. Your transactions are secured with biometric authentication.
                  </p>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-5 border border-blue-200 dark:border-blue-800">
              <h3 className="font-bold text-blue-900 dark:text-blue-300 mb-3">Want to change your passkey?</h3>
              <p className="text-sm text-blue-700 dark:text-blue-400 mb-3">
                You can remove your current passkey and set up a new one. This is useful if:
              </p>
              <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-400">
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>You want to use a different device</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Your biometrics changed</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>You're experiencing issues</span>
                </li>
              </ul>
            </div>

            {/* Remove Button */}
            <button
              onClick={handleRemovePasskey}
              className="w-full py-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              <TrashIcon className="w-5 h-5" />
              Remove Current Passkey
            </button>

            {/* Back Link */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
              <Link
                href="/dashboard"
                className="block text-center text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        )}

        {/* REMOVING PASSKEY STEP */}
        {step === "removing" && (
          <div className="text-center space-y-6">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 border-4 border-red-200 dark:border-red-900 rounded-full" />
              <div className="absolute inset-0 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <TrashIcon className="w-10 h-10 text-red-500" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                {statusMessage}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Please wait...
              </p>
            </div>
          </div>
        )}

        {/* SETUP STEP */}
        {step === "setup" && !loading && (
          <div className="space-y-6">
            {/* Welcome Message */}
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-6 border-2 border-purple-200 dark:border-purple-800">
              <div className="flex items-start gap-3">
                <ShieldCheckIcon className="w-6 h-6 text-purple-600 dark:text-purple-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-purple-900 dark:text-purple-300 mb-2">
                    {hasExistingPasskey ? 'Set Up New Passkey' : `Welcome, ${userData?.name || 'User'}!`}
                  </p>
                  <p className="text-sm text-purple-700 dark:text-purple-400">
                    {hasExistingPasskey 
                      ? 'Your old passkey has been removed. Now set up a new one to secure your account.'
                      : 'Set up biometric security to protect your funds and verify transactions.'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-5 border border-blue-200 dark:border-blue-800">
              <h3 className="font-bold text-blue-900 dark:text-blue-300 mb-3">What is a passkey?</h3>
              <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-400">
                <li className="flex items-start gap-2">
                  <span>✓</span>
                  <span>Uses your fingerprint or face ID</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>✓</span>
                  <span>No passwords to remember</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>✓</span>
                  <span>Required to verify all transactions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>✓</span>
                  <span>More secure than passwords</span>
                </li>
              </ul>
            </div>

            {/* Setup Button */}
            <button
              onClick={handleSetupPasskey}
              className="w-full py-4 rounded-xl bg-[#D364DB] text-white font-bold text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              <FingerPrintIcon className="w-5 h-5" />
              Set Up Passkey Now
            </button>

            {/* Skip Option */}
            {!hasExistingPasskey && (
              <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                You can set this up later, but you'll need it to transfer funds.
              </p>
            )}

            <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
              <Link
                href="/dashboard"
                className="block text-center text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        )}

        {/* LOADING SETUP STEP */}
        {step === "loading" && (
          <div className="text-center space-y-6">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 border-4 border-purple-200 dark:border-purple-900 rounded-full" />
              <div className="absolute inset-0 border-4 border-[#D364DB] border-t-transparent rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <FingerPrintIcon className="w-10 h-10 text-[#D364DB]" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                {statusMessage}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Follow the prompts on your device
              </p>
            </div>
          </div>
        )}

        {/* SUCCESS STEP */}
        {step === "success" && (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 mx-auto bg-green-500 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircleIcon className="w-14 h-14 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                All Set! ✓
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Your passkey is ready. You can now transfer funds with biometric verification.
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-500">
                Redirecting to dashboard...
              </p>
            </div>
          </div>
        )}

        {/* ERROR STEP */}
        {step === "error" && (
          <div className="space-y-6">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl flex items-start gap-3">
              <ExclamationCircleIcon className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-red-600 dark:text-red-400 text-sm mb-1">
                  Setup Failed
                </p>
                <p className="text-red-600 dark:text-red-300 text-sm">
                  {error}
                </p>
              </div>
            </div>

            {/* Retry Button */}
            <button
              onClick={handleSetupPasskey}
              className="w-full py-4 rounded-xl bg-[#D364DB] text-white font-bold text-base shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <ArrowPathIcon className="w-5 h-5" />
              Try Again
            </button>

            {/* Back Link */}
            <Link
              href="/dashboard"
              className="block text-center text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              Back to Dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}