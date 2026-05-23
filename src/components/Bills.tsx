"use client"

import { Bill, useStore } from "@/store/useStore"
import { t } from "@/lib/translations"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ReceiptText, 
  Plus, 
  ChevronLeft, 
  ShieldCheck, 
  CalendarClock, 
  Zap, 
  Settings2,
  RefreshCcw
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useState, useMemo } from "react"
import { BillCard } from "./bills/BillCard"
import { BillSetupModal } from "./bills/BillSetupModal"
import Link from "next/link"
import { Badge } from "./ui/badge"
import { cn } from "@/lib/utils"

export function Bills() {
  const { bills, language, processAutoPay } = useStore()
  const strings = t[language]
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingBill, setEditingBill] = useState<Bill | null>(null)
  const [activeTab, setActiveTab] = useState<'upcoming' | 'paid'>('upcoming')

  const handleEdit = (bill: Bill) => {
    setEditingBill(bill)
    setShowAddModal(true)
  }

  const handleCloseModal = () => {
    setShowAddModal(false)
    setEditingBill(null)
  }

  const lockedAmount = useMemo(() => 
    bills.filter(b => b.isLocked && b.status !== 'paid')
         .reduce((sum, b) => sum + b.amount, 0)
  , [bills])

  const nextBill = useMemo(() => {
    const upcoming = bills.filter(b => b.status !== 'paid')
      .sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime());
    return upcoming[0];
  }, [bills])

  const autoPayCount = bills.filter(b => b.autopayEnabled).length;
  const needsSetupCount = bills.filter(b => b.status === 'needs_setup').length;

  const upcomingBills = bills.filter(b => b.status !== 'paid');
  const paidBills = bills.filter(b => b.status === 'paid');

  return (
    <div className="p-4 space-y-6 pb-24 max-w-lg mx-auto text-slate-900">
      {/* Header */}
      <header className="flex items-center justify-between gap-4 pt-2">
        <Link href="/dashboard" className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 hover:text-primary transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-black tracking-tight text-slate-900">{strings.billsHeader}</h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest leading-tight">PROTECT YOUR ESSENTIALS</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20 hover:scale-110 active:scale-95 transition-all"
        >
          <Plus className="w-6 h-6" />
        </button>
      </header>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white/80 backdrop-blur-md rounded-[1.5rem] p-3 flex flex-col gap-1.5 border border-pink-500/30 shadow-[0_8px_32px_rgba(223,0,89,0.06)] hover:scale-102 transition-all duration-300">
          <span className="text-[8px] font-black uppercase tracking-widest text-pink-600 leading-none">{strings.billsProtected}</span>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-pink-600 flex-shrink-0" />
            <p className="text-[13px] font-black text-slate-900 leading-none whitespace-nowrap">RM{lockedAmount.toFixed(0)}</p>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-[1.5rem] p-3 flex flex-col gap-1.5 border border-slate-200 shadow-[0_8px_32px_rgba(0,0,0,0.04)] hover:scale-102 transition-all duration-300">
          <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 leading-none">{strings.billsNext}</span>
          <div className="flex items-center gap-1.5">
            <CalendarClock className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
            <p className="text-[10px] font-black leading-none text-slate-900 truncate max-w-[60px]">{nextBill ? nextBill.name : '-'}</p>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-[1.5rem] p-3 flex flex-col gap-1.5 border border-emerald-500/30 shadow-[0_8px_32px_rgba(16,185,129,0.06)] hover:scale-102 transition-all duration-300">
          <span className="text-[8px] font-black uppercase tracking-widest text-emerald-600 leading-none">{strings.billsAutoPay}</span>
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <p className="text-[13px] font-black leading-none text-slate-900 whitespace-nowrap">{autoPayCount} {strings.billsActive}</p>
          </div>
        </div>
      </div>

      {/* Status Banner */}
      {needsSetupCount > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex gap-3 items-center"
        >
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-500">
            <Settings2 className="w-4 h-4" />
          </div>
          <p className="text-xs font-semibold text-amber-500 flex-1">
            {needsSetupCount} {strings.billsNeedsSetup}
          </p>
          <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/30">
            ACTION
          </Badge>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex p-1 bg-slate-100/90 backdrop-blur-md border border-slate-200/80 rounded-2xl shadow-inner">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 ${
            activeTab === 'upcoming' 
              ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10' 
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          {strings.billsUpcoming} ({upcomingBills.length})
        </button>
        <button
          onClick={() => setActiveTab('paid')}
          className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 ${
            activeTab === 'paid' 
              ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10' 
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          {strings.billsPaid} ({paidBills.length})
        </button>
      </div>

      {/* List */}
      <div className="space-y-4 min-h-[300px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {(activeTab === 'upcoming' ? upcomingBills : paidBills).map(bill => (
              <BillCard key={bill.id} bill={bill} onEdit={handleEdit} />
            ))}

            {(activeTab === 'upcoming' ? upcomingBills : paidBills).length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200/60 flex items-center justify-center shadow-inner">
                  <ReceiptText className="w-8 h-8 text-slate-400/80" />
                </div>
                <p className="text-sm font-semibold tracking-wide text-slate-500">No {activeTab} bills found</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-center">
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => processAutoPay()}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/80 border border-slate-200/80 text-slate-500 hover:text-slate-900 transition-all hover:bg-slate-50 hover:border-slate-300 shadow-sm"
        >
          <RefreshCcw className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">Process Simulated AutoPay</span>
        </motion.button>
      </div>

      <BillSetupModal 
        isOpen={showAddModal} 
        onClose={handleCloseModal}
        editingBill={editingBill}
      />
    </div>
  )
}
