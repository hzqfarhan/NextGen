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
import { AlertCircle } from "lucide-react"
import { useStore } from "@/store/useStore"
import { t } from "@/lib/translations"

interface BillDeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
}

export function BillDeleteConfirmModal({ isOpen, onClose, onConfirm, title }: BillDeleteConfirmModalProps) {
  const { language } = useStore()
  const strings = t[language]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] glass-card border-rose-500/20 text-foreground">
        <div className="space-y-4">
          <DialogHeader className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
              <AlertCircle className="w-10 h-10" />
            </div>
            <DialogTitle className="text-xl font-bold">{strings.billsDelete} {title}?</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              This action cannot be undone. You will lose the payment history and locked amount for this bill.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="grid grid-cols-2 gap-3 mt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="rounded-xl border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-900"
            >
              {strings.billsCancel}
            </Button>
            <Button 
              type="button" 
              onClick={onConfirm}
              className="rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold"
            >
              {strings.billsDelete}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
