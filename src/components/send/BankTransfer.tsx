"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronLeftIcon,
  BuildingLibraryIcon,
  CheckBadgeIcon,
  ChevronDownIcon,
  ClockIcon,
  UserPlusIcon,
  XMarkIcon,
  TrashIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import apiClient from "@/lib/api-client";

interface Beneficiary {
  id: string;
  name: string;
  accountNumber: string;
  bankCode: string;
  bankName: string;
  isDefault: boolean;
}

interface FrequentAccount {
  accountNumber: string;
  bankCode: string;
  bankName: string;
  accountName: string;
  transactionCount: number;
  lastUsed: string;
}

const NIGERIAN_BANKS = [
  { code: "000014", name: "Access Bank" },
  { code: "000005", name: "Access Bank (Diamond)" },
  { code: "000010", name: "Ecobank Nigeria" },
  { code: "000007", name: "Fidelity Bank" },
  { code: "000016", name: "First Bank of Nigeria" },
  { code: "000003", name: "First City Monument Bank (FCMB)" },
  { code: "000013", name: "GTBank Plc" },
  { code: "000020", name: "Heritage Bank" },
  { code: "000006", name: "JAIZ Bank" },
  { code: "000002", name: "Keystone Bank" },
  { code: "000030", name: "Parallex Bank" },
  { code: "000008", name: "Polaris Bank" },
  { code: "000023", name: "Providus Bank" },
  { code: "000012", name: "Stanbic IBTC Bank" },
  { code: "000021", name: "Standard Chartered Bank" },
  { code: "000001", name: "Sterling Bank" },
  { code: "000022", name: "Suntrust Bank" },
  { code: "000018", name: "Union Bank of Nigeria" },
  { code: "000004", name: "United Bank For Africa" },
  { code: "000011", name: "Unity Bank" },
  { code: "000017", name: "Wema Bank" },
  { code: "000015", name: "Zenith Bank Plc" },
  { code: "000027", name: "Globus Bank" },
  { code: "000031", name: "Premium Trust Bank" },
  { code: "000026", name: "Taj Bank" },
  { code: "000029", name: "Lotus Bank" },
  { code: "000034", name: "Signature Bank" },
  { code: "000036", name: "Optimus Bank" },
  { code: "000025", name: "Titan Trust Bank" },
  { code: "090267", name: "Kuda Microfinance Bank" },
  { code: "100004", name: "OPay (Paycom)" },
  { code: "100033", name: "PalmPay Limited" },
  { code: "100022", name: "GoMoney" },
  { code: "100002", name: "Paga" },
  { code: "035A", name: "ALAT by WEMA" },
  { code: "090565", name: "Carbon" },
  { code: "100039", name: "Paystack-Titan" },
  { code: "090328", name: "Eyowo" },
  { code: "120003", name: "MTN Momo PSB" },
  { code: "120004", name: "Airtel SmartCash PSB" },
  { code: "120001", name: "9mobile 9Payment Service Bank" },
  { code: "120002", name: "HopePSB" },
  { code: "090405", name: "Moniepoint Microfinance Bank" },
  { code: "090110", name: "VFD Microfinance Bank" },
];

