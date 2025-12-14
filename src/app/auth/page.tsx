"use client"

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { SunIcon, MoonIcon, HomeIcon, StarIcon, QrCodeIcon, UserIcon } from "@heroicons/react/24/outline";
import LoginForm from "../../components/auth/LoginForm";
import SignupForm from "../../components/auth/SignupForm";

export default function AuthPage() {
  const router = useRouter();
  const { setTheme, theme } = useTheme();
  const [mode, setMode] = useState<"login" | "signup">("signup");

  return (
    <div className="min-h-screen bg-[#F6EDFF] dark:bg-gradient-to-b dark:from-[#1a1a1a] dark:via-[#252525] dark:to-[#2d2d2d] flex flex-col transition-colors duration-500">
      
      {/* Theme toggle */}
      <button 
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="fixed top-6 right-6 w-12 h-12 flex items-center justify-center rounded-full bg-white/80 dark:bg-[#3d3d3d]/80 backdrop-blur-sm shadow-lg hover:scale-110 transition-all duration-300 z-50"
      >
        <SunIcon className="w-6 h-6 absolute transition-all duration-300 rotate-0 scale-100 dark:-rotate-90 dark:scale-0 text-purple-600" />
        <MoonIcon className="w-6 h-6 absolute transition-all duration-300 rotate-90 scale-0 dark:rotate-0 dark:scale-100 text-slate-300" />
      </button>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo section */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="relative h-16 w-48 mx-auto mb-4">
              <Image 
                src="/LogoLight.svg" 
                alt="Aboki" 
                fill 
                className="object-contain dark:hidden" 
                priority 
              />
              <Image 
                src="/LogoDark.svg" 
                alt="Aboki" 
                fill 
                className="object-contain hidden dark:block" 
                priority 
              />
            </div>
            <p className="text-sm text-gray-600 dark:text-purple-100/60 font-medium">
              Your secure crypto wallet
            </p>
          </div>

          {/* Auth card */}
          <div className="bg-white dark:bg-[#2d2d2d]/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 dark:border-purple-900/20">
            
            {/* Mode toggle */}
            <div className="flex gap-2 mb-8 bg-gray-100 dark:bg-[#252525] p-1.5 rounded-2xl">
              <button
                onClick={() => setMode("login")}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                  mode === "login"
                    ? "bg-[#D364DB] text-white shadow-lg"
                    : "text-gray-600 dark:text-purple-100/50 hover:text-gray-900 dark:hover:text-purple-100"
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setMode("signup")}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                  mode === "signup"
                    ? "bg-[#D364DB] text-white shadow-lg"
                    : "text-gray-600 dark:text-purple-100/50 hover:text-gray-900 dark:hover:text-purple-100"
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Render appropriate form */}
            {mode === "login" ? (
              <LoginForm onSuccess={() => router.push("/")} />
            ) : (
              <SignupForm onSuccess={() => router.push("/")} />
            )}

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-purple-200/50 dark:border-purple-900/20">
              <p className="text-xs text-center text-gray-500 dark:text-purple-100/40">
                By continuing, you agree to Aboki's{" "}
                <a href="#" className="text-[#D364DB] dark:text-purple-400 hover:underline font-semibold">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-[#D364DB] dark:text-purple-400 hover:underline font-semibold">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>

          {/* Additional info */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 dark:text-purple-100/40">
              🔒 Secured with passkey encryption
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}