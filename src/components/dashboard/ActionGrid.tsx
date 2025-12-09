import { 
  PaperAirplaneIcon, 
  ArrowDownLeftIcon, 
  PlusIcon, 
  BuildingLibraryIcon 
} from "@heroicons/react/24/outline";

export default function ActionGrid() {
  // Config for the buttons
  const actions = [
    { 
      label: "Send", 
      icon: PaperAirplaneIcon, 
      // Primary styling: Purple background, White text
      style: "bg-[#9333EA] border-[#9333EA] text-white hover:bg-purple-700 dark:hover:bg-purple-600"
    },
    { 
      label: "Receive", 
      icon: ArrowDownLeftIcon, 
      // Secondary styling: Standard card
      style: "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-purple-300 dark:hover:border-purple-500"
    },
    { 
      label: "Add Cash", 
      icon: PlusIcon, 
      style: "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-purple-300 dark:hover:border-purple-500"
    },
    { 
      label: "Withdraw", 
      icon: BuildingLibraryIcon, 
      style: "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-purple-300 dark:hover:border-purple-500"
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map((action) => (
        <button 
          key={action.label}
          className={`
            flex items-center gap-3 p-4 rounded-2xl border shadow-sm transition-all active:scale-[0.98]
            ${action.style}
          `}
        >
          {/* Icon Container */}
          <div className={`p-2 rounded-full ${action.label === 'Send' ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
            <action.icon className={`w-5 h-5 ${action.label === 'Send' ? 'text-white' : 'text-slate-900 dark:text-white'}`} />
          </div>
          
          <span className="font-bold text-sm">{action.label}</span>
        </button>
      ))}
    </div>
  );
}