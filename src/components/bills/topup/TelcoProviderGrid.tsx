import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { TelcoProvider, TelcoProviderCard } from "./TelcoProviderCard";
import { motion } from "framer-motion";

export const TELCO_PROVIDERS: TelcoProvider[] = [
  { id: "hotlink", name: "Hotlink", color: "#E02A26", logoText: "H" },
  { id: "celcom", name: "Celcom", color: "#0067B1", logoText: "C" },
  { id: "digi", name: "Digi", color: "#FFCC00", logoText: "D" },
  { id: "umobile", name: "U Mobile", color: "#F05A28", logoText: "U" },
  { id: "yes", name: "Yes", color: "#FF007F", logoText: "Y" },
  { id: "tunetalk", name: "Tune Talk", color: "#E31837", logoText: "T" },
  { id: "redone", name: "redONE", color: "#DA251D", logoText: "r" },
  { id: "xox", name: "XOX", color: "#00B4B6", logoText: "X" },
  { id: "halo", name: "Halo", color: "#00A859", logoText: "Ha" },
];

interface TelcoProviderGridProps {
  selectedProviderId: string | null;
  onSelect: (provider: TelcoProvider) => void;
}

export function TelcoProviderGrid({ selectedProviderId, onSelect }: TelcoProviderGridProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProviders = useMemo(() => {
    if (!searchQuery) return TELCO_PROVIDERS;
    const lowerQuery = searchQuery.toLowerCase();
    return TELCO_PROVIDERS.filter((p) => p.name.toLowerCase().includes(lowerQuery));
  }, [searchQuery]);

  return (
    <div className="space-y-4">
      {TELCO_PROVIDERS.length > 10 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search Provider..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 rounded-2xl bg-slate-50 border-slate-200 h-11 focus:border-primary/50 text-sm"
          />
        </div>
      )}

      <motion.div 
        layout
        className="grid grid-cols-3 gap-3 md:gap-4"
      >
        {filteredProviders.map((provider) => (
          <TelcoProviderCard
            key={provider.id}
            provider={provider}
            isSelected={selectedProviderId === provider.id}
            onSelect={onSelect}
          />
        ))}
      </motion.div>
      
      {filteredProviders.length === 0 && (
        <div className="text-center py-8 text-slate-500 text-sm">
          No providers found matching "{searchQuery}"
        </div>
      )}
    </div>
  );
}
