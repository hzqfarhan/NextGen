"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useStore, Bill } from "@/store/useStore";
import { TelcoProvider } from "../topup/TelcoProviderCard";
import { TelcoProviderGrid } from "../topup/TelcoProviderGrid";
import { PhoneNumberInput } from "../topup/PhoneNumberInput";
import { ContinueButton } from "../topup/ContinueButton";
import { Input } from "@/components/ui/input";

interface PostpaidSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = "provider" | "details" | "payment";

export function PostpaidSetupModal({ isOpen, onClose }: PostpaidSetupModalProps) {
  const { addBill } = useStore();
  
  const [step, setStep] = useState<Step>("provider");
  const [provider, setProvider] = useState<TelcoProvider | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDay, setDueDay] = useState("");
  const [billerCode, setBillerCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  const resetState = () => {
    setStep("provider");
    setProvider(null);
    setPhoneNumber("");
    setAmount("");
    setDueDay("");
    setBillerCode("");
    setAccountNumber("");
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const isDetailsValid = phoneNumber.length >= 10 && Number(amount) > 0 && Number(dueDay) >= 1 && Number(dueDay) <= 31;
  const isPaymentValid = billerCode.length >= 4 && accountNumber.length >= 6;

  const handleSubmit = () => {
    if (!provider || !isDetailsValid || !isPaymentValid) return;

    const dueDayNum = Number(dueDay);
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    let nextDue = new Date(year, month, dueDayNum);
    if (nextDue.getTime() < now.getTime()) {
      nextDue = new Date(year, month + 1, dueDayNum);
    }
    const nextDueDateStr = nextDue.toISOString();

    const newBill: Bill = {
      id: Math.random().toString(36).substring(7),
      name: `${provider.name} Postpaid`,
      category: "phone",
      amount: Number(amount),
      dueDay: dueDayNum,
      dueDate: nextDueDateStr,
      nextDueDate: nextDueDateStr,
      frequency: "monthly",
      isLocked: true,
      mode: "simulated_autopay",
      paymentRail: "jompay",
      autopayEnabled: true,
      autopaySafety: "balanced",
      reminderDaysBefore: 3,
      status: "upcoming",
      source: "manual",
      provider: provider.name,
      referenceNumber: phoneNumber, // Mobile number
      billerCode: billerCode,
      accountNumber: accountNumber,
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
          {step === "provider" && (
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
                    Postpaid Bill
                  </DialogDescription>
                </DialogHeader>
              </div>
              
              <div className="p-6 pt-4 overflow-y-auto custom-scrollbar flex-1">
                <TelcoProviderGrid selectedProviderId={provider?.id || null} onSelect={setProvider} />
              </div>

              <div className="p-6 pt-4 bg-slate-50 border-t border-slate-100">
                <ContinueButton disabled={!provider} onClick={() => setStep("details")} />
              </div>
            </motion.div>
          )}

          {step === "details" && (
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
                  <DialogTitle className="text-xl font-black tracking-tight">Bill Details</DialogTitle>
                  <DialogDescription className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    {provider?.name} Postpaid
                  </DialogDescription>
                </DialogHeader>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                <PhoneNumberInput 
                  value={phoneNumber} 
                  onChange={setPhoneNumber} 
                  onProviderDetected={(detected) => {
                    if (detected.id !== provider?.id) setProvider(detected);
                  }} 
                />

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
                      Monthly Commitment (RM)
                    </label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full text-lg font-bold h-14 rounded-2xl bg-slate-50 border-slate-200 focus:border-primary/50 transition-all pl-4"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
                      Due Day of Month
                    </label>
                    <Input
                      type="number"
                      placeholder="15"
                      min={1} max={31}
                      value={dueDay}
                      onChange={(e) => setDueDay(e.target.value)}
                      className="w-full text-lg font-bold h-14 rounded-2xl bg-slate-50 border-slate-200 focus:border-primary/50 transition-all pl-4"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 pt-4 bg-slate-50 border-t border-slate-100">
                <ContinueButton label="Continue to Payment Info" disabled={!isDetailsValid} onClick={() => setStep("payment")} />
              </div>
            </motion.div>
          )}

          {step === "payment" && (
            <motion.div
              key="payment"
              custom={1}
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col h-full max-h-[85vh]"
            >
              <div className="p-6 pb-2 flex items-center gap-3">
                <button 
                  onClick={() => setStep("details")}
                  className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors -ml-2"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <DialogHeader className="flex-1">
                  <DialogTitle className="text-xl font-black tracking-tight">Payment Setup</DialogTitle>
                  <DialogDescription className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    JomPAY / Auto-track
                  </DialogDescription>
                </DialogHeader>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
                      JomPAY Biller Code
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g. 1234"
                      value={billerCode}
                      onChange={(e) => setBillerCode(e.target.value.replace(/\D/g, ''))}
                      className="w-full text-lg font-bold h-14 rounded-2xl bg-slate-50 border-slate-200 focus:border-primary/50 transition-all pl-4"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
                      Account Number (Ref-1)
                    </label>
                    <Input
                      type="text"
                      placeholder="•••• ••••"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="w-full text-lg font-bold h-14 rounded-2xl bg-slate-50 border-slate-200 focus:border-primary/50 transition-all pl-4 tracking-widest"
                    />
                  </div>
                </div>
                
                <div className="p-4 rounded-[1.5rem] bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-semibold">
                  We'll use this information to automatically track and pay your postpaid bill safely.
                </div>
              </div>

              <div className="p-6 pt-4 bg-slate-50 border-t border-slate-100">
                <ContinueButton label="Confirm Bill Setup" disabled={!isPaymentValid} onClick={handleSubmit} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
