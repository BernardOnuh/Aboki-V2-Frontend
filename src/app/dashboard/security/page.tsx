"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  FingerPrintIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ShieldCheckIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import apiClient from "@/lib/api-client";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://apis.aboki.xyz";

/* =======================
   TYPES
======================= */

interface Passkey {
  credentialID?: string;
  publicKey?: string;
  createdAt?: string;
}

interface User {
  _id: string;
  name: string;
  username: string;
  email: string;
  wallet: {
    ownerAddress: string;
    smartAccountAddress: string;
    network: string;
  };
  passkey?: Passkey | null;
  createdAt: string;
}

type Step =
  | "check"
  | "setup"
  | "has_passkey"
  | "loading"
  | "success"
  | "error"
  | "removing";

/* =======================
   COMPONENT
======================= */

export default function PasskeySetupPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("check");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [userData, setUserData] = useState<User | null>(null);
  const [hasExistingPasskey, setHasExistingPasskey] = useState(false);

  /* =======================
     AUTH CHECK
  ======================= */

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await apiClient.getUserProfile();

        if (response.success && response.data) {
          const user = response.data as User;

          setUserData(user);

          const userHasPasskey = Boolean(user.passkey?.credentialID);
          setHasExistingPasskey(userHasPasskey);

          setStep(userHasPasskey ? "has_passkey" : "setup");
        }
      } catch (err) {
        console.error("Error checking user:", err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  /* =======================
     HELPERS
  ======================= */

  const base64ToUint8Array = (base64: string): Uint8Array => {
    let base64Standard = base64.replace(/-/g, "+").replace(/_/g, "/");
    const padLength = (4 - (base64Standard.length % 4)) % 4;
    base64Standard += "=".repeat(padLength);

    const binaryString = atob(base64Standard);
    const bytes = new Uint8Array(binaryString.length);

    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return bytes;
  };

  const uint8ArrayToBase64 = (buffer: Uint8Array): string => {
    let binary = "";
    buffer.forEach((b) => (binary += String.fromCharCode(b)));
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  };

  const isPasskeySupported = () =>
    typeof window !== "undefined" &&
    "PublicKeyCredential" in window &&
    "credentials" in navigator;

  /* =======================
     REMOVE PASSKEY
  ======================= */

  const handleRemovePasskey = async () => {
    setError("");
    setStep("removing");
    setStatusMessage("Removing existing passkey...");

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/passkey/remove`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiClient.getToken()}`,
        },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to remove passkey");
      }

      setHasExistingPasskey(false);
      setStep("setup");
    } catch (err: any) {
      setError(err.message || "Failed to remove passkey");
      setStep("has_passkey");
    }
  };

  /* =======================
     SETUP PASSKEY
  ======================= */

  const handleSetupPasskey = async () => {
    if (!userData) return;

    setError("");
    setStep("loading");
    setStatusMessage("Preparing biometric setup...");

    try {
      if (!isPasskeySupported()) {
        throw new Error("Your browser does not support passkeys.");
      }

      const optionsRes = await fetch(
        `${API_BASE_URL}/api/auth/passkey/setup-options`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiClient.getToken()}`,
          },
        }
      );

      const optionsJson = await optionsRes.json();
      if (!optionsRes.ok || !optionsJson.success) {
        throw new Error(optionsJson.error || "Failed to get setup options");
      }

      const { options, challenge } = optionsJson.data;
      const challengeBuffer = base64ToUint8Array(challenge);

      setStatusMessage("Please confirm biometrics...");

      const credential = (await navigator.credentials.create({
        publicKey: {
          challenge: challengeBuffer,
          rp: options.rp,
          user: {
            id: new TextEncoder().encode(userData.email),
            name: userData.email,
            displayName: userData.name,
          },
          pubKeyCredParams: options.pubKeyCredParams,
          timeout: 60000,
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            residentKey: "preferred",
            userVerification: "preferred",
          },
        },
      })) as PublicKeyCredential;

      const response = credential.response as AuthenticatorAttestationResponse;

      const setupRes = await fetch(`${API_BASE_URL}/api/auth/passkey/setup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiClient.getToken()}`,
        },
        body: JSON.stringify({
          passkey: {
            id: credential.id,
            rawId: uint8ArrayToBase64(new Uint8Array(credential.rawId)),
            type: credential.type,
            response: {
              clientDataJSON: uint8ArrayToBase64(
                new Uint8Array(response.clientDataJSON)
              ),
              attestationObject: uint8ArrayToBase64(
                new Uint8Array(response.attestationObject)
              ),
            },
            challenge,
          },
        }),
      });

      const setupData = await setupRes.json();
      if (!setupRes.ok || !setupData.success) {
        throw new Error(setupData.error || "Failed to setup passkey");
      }

      setStep("success");
      setTimeout(() => router.push("/dashboard"), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to setup passkey");
      setStep("error");
    }
  };

  /* =======================
     RENDER
  ======================= */

  if (step === "check" && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Checking your account…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6EDFF] to-white dark:from-[#1a1a1a] dark:to-[#252525]">
      <div className="max-w-md mx-auto px-6 py-12 flex flex-col justify-center min-h-screen">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="p-2 rounded-full">
            <ChevronLeftIcon className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-bold">Security Setup</h1>
        </div>

        {/* HAS PASSKEY */}
        {step === "has_passkey" && (
          <div className="space-y-6">
            <div className="bg-green-50 p-6 rounded-xl">
              <p className="font-bold">Passkey Already Active</p>
            </div>

            <button
              onClick={handleRemovePasskey}
              className="w-full py-4 bg-red-500 text-white rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <TrashIcon className="w-5 h-5" />
              Remove Current Passkey
            </button>

            <Link href="/dashboard" className="block text-center text-sm">
              Back to Dashboard
            </Link>
          </div>
        )}

        {/* SETUP */}
        {step === "setup" && (
          <div className="space-y-6">
            <div className="bg-purple-50 p-6 rounded-xl">
              <p className="font-bold">
                Welcome, {userData?.name ?? "User"}!
              </p>
            </div>

            <button
              onClick={handleSetupPasskey}
              className="w-full py-4 bg-[#D364DB] text-white rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <FingerPrintIcon className="w-5 h-5" />
              Set Up Passkey
            </button>

            <Link href="/dashboard" className="block text-center text-sm">
              Back to Dashboard
            </Link>
          </div>
        )}

        {/* LOADING */}
        {step === "loading" && (
          <div className="text-center space-y-4">
            <FingerPrintIcon className="w-12 h-12 mx-auto animate-pulse" />
            <p>{statusMessage}</p>
          </div>
        )}

        {/* SUCCESS */}
        {step === "success" && (
          <div className="text-center space-y-4">
            <CheckCircleIcon className="w-16 h-16 mx-auto text-green-500" />
            <p className="font-bold">Passkey setup complete!</p>
          </div>
        )}

        {/* ERROR */}
        {step === "error" && (
          <div className="space-y-4">
            <div className="bg-red-50 p-4 rounded-xl">
              <p className="text-red-600">{error}</p>
            </div>

            <button
              onClick={handleSetupPasskey}
              className="w-full py-4 bg-[#D364DB] text-white rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <ArrowPathIcon className="w-5 h-5" />
              Try Again
            </button>

            <Link href="/dashboard" className="block text-center text-sm">
              Back to Dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
