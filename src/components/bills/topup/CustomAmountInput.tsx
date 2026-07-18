import { Input } from "@/components/ui/input";

interface CustomAmountInputProps {
  value: string;
  onChange: (value: string) => void;
  onFocus: () => void;
  error?: string;
}

export function CustomAmountInput({ value, onChange, onFocus, error }: CustomAmountInputProps) {
  // Only allow numbers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === "" || /^[0-9\b]+$/.test(raw)) {
      onChange(raw);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
        Other Amount
      </label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
          RM
        </span>
        <Input
          type="text"
          inputMode="numeric"
          placeholder="0"
          value={value}
          onChange={handleChange}
          onFocus={onFocus}
          className={`w-full text-lg font-bold h-14 rounded-2xl bg-slate-50 pl-12 transition-all ${
            error 
              ? "border-destructive focus:border-destructive/50 focus:ring-destructive/20" 
              : "border-slate-200 focus:border-primary/50"
          }`}
        />
      </div>
      {error && (
        <p className="text-xs font-semibold text-destructive ml-1">
          {error}
        </p>
      )}
    </div>
  );
}
