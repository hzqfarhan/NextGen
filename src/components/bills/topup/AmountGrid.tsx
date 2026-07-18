import { AmountCard } from "./AmountCard";
import { motion } from "framer-motion";

const PRESET_AMOUNTS = [5, 10, 30, 60, 100];

interface AmountGridProps {
  selectedAmount: number | null;
  onSelect: (amount: number) => void;
}

export function AmountGrid({ selectedAmount, onSelect }: AmountGridProps) {
  return (
    <motion.div 
      layout
      className="grid grid-cols-2 gap-3"
    >
      {PRESET_AMOUNTS.map((amount) => (
        <AmountCard
          key={amount}
          amount={amount}
          isSelected={selectedAmount === amount}
          onClick={() => onSelect(amount)}
        />
      ))}
    </motion.div>
  );
}
