import { WalletIcon } from '@heroicons/react/24/outline';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md space-y-4 rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
          <WalletIcon className="h-8 w-8 text-purple-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Aboki V2</h1>
        <p className="text-slate-500">
          Frontend ready. <br />
          Next.js 14 + Tailwind + Heroicons
        </p>
        <button className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
          Connect Wallet
        </button>
      </div>
    </main>
  );
}