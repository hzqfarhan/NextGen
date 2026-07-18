import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TelcoProvider {
  id: string;
  name: string;
  color: string;
  logoText: string;
}

interface TelcoProviderCardProps {
  provider: TelcoProvider;
  isSelected: boolean;
  onSelect: (provider: TelcoProvider) => void;
}

export function TelcoProviderCard({ provider, isSelected, onSelect }: TelcoProviderCardProps) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(provider)}
      className={cn(
        "relative flex flex-col items-center justify-center p-4 rounded-2xl w-full aspect-square transition-all duration-300",
        "border bg-white",
        isSelected 
          ? "shadow-lg" 
          : "border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200"
      )}
      style={{
        borderColor: isSelected ? provider.color : undefined,
      }}
    >
      {/* Brand Icon Placeholder */}
      <div 
        className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black text-white shadow-inner mb-3"
        style={{ backgroundColor: provider.color }}
      >
        {provider.logoText}
      </div>

      <span 
        className={cn(
          "text-xs font-bold text-center",
          isSelected ? "text-slate-900" : "text-slate-600"
        )}
      >
        {provider.name}
      </span>

      {/* Selected Checkmark */}
      {isSelected && (
        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-white shadow-sm"
          style={{ backgroundColor: provider.color }}
        >
          <Check className="w-3 h-3" />
        </motion.div>
      )}
      
      {/* Subtle background glow when selected */}
      {isSelected && (
        <div 
          className="absolute inset-0 rounded-2xl opacity-[0.03] pointer-events-none"
          style={{ backgroundColor: provider.color }}
        />
      )}
    </motion.button>
  );
}
