"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useTheme } from "next-themes";
import { 
  ShareIcon,
  UsersIcon,
  UserIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  ArrowRightOnRectangleIcon,
  ChevronRightIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  MoonIcon,
  SunIcon,
  ExclamationCircleIcon,
  FingerPrintIcon
} from "@heroicons/react/24/outline";

interface UserProfile {
  name: string;
  username: string;
  email: string;
  wallet?: {
    ownerAddress: string;
    smartAccountAddress: string;
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const { setTheme, theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [hasPasskey, setHasPasskey] = useState(false);
  const [inviteCode, setInviteCode] = useState<string>("");
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    const token = localStorage.getItem("aboki_auth_token");
    
    if (!token) {
      router.push("/auth");
      return;
    }

    try {
      // ============= FETCH USER PROFILE + CHECK PASSKEY =============
      const profileRes = await fetch("https://apis.aboki.xyz/api/users/me", {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setUser(profileData.data);
        
        // Check if user has passkey
        // The backend will include passkey info if they have one
        const userHasPasskey = profileData.data?.passkey?.credentialID ? true : false;
        setHasPasskey(userHasPasskey);

        // ============= IF NO PASSKEY, REDIRECT TO SETUP =============
        if (!userHasPasskey) {
          console.log('⚠️ User does not have passkey, redirecting to setup...');
          // Wait 1 second then redirect so user can see the loading state
          setTimeout(() => {
            router.push('/dashboard/security');
          }, 1000);
          return;
        }
      }

      // ============= FETCH INVITE CODE =============
      const inviteRes = await fetch("https://apis.aboki.xyz/api/invites/my-code", {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (inviteRes.ok) {
        const inviteData = await inviteRes.json();
        setInviteCode(inviteData.data.code);
      }

      // ============= FETCH REFERRALS COUNT =============
      const referralsRes = await fetch("https://apis.aboki.xyz/api/invites/my-referrals", {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (referralsRes.ok) {
        const referralsData = await referralsRes.json();
        setTotalReferrals(referralsData.data.totalReferrals || 0);
      }

    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("aboki_auth_token");
    localStorage.removeItem("aboki_user_email");
    localStorage.removeItem("aboki_auth_method");
    router.push("/auth");
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareInviteLink = () => {
    const link = `https://aboki.xyz/invite/${inviteCode}`;
    if (navigator.share) {
      navigator.share({
        title: 'Join Aboki',
        text: `Use my invite code: ${inviteCode}`,
        url: link
      });
    } else {
      navigator.clipboard.writeText(link);
      alert("Invite link copied!");
    }
  };

  // ============= SHOW LOADING OR REDIRECT SCREEN =============
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6EDFF] dark:bg-[#252525] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-[#D364DB] to-[#C554CB] rounded-full animate-pulse" />
          <p className="text-slate-600 dark:text-slate-400">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // ============= IF NO PASSKEY, SHOW SETUP REQUIRED SCREEN =============
  if (!hasPasskey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F6EDFF] to-white dark:from-[#1a1a1a] dark:to-[#252525] flex items-center justify-center px-6">
        <div className="max-w-md text-center space-y-6">
          {/* Icon */}
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#D364DB] to-[#C554CB] rounded-full flex items-center justify-center shadow-lg">
            <FingerPrintIcon className="w-10 h-10 text-white" />
          </div>

          {/* Title */}
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Security Setup Required
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              You need to set up biometric security (passkey) before accessing your profile and transferring funds.
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
            <div className="flex items-start gap-3">
              <ShieldCheckIcon className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 shrink-0" />
              <div className="text-left">
                <p className="text-sm font-bold text-purple-900 dark:text-purple-300 mb-1">
                  What is a Passkey?
                </p>
                <ul className="text-xs text-purple-700 dark:text-purple-400 space-y-1">
                  <li>✓ Uses Face ID or Touch ID</li>
                  <li>✓ No passwords needed</li>
                  <li>✓ Ultra-secure & phishing-proof</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Setup Button */}
          <button
            onClick={() => router.push('/dashboard/security')}
            className="w-full py-4 bg-[#D364DB] hover:bg-[#C554CB] text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
          >
            <FingerPrintIcon className="w-5 h-5" />
            Set Up Passkey Now
          </button>

          {/* Logout Option */}
          <button
            onClick={handleLogout}
            className="w-full py-3 text-slate-600 dark:text-slate-400 font-medium hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Log out instead
          </button>
        </div>
      </div>
    );
  }

  // ============= NORMAL PROFILE PAGE (USER HAS PASSKEY) =============
  return (
    <div className="min-h-screen bg-[#F6EDFF] dark:bg-[#252525] pb-32">
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#F6EDFF]/80 dark:bg-[#252525]/90 backdrop-blur-md border-b border-gray-200 dark:border-[#3d3d3d]">
        <div className="max-w-2xl mx-auto px-6 py-5 flex items-center justify-between">
          {/* Logo */}
          <div className="relative h-8 w-32 cursor-pointer" onClick={() => router.push("/")}>
            <Image 
              src="/LogoLight.svg" 
              alt="Aboki Logo" 
              fill 
              className="object-contain object-left dark:hidden" 
              priority 
            />
            <Image 
              src="/LogoDark.svg" 
              alt="Aboki Logo" 
              fill 
              className="object-contain object-left hidden dark:block" 
              priority 
            />
          </div>

          {/* Theme Toggle */}
          <button 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="relative w-9 h-9 flex items-center justify-center rounded-full text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-[#3d3d3d] transition-all hover:scale-105 active:scale-95"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            <SunIcon className="w-5 h-5 absolute transition-all duration-300 rotate-0 scale-100 dark:-rotate-90 dark:scale-0" />
            <MoonIcon className="w-5 h-5 absolute transition-all duration-300 rotate-90 scale-0 dark:rotate-0 dark:scale-100" />
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-4">
        
        {/* Header with username link */}
        <div className="bg-white dark:bg-[#2d2d2d] rounded-2xl p-4 border border-gray-200 dark:border-[#3d3d3d] text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            aboki.xyz/@{user?.username}
          </p>
        </div>

        {/* Invite Friends - Two Buttons */}
        <div className="bg-white dark:bg-[#2d2d2d] rounded-2xl border border-gray-200 dark:border-[#3d3d3d] overflow-hidden">
          
          {/* Share Link */}
          <button
            onClick={shareInviteLink}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors border-b border-gray-200 dark:border-[#3d3d3d]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#D364DB]/10 flex items-center justify-center">
                <ShareIcon className="w-5 h-5 text-[#D364DB]" />
              </div>
              <span className="font-bold text-gray-900 dark:text-white">
                Share invite link
              </span>
            </div>
            <ChevronRightIcon className="w-5 h-5 text-gray-400" />
          </button>

          {/* Copy Invite Code */}
          <button
            onClick={copyInviteCode}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#D364DB]/10 flex items-center justify-center">
                {copied ? (
                  <CheckIcon className="w-5 h-5 text-green-600" />
                ) : (
                  <ClipboardDocumentIcon className="w-5 h-5 text-[#D364DB]" />
                )}
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-900 dark:text-white">
                  {copied ? "Copied!" : "Copy invite code"}
                </p>
                {inviteCode && (
                  <p className="text-xs text-[#D364DB] font-mono">
                    {inviteCode}
                  </p>
                )}
              </div>
            </div>
            <ChevronRightIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Stats Group */}
        <div className="bg-white dark:bg-[#2d2d2d] rounded-2xl border border-gray-200 dark:border-[#3d3d3d] overflow-hidden">
          
          {/* Your Referrals */}
          <button 
            onClick={() => router.push("/referrals")}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors border-b border-gray-200 dark:border-[#3d3d3d]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#D364DB]/10 flex items-center justify-center">
                <UsersIcon className="w-5 h-5 text-[#D364DB]" />
              </div>
              <span className="font-bold text-gray-900 dark:text-white">
                Your Referrals
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#D364DB] font-bold">{totalReferrals}</span>
              <ChevronRightIcon className="w-5 h-5 text-gray-400" />
            </div>
          </button>

          {/* Points */}
          <button 
            onClick={() => alert("Points feature coming soon! 🎉")}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-400/10 flex items-center justify-center">
                <span className="text-lg">✨</span>
              </div>
              <span className="font-bold text-gray-900 dark:text-white">
                Points
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-600 dark:text-yellow-400 font-bold">Coming Soon</span>
              <ChevronRightIcon className="w-5 h-5 text-gray-400" />
            </div>
          </button>
        </div>

        {/* Settings Group */}
        <div className="bg-white dark:bg-[#2d2d2d] rounded-2xl border border-gray-200 dark:border-[#3d3d3d] overflow-hidden">
          
          {/* Personal Details */}
          <button 
            onClick={() => alert("Personal details editing coming soon! 🎉")}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors border-b border-gray-200 dark:border-[#3d3d3d]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#D364DB]/10 flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-[#D364DB]" />
              </div>
              <span className="font-bold text-gray-900 dark:text-white">
                Personal details
              </span>
            </div>
            <ChevronRightIcon className="w-5 h-5 text-gray-400" />
          </button>

          {/* Security & Verification */}
          <button 
            onClick={() => router.push("/dashboard/security")}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors border-b border-gray-200 dark:border-[#3d3d3d]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <ShieldCheckIcon className="w-5 h-5 text-green-600" />
              </div>
              <span className="font-bold text-gray-900 dark:text-white">
                Security & Verification
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600 text-xs font-bold">✓ Active</span>
              <ChevronRightIcon className="w-5 h-5 text-gray-400" />
            </div>
          </button>

          {/* Show Full Name Toggle */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#D364DB]/10 flex items-center justify-center">
                <span className="text-lg">👁</span>
              </div>
              <span className="font-bold text-gray-900 dark:text-white">
                Show my full name
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#D364DB]"></div>
            </label>
          </div>
        </div>

        {/* Exchange Rates */}
        <button 
          onClick={() => alert("Exchange rates feature coming soon! 💱")}
          className="w-full bg-white dark:bg-[#2d2d2d] rounded-2xl p-4 border border-gray-200 dark:border-[#3d3d3d] flex items-center justify-between hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#D364DB]/10 flex items-center justify-center">
              <CurrencyDollarIcon className="w-5 h-5 text-[#D364DB]" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white">
              Exchange rates and fees
            </span>
          </div>
          <ChevronRightIcon className="w-5 h-5 text-gray-400" />
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full bg-white dark:bg-[#2d2d2d] rounded-2xl p-4 border-2 border-gray-900 dark:border-white flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5 text-gray-900 dark:text-white" />
          <span className="font-bold text-gray-900 dark:text-white">
            Log out
          </span>
        </button>

      </div>
    </div>
  );
}