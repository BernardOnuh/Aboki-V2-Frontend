"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { Card, CardContent } from "@/components/ui/card";

interface WalletData {
  ownerAddress: string;
  smartAccountAddress: string;
  network: string;
  balance: string;
  usdcBalance: string;
  isReal: boolean;
}

interface UserData {
  username: string;
  name: string;
  email: string;
}

export default function BalanceCard() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    const token = localStorage.getItem("aboki_auth_token");
    
    if (!token) {
      router.push("/auth");
      return;
    }

    try {
      // Fetch user profile
      const userRes = await fetch("https://apis.aboki.xyz/api/users/me", {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (userRes.ok) {
        const userData = await userRes.json();
        console.log("✅ User data:", userData);
        setUser(userData.data);
      }

      // Fetch wallet details from /api/wallet
      const walletRes = await fetch("https://apis.aboki.xyz/api/wallet", {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (walletRes.ok) {
        const walletData = await walletRes.json();
        console.log("✅ Wallet data:", walletData);
        
        if (walletData.success && walletData.data) {
          setWallet(walletData.data);
        }
      }

    } catch (error) {
      console.error("❌ Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatBalance = (balance: string) => {
    if (!balance) return "0.00";
    const num = parseFloat(balance);
    return num.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  if (loading) {
    return (
      <Card className="bg-transparent border-0 shadow-none">
        <CardContent className="p-8 flex flex-col items-center justify-center min-h-[180px]">
          <div className="w-12 h-12 bg-gradient-to-br from-[#D364DB] to-[#C554CB] rounded-full animate-pulse" />
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">Loading balance...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-transparent border-0 shadow-none">
      <CardContent className="p-8 flex flex-col items-center justify-center min-h-[180px]">
        
        {/* Username pill */}
        <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-medium text-slate-600 dark:text-slate-300 mb-6 flex items-center gap-2 border border-slate-200 dark:border-[#A3A3A3]">
          @{user?.username || "loading..."}
        </div>

        {/* Balance Section */}
        <div className="text-center">
          <p className="text-slate-500 dark:text-gray-300 text-sm font-medium mb-2">
            Total Balance
          </p>
          <div className="flex items-center justify-center gap-3">
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tighter text-slate-900 dark:text-white">
              {isVisible ? `$${formatBalance(wallet?.usdcBalance || "0")}` : "$*******"}
            </h1>
            
            <button 
              onClick={() => setIsVisible(!isVisible)}
              className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition p-2"
              title={isVisible ? "Hide balance" : "Show balance"}
            >
              {isVisible ? (
                <EyeIcon className="w-6 h-6" />
              ) : (
                <EyeSlashIcon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}