import Link from "next/link";
import { 
  ChevronLeftIcon, 
  LinkIcon, 
  UserGroupIcon, 
  BuildingLibraryIcon, 
  WalletIcon 
} from "@heroicons/react/24/outline";

export default function SendMenu() {
  return (
    <div className="w-full max-w-[1080px] mx-auto min-h-screen bg-[#FDFBF7] dark:bg-slate-950 transition-colors duration-300 overflow-hidden flex flex-col">
        
      {/* Header */}
      <header className="px-6 py-6 flex items-center relative">
        <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
          <ChevronLeftIcon className="w-6 h-6 text-slate-900 dark:text-white" />
        </Link>
        <h1 className="absolute left-1/2 -translate-x-1/2 font-bold text-xl text-slate-900 dark:text-white">
          Send
        </h1>
      </header>

      <div className="flex-1 px-6 mt-4 flex flex-col gap-8">
        
        {/* Hero: Send via Link */}
        <div className="border-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-3xl p-6 text-center">
          <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <LinkIcon className="w-6 h-6 text-[#D364DB]" />
          </div>
          <h2 className="font-bold text-lg text-slate-900 dark:text-white mb-1">
            Send money with a link
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            No account needed to receive.
          </p>
          
          {/* Aboki Purple Button + White Shadow in Dark Mode */}
          <button className="w-full py-4 rounded-xl bg-[#D364DB] border-2 border-slate-900 text-white font-bold shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.8)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.8)] transition-all flex items-center justify-center gap-2">
            <LinkIcon className="w-5 h-5" />
            Send via link
          </button>
        </div>

        {/* OR Divider */}
        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-slate-300 dark:border-slate-700"></div>
          <span className="flex-shrink-0 mx-4 text-slate-400 text-sm font-medium">or</span>
          <div className="flex-grow border-t border-slate-300 dark:border-slate-700"></div>
        </div>

        {/* Options List */}
        <div className="space-y-8">
          <SendOption 
            icon={UserGroupIcon}
            title="Aboki contacts"
            subtitle="Friends you've interacted with"
            badge="FREE"
            href="/send/contacts"
          />
          <SendOption 
            icon={BuildingLibraryIcon}
            title="Bank Account"
            subtitle="Access, GTBank, Zenith & more"
            iconColor="text-blue-600 bg-blue-100"
            href="/send/bank"
          />
          <SendOption 
            icon={WalletIcon}
            title="Exchange or Wallet"
            subtitle="Binance, MetaMask, Coinbase"
            iconColor="text-orange-600 bg-orange-100"
            href="/send/crypto"
          />
        </div>
      </div>
    </div>
  );
}

// Sub-component used only here
function SendOption({ 
  icon: Icon, 
  title, 
  subtitle, 
  badge, 
  iconColor = "text-slate-700 bg-slate-100",
  href
}: { 
  icon: any, 
  title: string, 
  subtitle: string, 
  badge?: string, 
  iconColor?: string,
  href: string
}) {
  return (
    <Link href={href}>
      <div className="group flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl hover:border-[#D364DB] dark:hover:border-[#D364DB] transition-all cursor-pointer active:scale-[0.99]">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconColor}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 dark:text-white text-base">
              {title}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {subtitle}
            </span>
          </div>
        </div>
        
        {badge && (
          <span className="bg-purple-100 text-[#D364DB] text-[10px] font-bold px-2 py-1 rounded-full">
            {badge}
          </span>
        )}
      </div>
    </Link>
  );
}
