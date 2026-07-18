"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useStore, Bill } from "@/store/useStore";
import { TelcoProvider } from "./TelcoProviderCard";
import { TelcoProviderGrid } from "./TelcoProviderGrid";
import { PhoneNumberInput } from "./PhoneNumberInput";
import { AmountGrid } from "./AmountGrid";
import { CustomAmountInput } from "./CustomAmountInput";
import { SummaryCard } from "./SummaryCard";
import { ContinueButton } from "./ContinueButton";

interface TelcoTopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = "provider" | "details";

export function TelcoTopUpModal({ isOpen, onClose }: TelcoTopUpModalProps) {
  const { addBill } = useStore();
  
  const [step, setStep] = useState<Step>("provider");
  const [provider, setProvider] = useState<TelcoProvider | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [amountError, setAmountError] = useState("");

  const resetState = () => {
    setStep("provider");
    setProvider(null);
    setPhoneNumber("");
    setSelectedAmount(null);
    setCustomAmount("");
    setAmountError("");
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleProviderSelect = (p: TelcoProvider) => {
    setProvider(p);
  };

  const handleProviderContinue = () => {
    if (provider) setStep("details");
  };

  const handleAmountSelect = (amt: number) => {
    setSelectedAmount(amt);
    setCustomAmount("");
    setAmountError("");
  };

  const handleCustomAmountChange = (val: string) => {
    setCustomAmount(val);
    setSelectedAmount(null);
    if (val) {
      const num = Number(val);
      if (num < 5) setAmountError("Minimum RM5");
      else if (num > 100) setAmountError("Maximum RM100");
      else setAmountError("");
    } else {
      setAmountError("");
    }
  };

  const currentAmount = selectedAmount || (customAmount ? Number(customAmount) : null);
  const isDetailsValid = 
    phoneNumber.length >= 10 && 
    currentAmount !== null && 
    currentAmount >= 5 && 
    currentAmount <= 100 &&
    !amountError;

  const handleSubmit = () => {
    if (!provider || !isDetailsValid) return;

    const dueDayNum = new Date().getDate(); // Top up today usually
    const nextDueDateStr = new Date().toISOString();

    const newBill: Bill = {
      id: Math.random().toString(36).substring(7),
      name: `${provider.name} Prepaid`,
      category: "prepaid_topup",
      amount: currentAmount!,
      dueDay: dueDayNum,
      dueDate: nextDueDateStr,
      nextDueDate: nextDueDateStr,
      frequency: "monthly",
      isLocked: true,
      mode: "protected_only",
      paymentRail: "none",
      autopayEnabled: false,
      autopaySafety: "balanced",
      reminderDaysBefore: 3,
      status: "upcoming",
      source: "manual",
      provider: provider.name,
      referenceNumber: phoneNumber,
      createdAt: new Date().toISOString(),
    };

    addBill(newBill);
    handleClose();
  };

  const slideVariants = {
    initial: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    animate: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.25, ease: "easeOut" },
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 50 : -50,
      opacity: 0,
      transition: { duration: 0.2 },
    }),
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[420px] rounded-[2rem] p-0 overflow-hidden border border-slate-200/60 shadow-2xl bg-white text-slate-900">
        <AnimatePresence mode="wait" custom={step === "provider" ? -1 : 1}>
          {step === "provider" ? (
            <motion.div
              key="provider"
              custom={-1}
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col h-full max-h-[85vh]"
            >
              <div className="p-6 pb-2">
                <DialogHeader>
                  <DialogTitle className="text-xl font-black tracking-tight">Select Provider</DialogTitle>
                  <DialogDescription className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    Prepaid Top Up
                  </DialogDescription>
                </DialogHeader>
              </div>
              
              <div className="p-6 pt-4 overflow-y-auto custom-scrollbar flex-1">
                <TelcoProviderGrid selectedProviderId={provider?.id || null} onSelect={handleProviderSelect} />
              </div>

              <div className="p-6 pt-4 bg-slate-50 border-t border-slate-100">
                <ContinueButton disabled={!provider} onClick={handleProviderContinue} />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="details"
              custom={1}
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col h-full max-h-[85vh]"
            >
              <div className="p-6 pb-2 flex items-center gap-3">
                <button 
                  onClick={() => setStep("provider")}
                  className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors -ml-2"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <DialogHeader className="flex-1">
                  <DialogTitle className="text-xl font-black tracking-tight">{provider?.name}</DialogTitle>
                  <DialogDescription className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    Top Up Details
                  </DialogDescription>
                </DialogHeader>
              </div>

              <div className="p-6 space-y-8 overflow-y-auto custom-scrollbar flex-1">
                <PhoneNumberInput 
                  value={phoneNumber} 
                  onChange={setPhoneNumber} 
                  onProviderDetected={(detected) => {
                    // Only auto-switch if different and it's a valid change
                    if (detected.id !== provider?.id) {
                      setProvider(detected);
                    }
                  }} 
                />

                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
                    Top Up Amount
                  </label>
                  <AmountGrid selectedAmount={selectedAmount} onSelect={handleAmountSelect} />
                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-slate-200"></div>
                    <span className="flex-shrink-0 mx-4 text-xs font-bold text-slate-400 uppercase tracking-widest">or</span>
                    <div className="flex-grow border-t border-slate-200"></div>
                  </div>
                  <CustomAmountInput 
                    value={customAmount} 
                    onChange={handleCustomAmountChange} 
                    onFocus={() => setSelectedAmount(null)}
                    error={amountError}
                  />
                </div>
              </div>

              <div className="p-6 pt-4 bg-slate-50 border-t border-slate-100 space-y-4">
                <div className="hidden sm:block">
                  <SummaryCard provider={provider} phoneNumber={phoneNumber} amount={currentAmount} />
                </div>
                <ContinueButton label="Continue Payment" disabled={!isDetailsValid} onClick={handleSubmit} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
