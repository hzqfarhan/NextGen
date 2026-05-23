"use client"

import { useStore } from "@/store/useStore"

import { Button } from "@/components/ui/button"
import { Shield, AlertTriangle, CheckCircle2 } from "lucide-react"
import { motion } from "framer-motion"
import { useState } from "react"

export function SpendGuardModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { toggleSpendGuard, safeDailySpend } = useStore()
  const [isSuccess, setIsSuccess] = useState(false)

  const handleActivate = () => {
    toggleSpendGuard()
    setIsSuccess(true)
    setTimeout(() => {
      setIsSuccess(false)
      onClose()
    }, 2000)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm glass-card p-6 space-y-6"
      >
        {!isSuccess ? (
          <>
            <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto text-amber-500">
              <Shield className="w-8 h-8" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold">Activate Impulse Guard?</h2>
              <p className="text-xs text-muted-foreground">
                Activating Impulse Guard will reduce your daily limit to <span className="text-slate-900 font-bold">RM 15.00</span> and lock non-essential categories until your next allowance.
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-100/50 border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <p className="text-[11px]">Protects RM 60.00 for upcoming bills</p>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-100/50 border border-slate-200">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <p className="text-[11px]">GrabFood & Shopping will be restricted</p>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
              <Button className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-bold" onClick={handleActivate}>
                Activate Guard
              </Button>
            </div>
          </>
        ) : (
          <div className="py-8 text-center space-y-4">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center mx-auto text-slate-900 shadow-lg shadow-emerald-500/20"
            >
              <CheckCircle2 className="w-8 h-8" />
            </motion.div>
            <h2 className="text-xl font-bold text-emerald-500">Guard Activated</h2>
            <p className="text-xs text-muted-foreground">Your finances are now under protection.</p>
          </div>
        )}
      </motion.div>
    </div>
  )
}
