"use client"

import { useState, useEffect } from "react"
import { useStore, SavingsPocket } from "@/store/useStore"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { t } from "@/lib/translations"
import { motion, AnimatePresence } from "framer-motion"

interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  pocket: SavingsPocket | null
}

export function DeleteConfirmModal({ isOpen, onClose, pocket }: DeleteConfirmModalProps) {
  const { deleteSavingsPocket, language } = useStore()
  const strings = t[language]
  const [isSuccess, setIsSuccess] = useState(false)
  const [refundedAmount, setRefundedAmount] = useState(0)

  // Reset success state when modal closes/opens
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => setIsSuccess(false), 300)
    }
  }, [isOpen])

  const handleDelete = () => {
    if (pocket) {
      setRefundedAmount(pocket.current)
      deleteSavingsPocket(pocket.id)
      setIsSuccess(true)
    }
  }

  if (!pocket && !isSuccess) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`sm:max-w-[400px] glass-card transition-all duration-500 ${isSuccess ? "border-emerald-500/20" : "border-rose-500/20"} text-foreground`}>
        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-4"
            >
              <DialogHeader className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
                  <AlertCircle className="w-10 h-10" />
                </div>
                <DialogTitle className="text-xl font-bold">{strings.saveDeleteConfirm}</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  {strings.saveDeleteNotice}
                  <br />
                  <span className="font-bold text-emerald-500 mt-2 block italic">
                    + RM {pocket?.current.toFixed(2)} to Balance
                  </span>
                </DialogDescription>
              </DialogHeader>
              
              <DialogFooter className="grid grid-cols-2 gap-3 mt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClose}
                  className="rounded-xl border-white/10 hover:bg-white/5"
                >
                  {strings.logoutCancel}
                </Button>
                <Button 
                  type="button" 
                  onClick={handleDelete}
                  className="rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold"
                >
                  {strings.saveDeletePocket}
                </Button>
              </DialogFooter>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6 py-4"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 12 }}
                  >
                    <CheckCircle2 className="w-12 h-12" />
                  </motion.div>
                </div>
                <div className="space-y-1">
                  <DialogTitle className="text-2xl font-bold text-emerald-500">Refund Successful!</DialogTitle>
                  <p className="text-sm text-muted-foreground">
                    Your money has been safely returned.
                  </p>
                </div>
                
                <div className="w-full bg-emerald-500/10 rounded-2xl p-4 border border-emerald-500/20">
                  <p className="text-[10px] uppercase font-bold text-emerald-500 tracking-widest mb-1">Total Refunded</p>
                  <p className="text-3xl font-bold text-emerald-500">RM {refundedAmount.toFixed(2)}</p>
                </div>
              </div>
              
              <Button 
                type="button" 
                onClick={onClose}
                className="w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/20"
              >
                Great, thanks!
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
