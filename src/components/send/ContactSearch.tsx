
"use client"

import { useState } from "react";
import Link from "next/link";
import { 
  ChevronLeftIcon, 
  MagnifyingGlassIcon, 
  UserCircleIcon 
} from "@heroicons/react/24/outline";

const RECENT_CONTACTS = [
  { id: 1, name: "Emeka O.", username: "@emeka", avatar: "E" },
  { id: 2, name: "Chioma A.", username: "@chioma", avatar: "C" },
  { id: 3, name: "Tunde B.", username: "@tunde", avatar: "T" },
];

export default function ContactSearch() {
  const [query, setQuery] = useState("");
  const filteredContacts = query 
    ? RECENT_CONTACTS.filter(c => c.name.toLowerCase().includes(query.toLowerCase()) || c.username.toLowerCase().includes(query.toLowerCase()))
    : RECENT_CONTACTS;

  return (
    // Clean background, no shadow
    <div className="w-full max-w-[1080px] mx-auto min-h-screen bg-[#F6EDFF]/50 dark:bg-slate-950 transition-colors duration-300 overflow-hidden flex flex-col">
      
      <header className="px-6 py-6 flex items-center gap-4">
        <Link href="/send" className="p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
          <ChevronLeftIcon className="w-6 h-6 text-slate-900 dark:text-white" />
        </Link>
        <h1 className="font-bold text-xl text-slate-900 dark:text-white">
          Who are you sending to?
        </h1>
      </header>

      <div className="px-6 flex flex-col gap-6">
        
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-6 w-6 text-slate-400 group-focus-within:text-[#D364DB] transition-colors" />
          </div>
          <input
            type="text"
            autoFocus
            className="block w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl text-lg font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#D364DB] dark:focus:border-[#D364DB] focus:ring-0 transition-all shadow-sm"
            placeholder="Search @username or address"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-500 mb-4 uppercase tracking-wider">
            {query ? "Search Results" : "Recent"}
          </h3>

          <div className="space-y-2">
            {filteredContacts.length > 0 ? (
              filteredContacts.map((contact) => (
                <Link href="/send/amount" 
                  key={contact.id}
                  className="w-full flex items-center gap-4 p-4 bg-white dark:bg-slate-900 border-2 border-transparent hover:border-[#D364DB] dark:hover:border-[#D364DB] rounded-2xl transition-all group active:scale-[0.99]"
                >
                  <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300 text-lg">
                    {contact.avatar}
                  </div>
                  
                  <div className="flex flex-col items-start">
                    <span className="font-bold text-slate-900 dark:text-white text-base">
                      {contact.name}
                    </span>
                    <span className="text-sm text-slate-500 font-medium">
                      {contact.username}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-10 opacity-60">
                <UserCircleIcon className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                <p className="text-slate-500">No users found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}