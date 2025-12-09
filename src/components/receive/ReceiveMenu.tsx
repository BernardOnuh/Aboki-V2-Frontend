"use client"

import Link from "next/link";
import { 
  ChevronLeftIcon, 
  UserCircleIcon, 
  LinkIcon, 
  QrCodeIcon 
} from "@heroicons/react/24/outline";

export default function ReceiveMenu() {
  return (
    <div className="w-full max-w-[1080px] mx-auto min-h-screen bg-[#F6EDFF]/50 dark:bg-slate-950 transition-colors duration-300 overflow-hidden flex flex-col">
      
      <header className="px-6 py-6 flex items-center relative">
        <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
          <ChevronLeftIcon className="w-6 h-6 text-slate-900 dark:text-white" />
        </Link>
        <h1 className="absolute left-1/2 -translate-x-1/2 font-bold text-xl text-slate-900 dark:text-white">
          Receive Money
        </h1>
      </header>

      <div className="flex-1 px-6 mt-4 flex flex-col gap-4">
        <p className="text-slate-500 font-medium mb-2">Choose how you want to receive:</p>

        {/* Option 1: Aboki Username */}
        <ReceiveOption 
          href="/receive/username"
          icon={UserCircleIcon}
          title="From a Contact"
          subtitle="Share your @username"
          iconColor="bg-purple-100 text-purple-600"
        />

        {/* Option 2: Request Link */}
        <ReceiveOption 
          href="/receive/request"
          icon={LinkIcon}
          title="Request via Link"
          subtitle="Ask for a specific amount"
          iconColor="bg-pink-100 text-pink-600"
        />

        {/* Option 3: Wallet Address */}
        <ReceiveOption 
          href="/receive/address"
          icon={QrCodeIcon}
          title="From Exchange or Wallet"
          subtitle="Deposit via Base Network"
          iconColor="bg-blue-100 text-blue-600"
        />
      </div>
    </div>
  );
}

function ReceiveOption({ href, icon: Icon, title, subtitle, iconColor }: any) {
  return (
    <Link href={href}>
      <div className="flex items-center gap-4 p-5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl hover:border-[#D364DB] transition-all cursor-pointer active:scale-[0.99] shadow-sm">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconColor}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-lg text-slate-900 dark:text-white">{title}</span>
          <span className="text-sm text-slate-500 font-medium">{subtitle}</span>
        </div>
      </div>
    </Link>
  );
}
