"use client"

import { useStore } from "@/store/useStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle2, DollarSign, Wallet, ArrowUpCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { t } from "@/lib/translations"
import { cn } from "@/lib/utils"

export function TopUpModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { addTransaction, language } = useStore()
  const [amount, setAmount] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)
  const strings = t[language]

  const quickFills = [10, 50, 100, 500]

  const handleQuickFill = (val: number) => {
    setAmount(val.toString())
  }

  const handleTopUp = () => {
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) return

    addTransaction({
      id: Date.now().toString(),
      title: "Top Up Wallet",
      amount: numAmount,
      category: "Income",
      date: new Date().toISOString(),
      type: 'income',
      confidence: 1.0
    })

    setIsSuccess(true)
    setTimeout(() => {
      setIsSuccess(false)
      setAmount("")
      onClose()
    }, 2000)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-sm glass-card p-6 space-y-6"
      >
        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto text-emerald-500">
                <ArrowUpCircle className="w-8 h-8 animate-pulse" />
              </div>

              <div className="text-center space-y-1">
                <h2 className="text-xl font-bold">{strings.topUpTitle}</h2>
                <p className="text-xs text-muted-foreground">Load funds instantly to restore your safe limit.</p>
              </div>

              {/* Amount Input */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1 block">
                  Top Up Amount
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground/30 text-xl">RM</span>
                  <Input 
                    type="number" 
                    min="0"
                    placeholder="0.00" 
                    value={amount}
                    onKeyDown={(e) => {
                      if (['-', 'e', '+'].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || parseFloat(val) >= 0) {
                        setAmount(val);
                      }
                    }}
                    className="pl-14 h-20 text-4xl font-black text-emerald-500 bg-foreground/5 border-border rounded-3xl placeholder:text-muted-foreground/10 focus-visible:ring-emerald-500/50 transition-all shadow-inner text-center pr-4"
                  />
                  <div className="absolute inset-0 rounded-3xl border border-emerald-500/0 group-focus-within:border-emerald-500/30 transition-colors pointer-events-none" />
                </div>
              </div>

              {/* Quick Fill Chips */}
              <div className="grid grid-cols-4 gap-2">
                {quickFills.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleQuickFill(val)}
                    className={cn(
                      "py-3 text-[10px] font-black rounded-xl border transition-all active:scale-95",
                      amount === val.toString()
                        ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                        : "bg-foreground/5 border-border text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-500 hover:border-emerald-500/20"
                    )}
                  >
                    +{val}
                  </button>
                ))}
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  variant="ghost" 
                  className="flex-1 h-12 rounded-2xl font-bold text-muted-foreground" 
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button 
                  disabled={!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0}
                  className="flex-1 h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-2xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                  onClick={handleTopUp}
                >
                  Confirm Top Up
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="py-8 text-center space-y-4"
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ duration: 0.5 }}
                className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center mx-auto text-white shadow-lg shadow-emerald-500/20"
              >
                <CheckCircle2 className="w-8 h-8" />
              </motion.div>
              <h2 className="text-xl font-bold text-emerald-500">{strings.topUpSuccess}</h2>
              <p className="text-xs text-muted-foreground">{strings.topUpSuccessDesc}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
