"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CreditCard, ShieldCheck } from "lucide-react"
import { useStore } from "@/store/useStore"
import { t } from "@/lib/translations"

interface BillPaymentConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  billName: string
  amount: number
}

export function BillPaymentConfirmModal({ isOpen, onClose, onConfirm, billName, amount }: BillPaymentConfirmModalProps) {
  const { language } = useStore()
  const strings = t[language]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] glass-card border-slate-200 text-slate-900">
        <div className="space-y-6 py-4">
          <DialogHeader className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/20">
              <CreditCard className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-2xl font-black">{strings.billsPayNow}?</DialogTitle>
              <DialogDescription className="text-xs text-slate-500 uppercase font-black tracking-widest">
                {billName}
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/60 flex flex-col items-center gap-2 shadow-inner">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Amount</p>
            <p className="text-4xl font-black text-slate-900">RM {amount.toFixed(2)}</p>
          </div>

          <div className="flex gap-3 items-start p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <p className="text-[10px] text-emerald-600/80 font-medium leading-tight">
              Paying this bill will update your balance and record this transaction in your history.
            </p>
          </div>
          
          <DialogFooter className="grid grid-cols-2 gap-3 mt-2">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onClose}
              className="rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 font-bold"
            >
              {strings.billsCancel}
            </Button>
            <Button 
              type="button" 
              onClick={() => {
                onConfirm()
                onClose()
              }}
              className="rounded-xl bg-primary hover:bg-primary/90 text-white font-black shadow-lg shadow-primary/20"
            >
              {strings.billsPayNow}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