export default function BankTransferPage() {
  const [account, setAccount] = useState("");
  const [bankSearch, setBankSearch] = useState("");
  const [bank, setBank] = useState("");
  const [verifiedName, setVerifiedName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [frequentAccounts, setFrequentAccounts] = useState<FrequentAccount[]>([]);
  const [loadingBeneficiaries, setLoadingBeneficiaries] = useState(true);
  const [loadingFrequent, setLoadingFrequent] = useState(true);
  const [showBeneficiaries, setShowBeneficiaries] = useState(false);
  const [showFrequent, setShowFrequent] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [savingBeneficiary, setSavingBeneficiary] = useState(false);
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  const [makeDefault, setMakeDefault] = useState(false);

  // Load beneficiaries on mount
  useEffect(() => {
    loadBeneficiaries();
    loadFrequentAccounts();
  }, []);

  const loadBeneficiaries = async () => {
    try {
      setLoadingBeneficiaries(true);
      const response = await apiClient.getBeneficiaries();
      if (response.success && response.data) {
        setBeneficiaries(response.data);
      }
    } catch (err) {
      console.error('Failed to load beneficiaries:', err);
    } finally {
      setLoadingBeneficiaries(false);
    }
  };

  const loadFrequentAccounts = async () => {
    try {
      setLoadingFrequent(true);
      const response = await apiClient.getFrequentAccounts();
      if (response.success && response.data) {
        setFrequentAccounts(response.data);
      }
    } catch (err) {
      console.error('Failed to load frequent accounts:', err);
    } finally {
      setLoadingFrequent(false);
    }
  };

  // Filter banks based on search
  const filteredBanks = NIGERIAN_BANKS.filter(b =>
    b.name.toLowerCase().includes(bankSearch.toLowerCase()) ||
    b.code.includes(bankSearch)
  );

  // Find accounts that match the current input
  const matchingAccounts = account.length > 0
    ? [...beneficiaries, ...frequentAccounts]
        .filter(item => {
          const accNum = 'accountNumber' in item ? item.accountNumber : '';
          return accNum.startsWith(account) && accNum !== account;
        })
        .slice(0, 3)
    : [];

  const verifyAccount = async (accountNumber: string, bankCode: string) => {
    if (accountNumber.length !== 10 || !bankCode) return;

    setLoading(true);
    setError("");
    setVerifiedName("");

    try {
      const response = await apiClient.verifyBankAccount({
        accountNumber,
        bankCode
      });

      if (response.success && response.data) {
        setVerifiedName(response.data.accountName);
      } else {
        setError(response.error || "Failed to verify account");
      }
    } catch (err: any) {
      setError(err.message || "Failed to verify account");
    } finally {
      setLoading(false);
    }
  };

  const handleAccountChange = (val: string) => {
    setAccount(val);
    setVerifiedName("");
    setError("");

    if (val.length === 10 && bank) {
      verifyAccount(val, bank);
    }
  };

  const handleBankChange = (code: string) => {
    setBank(code);
    setBankSearch("");
    setShowBankDropdown(false);
    setVerifiedName("");
    setError("");

    if (account.length === 10) {
      verifyAccount(account, code);
    }
  };

  const selectBeneficiary = (ben: Beneficiary) => {
    setAccount(ben.accountNumber);
    setBank(ben.bankCode);
    setVerifiedName(ben.name);
  };

  const selectFrequentAccount = (acc: FrequentAccount) => {
    setAccount(acc.accountNumber);
    setBank(acc.bankCode);
    setVerifiedName(acc.accountName);
  };

  const handleSaveBeneficiary = async () => {
    if (!verifiedName || !account || !bank) return;

    setSavingBeneficiary(true);
    try {
      const response = await apiClient.addBeneficiary({
        name: verifiedName,
        accountNumber: account,
        bankCode: bank
      });

      if (response.success && response.data) {
        const newBeneficiary: Beneficiary = {
          id: response.data.id,
          name: response.data.name,
          accountNumber: response.data.accountNumber,
          bankCode: response.data.bankCode,
          bankName: response.data.bankName,
          isDefault: makeDefault
        };

        if (makeDefault) {
          setBeneficiaries(beneficiaries.map(b => ({ ...b, isDefault: false })).concat(newBeneficiary));
          // Update default on server if needed
          await apiClient.setDefaultBeneficiary(response.data.id);
        } else {
          setBeneficiaries([...beneficiaries, newBeneficiary]);
        }

        setShowSaveModal(false);
        setMakeDefault(false);
      } else {
        alert("Failed to save beneficiary: " + (response.error || "Unknown error"));
      }
    } catch (err: any) {
      alert("Failed to save beneficiary: " + err.message);
    } finally {
      setSavingBeneficiary(false);
    }
  };

  const deleteBeneficiary = async (id: string) => {
    if (!confirm("Remove this beneficiary?")) return;

    try {
      const response = await apiClient.deleteBeneficiary(id);
      if (response.success) {
        setBeneficiaries(beneficiaries.filter(b => b.id !== id));
      } else {
        alert("Failed to delete beneficiary: " + (response.error || "Unknown error"));
      }
    } catch (err: any) {
      alert("Failed to delete beneficiary: " + err.message);
    }
  };

  const selectedBankName = NIGERIAN_BANKS.find(b => b.code === bank)?.name || "";

  return (
    <div className="min-h-screen bg-[#F6EDFF]/50 dark:bg-[#252525] flex justify-center">
      <div className="w-full max-w-[1080px] min-h-screen bg-[#F6EDFF]/50 dark:bg-[#252525] transition-colors duration-300 overflow-hidden flex flex-col">
        
        {/* Header */}
        <header className="px-6 py-6 flex items-center gap-4">
          <Link
            href="/send"
            className="p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <ChevronLeftIcon className="w-6 h-6 text-slate-900 dark:text-white" />
          </Link>
          <h1 className="font-bold text-xl text-slate-900 dark:text-white">
            Bank Transfer
          </h1>
        </header>

        <div className="flex-1 px-6 pb-40 space-y-4 overflow-y-auto">
          
          {/* Collapsible Beneficiaries */}
          {!loadingBeneficiaries && beneficiaries.length > 0 && (
            <div>
              <button
                onClick={() => setShowBeneficiaries(!showBeneficiaries)}
                className="w-full flex items-center justify-between p-4 bg-white dark:bg-[#3D3D3D] rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-600 transition-all"
              >
                <div className="flex items-center gap-2">
                  <BuildingLibraryIcon className="w-5 h-5 text-purple-500" />
                  <span className="font-bold text-slate-900 dark:text-white">
                    Saved Beneficiaries
                  </span>
                  <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-bold rounded-full">
                    {beneficiaries.length}
                  </span>
                </div>
                <ChevronDownIcon
                  className={`w-5 h-5 text-slate-500 transition-transform ${
                    showBeneficiaries ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showBeneficiaries && (
                <div className="mt-2 space-y-2">
                  {beneficiaries.map((ben) => (
                    <button
                      key={ben.id}
                      onClick={() => selectBeneficiary(ben)}
                      className="w-full p-4 bg-white dark:bg-[#3D3D3D] border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:border-purple-400 dark:hover:border-purple-500 transition-all text-left group hover:bg-purple-50 dark:hover:bg-purple-900/10"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-slate-900 dark:text-white">
                              {ben.name}
                            </p>
                            {ben.isDefault && (
                              <StarIconSolid className="w-4 h-4 text-amber-500" />
                            )}
                          </div>
                          <p className="text-sm text-slate-500 font-mono mt-1">
                            {ben.accountNumber}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            {ben.bankName}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteBeneficiary(ben.id);
                          }}
                          className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all ml-2 flex-shrink-0"
                        >
                          <TrashIcon className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Collapsible Frequently Used */}
          {!loadingFrequent && frequentAccounts.length > 0 && (
            <div>
              <button
                onClick={() => setShowFrequent(!showFrequent)}
                className="w-full flex items-center justify-between p-4 bg-white dark:bg-[#3D3D3D] rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all"
              >
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-5 h-5 text-blue-500" />
                  <span className="font-bold text-slate-900 dark:text-white">
                    Frequently Used
                  </span>
                  <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-full">
                    {frequentAccounts.length}
                  </span>
                </div>
                <ChevronDownIcon
                  className={`w-5 h-5 text-slate-500 transition-transform ${
                    showFrequent ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showFrequent && (
                <div className="mt-2 space-y-2">
                  {frequentAccounts.map((acc, idx) => (
                    <button
                      key={idx}
                      onClick={() => selectFrequentAccount(acc)}
                      className="w-full p-4 bg-white dark:bg-[#3D3D3D] border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:border-blue-400 dark:hover:border-blue-500 transition-all text-left hover:bg-blue-50 dark:hover:bg-blue-900/10"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-bold text-slate-900 dark:text-white">
                            {acc.accountName}
                          </p>
                          <p className="text-sm text-slate-500 font-mono mt-1">
                            {acc.accountNumber}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            {acc.bankName}
                          </p>
                        </div>
                        <div className="text-xs text-blue-500 font-bold">
                          {acc.transactionCount} transfers
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Smart Account Suggestions */}
          {matchingAccounts.length > 0 && (
            <div>
              <div className="flex items-center gap-2 px-2 mb-2">
                <SparklesIcon className="w-4 h-4 text-amber-500" />
                <p className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  Suggestions
                </p>
              </div>
              <div className="space-y-2">
                {matchingAccounts.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      selectBeneficiary(item as Beneficiary);
                    }}
                    className="w-full p-3 bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-xl hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-all text-left"
                  >
                    <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                      {item.accountNumber}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Manual Entry Section */}
          <div className="bg-white dark:bg-[#3D3D3D] rounded-2xl p-6 border-2 border-slate-200 dark:border-slate-700 space-y-4">
            <h2 className="font-bold text-lg text-slate-900 dark:text-white">
              Enter Account Details
            </h2>

            {/* Bank Selection */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Bank
              </label>
              <div className="relative">
                <button
                  onClick={() => setShowBankDropdown(!showBankDropdown)}
                  className="w-full p-4 bg-slate-50 dark:bg-[#252525] border-2 border-slate-200 dark:border-slate-600 rounded-xl text-left font-bold text-slate-900 dark:text-white flex items-center justify-between hover:border-purple-400 transition-colors"
                >
                  {bank ? selectedBankName : "Search banks..."}
                  <ChevronDownIcon className="w-5 h-5 text-slate-400" />
                </button>

                {showBankDropdown && (
                  <div className="absolute z-10 w-full mt-2 bg-white dark:bg-[#3D3D3D] border-2 border-slate-200 dark:border-slate-600 rounded-xl shadow-lg max-h-64 overflow-hidden">
                    <input
                      type="text"
                      placeholder="Search banks..."
                      value={bankSearch}
                      onChange={(e) => setBankSearch(e.target.value)}
                      className="w-full p-3 border-b-2 border-slate-200 dark:border-slate-600 font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-400 bg-slate-50 dark:bg-[#252525]"
                      autoFocus
                    />
                    <div className="overflow-y-auto max-h-48">
                      {filteredBanks.map(b => (
                        <button
                          key={b.code}
                          onClick={() => handleBankChange(b.code)}
                          className="w-full text-left p-3 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg text-sm font-bold text-slate-900 dark:text-white transition-colors"
                        >
                          {b.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Account Number */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Account Number
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={10}
                placeholder="0000000000"
                value={account}
                onChange={(e) => handleAccountChange(e.target.value)}
                className="w-full p-4 bg-slate-50 dark:bg-[#252525] border-2 border-slate-200 dark:border-slate-600 rounded-xl text-2xl font-mono font-bold text-slate-900 dark:text-white placeholder:text-slate-300 focus:border-purple-400 focus:outline-none transition-colors"
              />
            </div>

            {/* Status Messages */}
            {loading && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-blue-600 dark:text-blue-400 text-sm font-bold">
                  Verifying account...
                </p>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl">
                <p className="text-red-600 dark:text-red-400 text-sm font-bold">
                  {error}
                </p>
              </div>
            )}

            {verifiedName && !loading && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckBadgeIcon className="w-5 h-5 text-green-500" />
                      <p className="text-xs font-bold text-green-600 dark:text-green-400">
                        Verified Name
                      </p>
                    </div>
                    <p className="font-bold text-green-700 dark:text-green-300 mb-1">
                      {verifiedName}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      {selectedBankName}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowSaveModal(true)}
                    className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors flex-shrink-0"
                    title="Save as beneficiary"
                  >
                    <UserPlusIcon className="w-5 h-5 text-green-500" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Continue Button - Fixed above bottom nav */}
          <div className="fixed bottom-20 left-0 right-0 px-6 pb-4 pt-8 bg-gradient-to-t from-[#F6EDFF] dark:from-[#252525] via-[#F6EDFF]/95 dark:via-[#252525]/95 to-transparent pointer-events-none z-40">
            <div className="max-w-[1080px] mx-auto pointer-events-auto">
              <Link
                href={verifiedName && !loading ? `/send/amount-ngn?name=${encodeURIComponent(verifiedName)}&account=${account}&bank=${bank}&bankName=${encodeURIComponent(selectedBankName)}` : '#'}
                onClick={(e) => {
                  if (!verifiedName || loading) {
                    e.preventDefault();
                  }
                }}
                className={`block w-full py-4 rounded-2xl text-center font-bold text-lg transition-all ${
                  verifiedName && !loading
                    ? "bg-[#D364DB] text-white shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.8)] hover:-translate-y-1 active:translate-y-0"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed"
                }`}
              >
                Continue to Amount
              </Link>
            </div>
          </div>
        </div>

        {/* Save Modal */}
        {showSaveModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
            <div className="bg-white dark:bg-[#3D3D3D] rounded-3xl p-6 w-full max-w-md border-2 border-slate-200 dark:border-slate-600">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-xl text-slate-900 dark:text-white">
                  Save Beneficiary
                </h2>
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-slate-50 dark:bg-[#252525] rounded-xl">
                  <p className="text-xs font-bold text-slate-500 mb-1">Name</p>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {verifiedName}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-[#252525] rounded-xl">
                  <p className="text-xs font-bold text-slate-500 mb-1">Account</p>
                  <p className="font-bold text-slate-900 dark:text-white font-mono">
                    {account}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-[#252525] rounded-xl">
                  <p className="text-xs font-bold text-slate-500 mb-1">Bank</p>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {selectedBankName}
                  </p>
                </div>

                {/* Set as Default Checkbox */}
                <label className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors">
                  <input
                    type="checkbox"
                    checked={makeDefault}
                    onChange={(e) => setMakeDefault(e.target.checked)}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-400"
                  />
                  <div className="flex items-center gap-2">
                    <StarIconSolid className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      Set as default beneficiary
                    </span>
                  </div>
                </label>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="flex-1 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 font-bold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveBeneficiary}
                  disabled={savingBeneficiary}
                  className="flex-1 py-3 rounded-xl bg-[#D364DB] text-white font-bold hover:bg-[#C554CB] transition-colors disabled:opacity-50"
                >
                  {savingBeneficiary ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}