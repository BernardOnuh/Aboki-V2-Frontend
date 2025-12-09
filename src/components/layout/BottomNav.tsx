"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  HomeIcon, 
  GiftIcon, 
  ChatBubbleLeftRightIcon, 
  UserIcon 
} from "@heroicons/react/24/outline";
import { 
  HomeIcon as HomeSolid, 
  GiftIcon as GiftSolid, 
  ChatBubbleLeftRightIcon as ChatSolid, 
  UserIcon as UserSolid,
  QrCodeIcon
} from "@heroicons/react/24/solid";

export default function BottomNav() {
  const pathname = usePathname();

  // Hide Nav on specific full-screen pages (like the active Scan camera view)
  if (pathname === "/scan") return null;

  const navItems = [
    { label: "Home", href: "/", icon: HomeIcon, activeIcon: HomeSolid },
    { label: "Rewards", href: "/rewards", icon: GiftIcon, activeIcon: GiftSolid },
    { label: "SCAN", href: "/scan", isFloating: true }, // Middle Button
    { label: "Support", href: "/support", icon: ChatBubbleLeftRightIcon, activeIcon: ChatSolid },
    { label: "Profile", href: "/profile", icon: UserIcon, activeIcon: UserSolid },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <div className="w-full max-w-[1080px] pointer-events-auto">
        
        {/* Glass Container */}
        <nav className="relative bg-white/80 dark:bg-[#252525]/90 backdrop-blur-xl border-t border-slate-200 dark:border-[#A3A3A3] pb-6 pt-3 px-6 shadow-lg rounded-t-[2rem]">
          
          <ul className="flex items-center justify-between">
            {navItems.map((item) => {
              
              // 1. Handle the Big Scan Button (Middle)
              if (item.isFloating) {
                return (
                  <li key="scan" className="relative -top-8">
                    <Link href="/scan">
                      <div className="w-16 h-16 rounded-full bg-[#D364DB] flex items-center justify-center shadow-[0_8px_20px_rgba(211,100,219,0.4)] hover:scale-105 active:scale-95 transition-all border-4 border-[#FDFBF7] dark:border-[#252525]">
                        <QrCodeIcon className="w-8 h-8 text-white" />
                      </div>
                    </Link>
                  </li>
                );
              }

              // 2. Handle Standard Tabs
              const isActive = pathname === item.href;
              const Icon = isActive ? item.activeIcon : item.icon;

              return (
                <li key={item.label}>
                  <Link href={item.href} className="flex flex-col items-center gap-1 p-2">
                    <Icon className={`w-6 h-6 transition-colors ${isActive ? 'text-[#D364DB]' : 'text-slate-400 dark:text-gray-400'}`} />
                    <span className={`text-[10px] font-bold ${isActive ? 'text-[#D364DB]' : 'text-slate-400 dark:text-gray-400'}`}>
                      {item.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}
