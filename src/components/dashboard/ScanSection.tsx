import { QrCodeIcon } from "@heroicons/react/24/solid";

export default function ScanSection() {
  return (
    <button className="
      w-full flex items-center justify-center gap-3 
      bg-slate-900 dark:bg-[#D364DB] 
      text-white p-4 rounded-2xl shadow-sm 
      hover:bg-slate-800 dark:hover:bg-[#b54cbd] 
      transition-all active:scale-[0.98]
    ">
      <QrCodeIcon className="w-6 h-6 text-[#D364DB] dark:text-white" />
      <span className="font-bold text-lg">Scan code</span>
    </button>
  );
}
