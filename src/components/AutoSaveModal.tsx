"use client"

import { useState, useEffect } from "react"
import { useStore } from "@/store/useStore"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar, Clock, Target, Check, LayoutGrid } from "lucide-react"
import { cn } from "@/lib/utils"

interface AutoSaveModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AutoSaveModal({ isOpen, onClose }: AutoSaveModalProps) {
  const {
    savingsPockets,
    autoSaveFrequency,
    autoSaveAmount,
    autoSaveTargetIds,
    setAutoSaveTargetIds,
    isAutoSaveActive
  } = useStore()

  const [frequency, setFrequency] = useState(autoSaveFrequency)
  const [amount, setAmount] = useState(autoSaveAmount.toString())
  const [selectedIds, setSelectedIds] = useState<string[]>(autoSaveTargetIds)

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setFrequency(autoSaveFrequency)
      setAmount(autoSaveAmount.toString())
      setSelectedIds(autoSaveTargetIds)
    }
  }, [isOpen, autoSaveFrequency, autoSaveAmount, autoSaveTargetIds])

  const toggleTarget = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    )
  }

  const selectAll = () => {
    if (selectedIds.length === savingsPockets.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(savingsPockets.map(p => p.id))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    useStore.setState({
      autoSaveFrequency: frequency,
      autoSaveAmount: parseFloat(amount),
      autoSaveTargetIds: selectedIds,
      isAutoSaveActive: true
    })

    onClose()
  }

  const allSelected = selectedIds.length === savingsPockets.length

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] glass-card border-white/10 text-foreground">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" /> Setup Auto-Save
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Frequency */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1 flex items-center gap-2">
              <Clock className="w-3 h-3" /> Frequency
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['daily', 'weekly', 'monthly'].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFrequency(f as any)}
                  className={cn(
                    "py-2 rounded-xl text-[10px] font-bold border transition-all capitalize",
                    frequency === f
                      ? "bg-primary text-slate-900 border-primary shadow-lg shadow-primary/20"
                      : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
              Amount (RM)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">RM</span>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-white/5 border-white/10 h-12 rounded-xl pl-12 font-bold text-lg"
              />
            </div>
          </div>

          {/* Target Pocket */}
          <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Target className="w-3 h-3" /> Select Destinations
              </label>
              <button
                type="button"
                onClick={selectAll}
                className="text-[10px] font-bold text-primary hover:underline transition-all"
              >
                {allSelected ? "Deselect All" : "Select All"}
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2 max-h-[180px] overflow-y-auto pr-1 scrollbar-hide">
              {savingsPockets.map((p) => {
                const isSelected = selectedIds.includes(p.id)
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggleTarget(p.id)}
                    className={cn(
                      "p-3 rounded-xl border flex items-center justify-between transition-all",
                      isSelected
                        ? "bg-primary/10 border-primary/50"
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center text-sm shadow-inner transition-colors",
                        isSelected ? "bg-primary/20" : "bg-secondary"
                      )}>
                        {p.icon}
                      </div>
                      <span className={cn(
                        "text-xs font-bold transition-colors",
                        isSelected ? "text-primary" : "text-foreground"
                      )}>{p.name}</span>
                    </div>
                    <div className={cn(
                      "w-5 h-5 rounded-md border flex items-center justify-center transition-all",
                      isSelected ? "bg-primary border-primary text-slate-900" : "border-white/20 bg-white/5"
                    )}>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                )
              })}
            </div>
            {selectedIds.length > 0 && (
              <p className="text-[10px] text-center text-emerald-500 font-medium animate-in fade-in slide-in-from-top-1">
                Saving will be split between {selectedIds.length} pocket{selectedIds.length > 1 ? 's' : ''} (RM {(parseFloat(amount) / selectedIds.length).toFixed(2)} each)
              </p>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="submit"
              disabled={selectedIds.length === 0 || !amount || parseFloat(amount) <= 0}
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-slate-900 font-bold text-sm shadow-lg shadow-primary/20 disabled:opacity-50 disabled:grayscale"
            >
              Confirm Setup
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
