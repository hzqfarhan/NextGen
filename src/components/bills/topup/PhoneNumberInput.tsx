import { Contact } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";
import { TELCO_PROVIDERS, TelcoProvider } from "./TelcoProviderGrid";

interface PhoneNumberInputProps {
  value: string;
  onChange: (value: string) => void;
  onProviderDetected: (provider: TelcoProvider) => void;
}

export function PhoneNumberInput({ value, onChange, onProviderDetected }: PhoneNumberInputProps) {
  // Simple format: 01X-XXXXXXX
  const handleFormat = (raw: string) => {
    // Remove all non-digits
    let cleaned = raw.replace(/\D/g, "");
    
    // Limit to 11 digits (max Malaysian mobile number length e.g. 011-XXXXXXXX)
    if (cleaned.length > 11) cleaned = cleaned.slice(0, 11);

    // Format with hyphen
    if (cleaned.length > 3) {
      cleaned = `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    }
    
    onChange(cleaned);
  };

  // Prefix detection
  useEffect(() => {
    if (value.length >= 3) {
      const prefix = value.replace(/\D/g, "").slice(0, 3);
      
      // Basic mock logic for prefix detection
      let detectedId = null;
      if (["012", "017", "014"].includes(prefix)) detectedId = "hotlink"; // Maxis
      else if (["019", "013", "015"].includes(prefix)) detectedId = "celcom";
      else if (["016", "014"].includes(prefix)) detectedId = "digi";
      else if (["018"].includes(prefix)) detectedId = "umobile";
      
      if (detectedId) {
        const provider = TELCO_PROVIDERS.find(p => p.id === detectedId);
        if (provider) {
          onProviderDetected(provider);
        }
      }
    }
  }, [value, onProviderDetected]);

  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
        Mobile Number
      </label>
      <div className="relative">
        <Input
          type="tel"
          inputMode="numeric"
          placeholder="01X-XXXXXXX"
          value={value}
          onChange={(e) => handleFormat(e.target.value)}
          className="w-full text-lg font-bold tracking-widest h-14 rounded-2xl bg-slate-50 border-slate-200 focus:border-primary/50 pl-4 pr-12 transition-all"
        />
        <button 
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-slate-200/50 text-slate-500 hover:bg-slate-200 hover:text-slate-700 flex items-center justify-center transition-colors"
          title="Choose from Contacts"
        >
          <Contact className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
