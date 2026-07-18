import { motion } from "framer-motion";
import { TelcoProvider } from "./TelcoProviderCard";

interface SummaryCardProps {
  provider: TelcoProvider | null;
  phoneNumber: string;
  amount: number | null;
}

export function SummaryCard({ provider, phoneNumber, amount }: SummaryCardProps) {
  if (!provider && !phoneNumber && !amount) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="p-4 rounded-[2rem] bg-slate-900 shadow-xl border border-slate-800"
    >
      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-1">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Provider</span>
          <p className="text-xs font-bold text-white truncate">{provider ? provider.name : "-"}</p>
        </div>
        <div className="space-y-1 border-l border-slate-700 pl-3">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Number</span>
          <p className="text-xs font-bold text-white truncate">{phoneNumber || "-"}</p>
        </div>
        <div className="space-y-1 border-l border-slate-700 pl-3">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Amount</span>
          <p className="text-xs font-bold text-emerald-400 truncate">
            {amount ? `RM${amount}` : "-"}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
