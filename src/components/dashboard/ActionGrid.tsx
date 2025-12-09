import Link from "next/link";
import { 
  PaperAirplaneIcon, 
  ArrowDownLeftIcon, 
  PlusIcon, 
  BuildingLibraryIcon 
} from "@heroicons/react/24/outline";

export default function ActionGrid() {
  const actions = [
    { 
      label: "Send", 
      icon: PaperAirplaneIcon, 
      href: "/send",
      style: "bg-[#D364DB] text-white border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.9)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.9)]"
    },
    { 
      label: "Receive", 
      icon: ArrowDownLeftIcon, 
      href: "/receive", 
      
      style: "bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.9)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.9)]"
    },
    { 
      label: "Add Cash", 
      icon: PlusIcon, 
      href: "/add", // Placeholder for future
      style: "bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.9)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.9)]"
    },
    { 
      label: "Withdraw", 
      icon: BuildingLibraryIcon, 
      href: "/withdraw", // Placeholder for future
      style: "bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.9)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.9)]"
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
      {actions.map((action) => {
        const ButtonContent = (
          <>
            <div className={`p-2 rounded-full ${action.label === 'Send' ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
              <action.icon className="w-5 h-5" />
            </div>
            <span className="font-bold text-sm">{action.label}</span>
          </>
        );

        const containerClasses = `
          flex items-center justify-center md:justify-start gap-3 p-4 
          rounded-full border transition-all duration-200 w-full
          ${action.style}
        `;

        // If the action has an href, wrap it in a Link
        if (action.href) {
          return (
            <Link key={action.label} href={action.href} className="w-full">
              <button className={containerClasses}>
                {ButtonContent}
              </button>
            </Link>
          );
        }

        // Fallback for buttons without links yet
        return (
          <button key={action.label} className={containerClasses}>
            {ButtonContent}
          </button>
        );
      })}
    </div>
  );
}