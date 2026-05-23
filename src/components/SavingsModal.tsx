"use client"

import { useState, useEffect } from "react"
import { useStore, SavingsPocket } from "@/store/useStore"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { t } from "@/lib/translations"
import { Target, Shield, TrendingUp, AlertTriangle, Info, Sparkles, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface SavingsModalProps {
  isOpen: boolean
  onClose: () => void
  editPocket?: SavingsPocket | null
}

const EMOJI_OPTIONS = ["🛡️", "💻", "🏠", "🚗", "✈️", "🎓", "🎮", "🎁", "🏥", "💰", "💍", "🎨", "🍔", "👟"]

export function SavingsModal({ isOpen, onClose, editPocket }: SavingsModalProps) {
  const { addSavingsPocket, updateSavingsPocket, language, pendingMainGoal } = useStore()
  const strings = t[language]

  const [name, setName] = useState("")
  const [target, setTarget] = useState("")
  const [icon, setIcon] = useState("💰")
  const [mode, setMode] = useState<'savings' | 'growth'>('savings')
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high'>('low')

  useEffect(() => {
    if (editPocket) {
      setName(editPocket.name)
      setTarget(editPocket.target.toString())
      setIcon(editPocket.icon)
      setMode(editPocket.mode)
      setRiskLevel(editPocket.riskLevel || 'low')
    } else if (pendingMainGoal) {
      if (pendingMainGoal === "Other") {
        setName("")
        setTarget("")
        setIcon("💰")
        setMode('savings')
        setRiskLevel('low')
      } else {
        setName(pendingMainGoal)
        setTarget("")
        
        const goalIcons: Record<string, string> = {
          "Emergency Fund": "🛡️",
          "Laptop Fund": "💻",
          "Rent Buffer": "🏠",
          "Travel": "✈️",
          "Investment Starter": "📈",
        }
        setIcon(goalIcons[pendingMainGoal] || "💰")

        const goalModes: Record<string, 'savings' | 'growth'> = {
          "Emergency Fund": "savings",
          "Laptop Fund": "growth",
          "Rent Buffer": "savings",
          "Travel": "savings",
          "Investment Starter": "growth",
        }
        setMode(goalModes[pendingMainGoal] || "savings")
        setRiskLevel("medium")
      }
    } else {
      setName("")
      setTarget("")
      setIcon("💰")
      setMode('savings')
      setRiskLevel('low')
    }
  }, [editPocket, isOpen, pendingMainGoal])

  const handleClose = () => {
    if (pendingMainGoal) {
      useStore.setState({ pendingMainGoal: null })
    }
    onClose()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !target) return

    const pocketData = {
      name,
      target: parseFloat(target),
      icon,
      mode,
      riskLevel: mode === 'growth' ? riskLevel : undefined,
    }

    if (editPocket) {
      updateSavingsPocket(editPocket.id, pocketData)
    } else {
      addSavingsPocket({
        ...pocketData,
        id: Math.random().toString(36).substr(2, 9),
        current: 0,
        isMainGoal: !!pendingMainGoal,
      } as SavingsPocket)

      if (pendingMainGoal) {
        useStore.setState({ pendingMainGoal: null })
      }
    }
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[calc(100vw-32px)] max-w-[380px] rounded-3xl glass-card border-white/10 text-foreground p-0 overflow-hidden flex flex-col gap-0 max-h-[calc(100vh-2rem)]">
        <form onSubmit={handleSubmit} className="flex flex-col min-h-0 max-h-[calc(100vh-2rem)] overflow-hidden">
          
          {/* Scrollable Content Area */}
          <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide p-5 space-y-4">
            
            {/* Header */}
            <DialogHeader className="p-0">
              <DialogTitle className="text-base font-bold flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                    <Target className="w-4 h-4 text-primary" />
                  </div>
                  <span>{editPocket ? strings.saveEditPocket : strings.saveCreatePocket}</span>
                </div>
                {pendingMainGoal && !editPocket && (
                  <Badge className="bg-pink-600/20 text-pink-500 border-pink-600/30 text-[8px] uppercase tracking-wider font-bold animate-pulse px-2 py-0.5 rounded-full shrink-0">
                    🎯 Main Goal
                  </Badge>
                )}
              </DialogTitle>
            </DialogHeader>

            {/* Icon Picker */}
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1 block">
                Choose an Icon
              </label>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
                {EMOJI_OPTIONS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setIcon(e)}
                    className={cn(
                      "w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-xl transition-all duration-200 relative border",
                      icon === e
                        ? "bg-primary border-primary shadow-lg shadow-primary/20 scale-105"
                        : "bg-white/5 border-white/5 hover:bg-white/10"
                    )}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {/* Goal Name */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1 block">
                Goal Name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dream Laptop"
                className="bg-white/5 border-white/10 h-11 rounded-2xl text-sm"
              />
            </div>

            {/* Target Amount */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1 block">
                Target Amount
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm pointer-events-none">RM</span>
                <Input
                  type="number"
                  min="0"
                  value={target}
                  onKeyDown={(e) => {
                    if (['-', 'e', '+'].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || parseFloat(val) >= 0) {
                      setTarget(val);
                    }
                  }}
                  placeholder="0.00"
                  className="bg-white/5 border-white/10 h-11 rounded-2xl pl-10 font-bold text-base"
                />
              </div>
            </div>

            {/* Management Mode */}
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1 flex items-center gap-1.5">
                <Shield className="w-3 h-3" /> {strings.saveMode}
              </label>
              <div className="bg-white/5 p-1 rounded-2xl flex gap-1 border border-white/5 relative h-11">
                <button
                  type="button"
                  onClick={() => setMode('savings')}
                  className={cn(
                    "flex-1 rounded-xl text-[11px] font-bold transition-all relative z-10 flex items-center justify-center gap-1",
                    mode === 'savings' ? "text-slate-900" : "text-muted-foreground"
                  )}
                >
                  <Shield className="w-3 h-3" />
                  <span>Safe Savings</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMode('growth')}
                  className={cn(
                    "flex-1 rounded-xl text-[11px] font-bold transition-all relative z-10 flex items-center justify-center gap-1",
                    mode === 'growth' ? "text-slate-900" : "text-muted-foreground"
                  )}
                >
                  <TrendingUp className="w-3 h-3" />
                  <span>Growth</span>
                </button>
                <motion.div
                  animate={{ x: mode === 'savings' ? '0%' : '100%' }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-primary rounded-xl shadow-lg shadow-primary/20"
                />
              </div>
            </div>

            {/* Context info / Risk Selection */}
            <AnimatePresence mode="wait">
              {mode === 'growth' ? (
                <motion.div
                  key="growth-config"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-widest text-primary flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> {strings.saveRiskLevel}
                      </span>
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[8px] px-1.5">
                        <Sparkles className="w-2 h-2 mr-1" /> +4.2% p.a.
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'low', label: 'Stable', color: 'bg-emerald-500' },
                        { id: 'medium', label: 'Balanced', color: 'bg-amber-500' },
                        { id: 'high', label: 'Growth', color: 'bg-rose-500' }
                      ].map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setRiskLevel(r.id as any)}
                          className={cn(
                            "py-2.5 rounded-xl text-[10px] font-black border transition-all flex flex-col items-center gap-1",
                            riskLevel === r.id
                              ? "bg-white text-slate-900 border-white shadow-lg"
                              : "bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10"
                          )}
                        >
                          <div className={cn("w-1.5 h-1.5 rounded-full", r.color)} />
                          {r.label}
                        </button>
                      ))}
                    </div>
                    <p className="text-[9px] text-primary/60 flex items-start gap-1.5">
                      <Info className="w-3 h-3 shrink-0 mt-px" />
                      Managed in diversified Shariah-compliant ETFs.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="savings-info"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-start gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/5"
                >
                  <Shield className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Liquid Shariah-compliant cash account with <span className="text-primary font-bold">3.00% p.a.</span> daily interest.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* Fixed Submit Button */}
          <div className="p-4 border-t border-white/5 bg-white/5 shrink-0">
            <Button
              type="submit"
              disabled={!name || !target || parseFloat(target) <= 0}
              className="w-full bg-primary hover:bg-primary/90 text-slate-900 font-black rounded-2xl h-12 text-sm shadow-lg shadow-primary/20 active:scale-95 transition-all gap-2 disabled:opacity-40"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              {editPocket ? "SAVE CHANGES" : "CREATE POCKET"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
