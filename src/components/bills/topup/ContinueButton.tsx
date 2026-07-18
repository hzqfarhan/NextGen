import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface ContinueButtonProps {
  label?: string;
  disabled: boolean;
  onClick: () => void;
}

export function ContinueButton({ label = "Continue", disabled, onClick }: ContinueButtonProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/95 text-white font-black text-sm shadow-lg shadow-primary/20 transition-all disabled:opacity-50 disabled:shadow-none"
      >
        {label}
      </Button>
    </motion.div>
  );
}
