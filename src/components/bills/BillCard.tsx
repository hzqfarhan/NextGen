"use client"

import { Bill, useStore } from "@/store/useStore"
import { t } from "@/lib/translations"
import { motion } from "framer-motion"
import { BILL_TEMPLATES } from "@/lib/billTemplates"
import { 
  Lock, 
  Unlock, 
  Zap, 
  ZapOff, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  MoreVertical,
  Pencil,
  Trash2,
  ExternalLink
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { maskAccountNumber } from "@/lib/billEngine"
import { useState } from "react"
import { BillDeleteConfirmModal } from "./BillDeleteConfirmModal"
import { BillPaymentConfirmModal } from "./BillPaymentConfirmModal"
import { cn } from "@/lib/utils"

interface BillCardProps {
  bill: Bill
  onEdit: (bill: Bill) => void
}

export function BillCard({ bill, onEdit }: BillCardProps) {
  const { language, toggleBillLock, toggleBillAutopay, payBillNow, deleteBill } = useStore()
  const strings = t[language]
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showPayModal, setShowPayModal] = useState(false)

  const isPaid = bill.status === 'paid'
  const needsSetup = bill.status === 'needs_setup'
  
  const getStatusConfig = () => {
    switch (bill.status) {
      case 'paid':
        return { color: 'bg-emerald-500/10 text-emerald-600', icon: CheckCircle2, label: strings.billsPaid }
      case 'needs_setup':
        return { color: 'bg-amber-500/10 text-amber-600', icon: AlertCircle, label: strings.billsNeedsSetup }
      case 'paused':
        return { color: 'bg-rose-500/10 text-rose-600', icon: ZapOff, label: strings.billsUnsafe }
      case 'upcoming':
      default:
        return { color: 'bg-blue-500/10 text-blue-600', icon: Clock, label: strings.billsUpcoming }
    }
  }

  const status = getStatusConfig()
  const StatusIcon = status.icon

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <Card className={`glass-card overflow-hidden transition-all duration-300 ${bill.isLocked && !isPaid ? 'ring-2 ring-pink-500/40 border-pink-500/30' : ''}`}>
        <CardContent className="p-4 space-y-4">
          {/* Top Row: Name and Menu */}
          <div className="flex justify-between items-start">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/60 flex items-center justify-center text-xl shadow-inner">
                {BILL_TEMPLATES.find(t => t.category === bill.category)?.icon || '🧾'}
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">{bill.name}</h3>
                <div className="flex items-center gap-2">
                  <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest leading-tight">
                    {bill.category} {bill.accountNumber && `• ${maskAccountNumber(bill.accountNumber)}`}
                  </p>
                  {bill.mode === 'auto_track' && (
                    <Badge variant="outline" className="text-[7px] px-1 py-0 border-primary/30 text-primary uppercase font-black bg-primary/5">Auto-Track</Badge>
                  )}
                  {bill.mode === 'budget_lock' && (
                    <Badge variant="outline" className="text-[7px] px-1 py-0 border-amber-500/30 text-amber-500 uppercase font-black bg-amber-500/5">Budget Lock</Badge>
                  )}
                </div>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                }
              />
              <DropdownMenuContent className="rounded-xl border-slate-200 bg-white/95 backdrop-blur-xl shadow-lg">
                <DropdownMenuItem 
                  className="text-xs font-bold gap-2 text-slate-700 hover:text-slate-900 focus:bg-slate-50 cursor-pointer"
                  onClick={() => onEdit(bill)}
                >
                  <Pencil className="w-3.5 h-3.5" /> {strings.billsEdit}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-xs font-bold gap-2 text-rose-600 focus:text-rose-700 focus:bg-rose-50 cursor-pointer"
                  onClick={() => setShowDeleteModal(true)}
                >
                  <Trash2 className="w-3.5 h-3.5" /> {strings.billsDelete}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Middle Row: Amount and Status */}
          <div className="flex justify-between items-end">
            <div>
              <p className="text-2xl font-black text-slate-900">RM {bill.amount.toFixed(2)}</p>
              {!isPaid && (
                <p className="text-[10px] font-bold text-slate-500">
                  {strings.billsNext}: {new Date(bill.nextDueDate).toLocaleDateString(language === 'ms' ? 'ms-MY' : 'en-MY', { day: 'numeric', month: 'short' })}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <Badge variant="outline" className={cn("rounded-lg border-transparent px-2 py-1 text-[10px] font-black uppercase flex gap-1 items-center", status.color)}>
                <StatusIcon className="w-3 h-3" />
                {status.label}
              </Badge>
              {bill.mode === 'simulated_autopay' && bill.autopayEnabled && (
                <span className="text-[8px] font-black text-emerald-600 uppercase tracking-tighter">AutoPay Ready</span>
              )}
            </div>
          </div>

          {/* Bottom Row: Actions */}
          <div className="pt-3 flex items-center justify-between border-t border-slate-200/60">
            <div className="flex gap-4">
              <div className="flex flex-col items-center gap-1.5">
                <button 
                  onClick={() => toggleBillLock(bill.id)}
                  disabled={isPaid}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                    bill.isLocked 
                      ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/30 scale-110' 
                      : 'bg-slate-100 text-slate-400 border border-slate-200/60 hover:bg-slate-200/60'
                  } ${isPaid ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
                >
                  {bill.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                </button>
                <span className="text-[9px] font-black uppercase tracking-tighter text-slate-500">{strings.billsLock}</span>
              </div>

              <div className="flex flex-col items-center gap-1.5">
                <button 
                  onClick={() => toggleBillAutopay(bill.id)}
                  disabled={isPaid}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                    bill.autopayEnabled 
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-110' 
                      : 'bg-slate-100 text-slate-400 border border-slate-200/60 hover:bg-slate-200/60'
                  } ${isPaid ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
                >
                  <Zap className="w-4 h-4" />
                </button>
                <span className="text-[9px] font-black uppercase tracking-tighter text-slate-500">{strings.billsAutoPay}</span>
              </div>
            </div>

            {!isPaid && (
              <Button 
                size="sm" 
                className={`rounded-xl h-10 px-5 text-white text-xs font-black uppercase tracking-widest transition-all ${needsSetup ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' : 'bg-primary hover:bg-primary/90 shadow-primary/20 shadow-lg'}`}
                onClick={() => needsSetup ? onEdit(bill) : setShowPayModal(true)}
              >
                {needsSetup ? strings.billsCompleteSetup : strings.billsPayNow}
              </Button>
            )}

            {isPaid && bill.lastPaidAt && (
              <div className="text-[10px] font-black text-emerald-600 flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                PAID {new Date(bill.lastPaidAt).toLocaleDateString()}
              </div>
            )}
          </div>
          
          {needsSetup && !isPaid && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-600 font-bold flex items-center gap-2 animate-pulse">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              {strings.billsNoAcc}
            </div>
          )}
        </CardContent>
      </Card>

      <BillDeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => {
          deleteBill(bill.id)
          setShowDeleteModal(false)
        }}
        title={bill.name}
      />

      <BillPaymentConfirmModal
        isOpen={showPayModal}
        onClose={() => setShowPayModal(false)}
        onConfirm={() => payBillNow(bill.id)}
        billName={bill.name}
        amount={bill.amount}
      />
    </motion.div>
  )
}
