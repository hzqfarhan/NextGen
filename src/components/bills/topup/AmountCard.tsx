import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface AmountCardProps {
  amount: number;
  isSelected: boolean;
  onClick: () => void;
}

export function AmountCard({ amount, isSelected, onClick }: AmountCardProps) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center justify-center p-4 rounded-2xl w-full h-24 transition-all duration-300",
        "border overflow-hidden",
        isSelected 
          ? "border-transparent bg-gradient-to-br from-primary to-rose-500 text-white shadow-lg shadow-primary/25" 
          : "border-slate-100 bg-white text-slate-900 shadow-sm hover:shadow-md hover:border-slate-200"
      )}
    >
      <span className={cn(
        "text-xs font-black uppercase tracking-widest mb-1 opacity-70",
        isSelected ? "text-white" : "text-slate-400"
      )}>
        Top Up
      </span>
      <span className="text-xl font-black">
        RM{amount}
      </span>

      {/* Selected Checkmark / Glow */}
      {isSelected && (
        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-white backdrop-blur-sm"
        >
          <Check className="w-3 h-3" />
        </motion.div>
      )}
    </motion.button>
  );
}
