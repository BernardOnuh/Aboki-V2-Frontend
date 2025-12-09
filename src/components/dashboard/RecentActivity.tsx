import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Scalable Data Interface
interface Transaction {
  id: string;
  name: string;
  type: "Received" | "Sent" | "Subscription" | "Deposit";
  amount: number;
  currency: string;
  date: string;
  initials: string;
}

// Mock Data (simulating API response)
const transactions: Transaction[] = [
  { id: "tx_1", name: "Emeka O.", type: "Received", amount: 50.00, currency: "USD", date: "Today, 9:41 AM", initials: "EO" },
  { id: "tx_2", name: "Netflix", type: "Subscription", amount: -15.99, currency: "USD", date: "Yesterday", initials: "N" },
  { id: "tx_3", name: "Chioma A.", type: "Sent", amount: -120.00, currency: "USD", date: "Oct 24", initials: "CA" },
];

export default function RecentActivity() {
  return (
    <div className="mt-8 space-y-4"> {/* Added margin top */}
      <div className="flex items-center justify-between px-1">
        <h3 className="font-bold text-lg text-slate-900 dark:text-white">Recent Activity</h3>
        <button className="text-sm text-purple-600 hover:text-purple-500 font-medium transition-colors">
          See all
        </button>
      </div>

      <div className="space-y-3">
        {transactions.map((tx) => (
          <div 
            key={tx.id} 
            className="
              flex items-center justify-between p-4 
              bg-white dark:bg-[#3D3D3D] 
              rounded-2xl border border-slate-100 dark:border-[#A3A3A3] 
              shadow-sm hover:border-slate-200 dark:hover:border-slate-700 transition-colors
            "
          >
            <div className="flex items-center gap-4">
              <Avatar className="h-10 w-10 border border-slate-100 dark:border-[#A3A3A3]">
                <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs">
                  {tx.initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold text-sm text-slate-900 dark:text-white">{tx.name}</p>
                <p className="text-xs text-slate-500 dark:text-gray-300">{tx.type} • {tx.date}</p>
              </div>
            </div>
            <span className={`font-bold text-sm ${tx.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-slate-900 dark:text-white'}`}>
              {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}