"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ChevronLeftIcon, 
  MagnifyingGlassIcon, 
  UserCircleIcon,
  ExclamationCircleIcon,
  UserPlusIcon
} from "@heroicons/react/24/outline";
import apiClient from "@/lib/api-client";

interface Contact {
  id: string;
  username: string;
  name: string;
  address: string;
  interactionCount: number;
  transferCount: number;
  totalAmountTransferred: number;
  lastInteractedAt: string;
}

interface SearchedUser {
  username: string;
  name: string;
  isNewContact?: boolean;
}

export default function ContactSearch() {
  const [query, setQuery] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // For live username search
  const [searching, setSearching] = useState(false);
  const [searchedUser, setSearchedUser] = useState<SearchedUser | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Fetch contacts on component mount
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiClient.getContacts();
        
        if (response.success && response.data) {
          setContacts(response.data);
          console.log("✅ Loaded contacts:", response.data.length);
        } else {
          setError(response.error || "Failed to load contacts");
          console.error("❌ Failed to load contacts:", response.error);
        }
      } catch (err: any) {
        console.error("❌ Error fetching contacts:", err);
        setError(err.message || "Failed to load contacts");
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  // Live username search with debounce
  useEffect(() => {
    if (!query || query.length < 2) {
      setSearchedUser(null);
      setSearchError(null);
      return;
    }

    const searchUsername = async () => {
      // Clean the query (remove @ if user typed it)
      const cleanQuery = query.replace('@', '').toLowerCase();

      // Check if query matches existing contacts first
      const existingContact = contacts.find(c => 
        c.username.toLowerCase() === cleanQuery ||
        c.name.toLowerCase().includes(cleanQuery)
      );

      if (existingContact) {
        // Don't search API if already in contacts
        setSearchedUser(null);
        setSearchError(null);
        return;
      }

      // Search for new username via API
      setSearching(true);
      setSearchError(null);

      try {
        const response = await apiClient.validateUsername(cleanQuery);
        
        if (response.success && response.data) {
          setSearchedUser({
            username: response.data.username,
            name: response.data.name,
            isNewContact: true
          });
          setSearchError(null);
          console.log("✅ Found user:", response.data);
        } else {
          setSearchedUser(null);
          setSearchError(null);
        }
      } catch (err: any) {
        console.error("❌ Search error:", err);
        setSearchedUser(null);
        setSearchError(null);
      } finally {
        setSearching(false);
      }
    };

    // Debounce search
    const timer = setTimeout(searchUsername, 500);
    return () => clearTimeout(timer);
  }, [query, contacts]);

  // Filter existing contacts based on search query
  const filteredContacts = query 
    ? contacts.filter(c => {
        const cleanQuery = query.replace('@', '').toLowerCase();
        return c.name.toLowerCase().includes(cleanQuery) || 
               c.username.toLowerCase().includes(cleanQuery);
      })
    : contacts;

  // Show searched user if no matching contacts
  const showSearchedUser = searchedUser && filteredContacts.length === 0 && query.length >= 2;

  return (
    <div className="w-full max-w-[1080px] mx-auto min-h-screen bg-[#F6EDFF]/50 dark:bg-[#252525] transition-colors duration-300 overflow-hidden flex flex-col">
      
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
            className="block w-full pl-12 pr-4 py-4 bg-white dark:bg-[#3D3D3D] border-2 border-slate-200 dark:border-[#A3A3A3] rounded-2xl text-lg font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#D364DB] dark:focus:border-[#D364DB] focus:ring-0 transition-all shadow-sm"
            placeholder="Search username or name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
          />
          
          {/* Searching indicator */}
          {searching && (
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#D364DB]"></div>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-500 mb-4 uppercase tracking-wider">
            {query ? "Search Results" : "Your Contacts"}
          </h3>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#D364DB] mb-3"></div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Loading contacts...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="p-4 bg-red-100 dark:bg-red-900/30 border-2 border-red-500 rounded-2xl flex items-start gap-3">
              <ExclamationCircleIcon className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" />
              <div>
                <p className="font-bold text-red-900 dark:text-red-200 text-sm mb-1">
                  Error Loading Contacts
                </p>
                <p className="text-red-700 dark:text-red-300 text-sm">
                  {error}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 text-xs font-bold text-red-600 dark:text-red-400 underline"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Contacts List */}
          {!loading && !error && (
            <div className="space-y-2">
              {/* Show searched user first (new contact) */}
              {showSearchedUser && (
                <div className="mb-4">
                  <p className="text-xs text-slate-400 font-bold mb-2 uppercase tracking-wider">
                    New User
                  </p>
                  <Link 
                    href={`/send/amount?source=contacts&username=${searchedUser.username}&avatar=${searchedUser.username.charAt(0).toUpperCase()}`}
                    className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-300 dark:border-purple-700 hover:border-[#D364DB] dark:hover:border-[#D364DB] rounded-2xl transition-all group active:scale-[0.99]"
                  >
                    <div className="h-12 w-12 rounded-full bg-purple-200 dark:bg-purple-800 flex items-center justify-center border-2 border-purple-400 dark:border-purple-600 font-bold text-purple-700 dark:text-purple-300 text-lg relative">
                      {searchedUser.username.charAt(0).toUpperCase()}
                      <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                        <UserPlusIcon className="w-3 h-3 text-white" />
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-start flex-1">
                      <span className="font-bold text-slate-900 dark:text-white text-base">
                        {searchedUser.name}
                      </span>
                      <span className="text-sm text-slate-500 font-medium">
                        @{searchedUser.username}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded-full">
                        New Contact
                      </span>
                    </div>
                  </Link>
                </div>
              )}

              {/* Existing contacts */}
              {filteredContacts.length > 0 && (
                <>
                  {showSearchedUser && (
                    <p className="text-xs text-slate-400 font-bold mt-6 mb-2 uppercase tracking-wider">
                      Your Contacts
                    </p>
                  )}
                  {filteredContacts.map((contact) => {
                    const avatar = contact.username?.charAt(0).toUpperCase() || "?";
                    
                    return (
                      <Link 
                        key={contact.id}
                        href={`/send/amount?source=contacts&username=${contact.username}&avatar=${avatar}`}
                        className="w-full flex items-center gap-4 p-4 bg-white dark:bg-[#3D3D3D] border-2 border-transparent hover:border-[#D364DB] dark:hover:border-[#D364DB] rounded-2xl transition-all group active:scale-[0.99]"
                      >
                        <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center border-2 border-purple-200 dark:border-purple-700 font-bold text-purple-600 dark:text-purple-400 text-lg">
                          {avatar}
                        </div>
                        
                        <div className="flex flex-col items-start flex-1">
                          <span className="font-bold text-slate-900 dark:text-white text-base">
                            {contact.name}
                          </span>
                          <span className="text-sm text-slate-500 font-medium">
                            @{contact.username}
                          </span>
                        </div>

                        {/* Show interaction stats */}
                        <div className="text-right">
                          <div className="text-xs text-slate-400 font-medium">
                            {contact.transferCount} {contact.transferCount === 1 ? 'transfer' : 'transfers'}
                          </div>
                          <div className="text-sm text-purple-600 dark:text-purple-400 font-bold">
                            ${contact.totalAmountTransferred.toFixed(2)}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </>
              )}

              {/* No results */}
              {filteredContacts.length === 0 && !showSearchedUser && !searching && (
                <div className="text-center py-10 opacity-60">
                  <UserCircleIcon className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                  <p className="text-slate-500 font-medium mb-1">
                    {query ? (
                      <>No users found for "{query}"</>
                    ) : (
                      "No contacts yet"
                    )}
                  </p>
                  {!query && (
                    <p className="text-sm text-slate-400">
                      Start sending money to add contacts!
                    </p>
                  )}
                  {query && query.length >= 2 && (
                    <p className="text-sm text-slate-400 mt-2">
                      Try searching for a username like "bernardon"
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}