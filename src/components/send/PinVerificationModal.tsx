// ============= PinVerificationModal.tsx =============
"use client"

import { useState, useEffect, useRef } from "react";
import { 
  LockClosedIcon, 
  XMarkIcon,
  ShieldCheckIcon,
  ExclamationCircleIcon
} from "@heroicons/react/24/outline";

interface PinVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (pin: string) => Promise<boolean>;
  isVerifying: boolean;
  error: string | null;
  attempts: number;
  amount: string;
  recipient: string;
}

export default function PinVerificationModal({
  isOpen,
  onClose,
  onVerify,
  isVerifying,
  error,
  attempts,
  amount,
  recipient
}: PinVerificationModalProps) {
  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const [showPin, setShowPin] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset PIN when modal opens
  useEffect(() => {
    if (isOpen) {
      setPin(["", "", "", "", "", ""]);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Auto-focus next input
  const handlePinChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }

    if (!/^\d*$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "");
    const newPin = [...pin];
    
    for (let i = 0; i < Math.min(pastedData.length, 6); i++) {
      newPin[i] = pastedData[i];
    }
    
    setPin(newPin);
    
    const nextEmptyIndex = newPin.findIndex(p => !p);
    if (nextEmptyIndex !== -1) {
      inputRefs.current[nextEmptyIndex]?.focus();
    } else {
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const pinString = pin.join("");
    if (pinString.length < 4) return;

    const success = await onVerify(pinString);
    if (!success) {
      setPin(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
  };

  const pinString = pin.join("");
  const isPinComplete = pinString.length >= 4;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-[#2D2D2D] rounded-3xl shadow-2xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-10"
        >
          <XMarkIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" />
        </button>

        {/* Header with animated gradient */}
        <div className="relative bg-gradient-to-br from-purple-500 via-purple-600 to-pink-500 p-8 text-center overflow-hidden">
          {/* Animated background orbs */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-white/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-pink-300/20 rounded-full blur-3xl animate-pulse delay-1000" />
          
          <div className="relative z-10">
            <div className="w-16 h-16 mx-auto mb-4 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
              <LockClosedIcon className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Verify Transaction
            </h2>
            <p className="text-purple-100 text-sm">
              Enter your PIN to authorize this payment
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Transaction Summary */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-4 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                Amount
              </span>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                ${amount}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                To
              </span>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
                {recipient}
              </span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-4 flex items-start gap-3 animate-in slide-in-from-top-2">
              <ExclamationCircleIcon className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900 dark:text-red-200">
                  {error}
                </p>
                {attempts > 0 && attempts < 3 && (
                  <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                    {3 - attempts} attempt{3 - attempts > 1 ? 's' : ''} remaining
                  </p>
                )}
              </div>
            </div>
          )}

          {/* PIN Input */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Enter PIN
              </label>
              <button
                onClick={() => setShowPin(!showPin)}
                className="text-xs font-medium text-purple-600 dark:text-purple-400 hover:underline"
              >
                {showPin ? "Hide" : "Show"}
              </button>
            </div>

            <div className="flex gap-2 justify-center" onPaste={handlePaste}>
              {pin.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type={showPin ? "text" : "password"}
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handlePinChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  disabled={isVerifying}
                  className={`
                    w-12 h-14 text-center text-2xl font-bold rounded-xl
                    border-2 transition-all
                    ${digit 
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-slate-900 dark:text-white' 
                      : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-500'
                    }
                    focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                />
              ))}
            </div>

            <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-3">
              Enter at least 4 digits
            </p>
          </div>

          {/* PIN Strength Indicator */}
          {pinString.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  PIN Strength
                </span>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                      pinString.length >= i
                        ? pinString.length < 4
                          ? 'bg-yellow-400'
                          : pinString.length < 6
                          ? 'bg-green-400'
                          : 'bg-green-500'
                        : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {pinString.length < 4 
                  ? 'Too short' 
                  : pinString.length < 6
                  ? 'Good'
                  : 'Strong ✓'
                }
              </p>
            </div>
          )}

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            disabled={!isPinComplete || isVerifying}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-base shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isVerifying ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <ShieldCheckIcon className="w-5 h-5" />
                Verify & Continue
              </>
            )}
          </button>

          {/* Security Note */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-600 dark:text-slate-400 text-center">
              🔒 Your PIN is encrypted and never stored. This verification ensures only you can authorize transactions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}