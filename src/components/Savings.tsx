"use client"

import { useState, useEffect } from "react"
import { useStore, SavingsPocket } from "@/store/useStore"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Target, TrendingUp, Plus, ArrowUpRight, Pencil, Trash2 } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { t } from "@/lib/translations"
import { SavingsModal } from "./SavingsModal"
import { DepositModal } from "./DepositModal"
import { DeleteConfirmModal } from "./DeleteConfirmModal"
import { AutoSaveModal } from "./AutoSaveModal"

export function Savings() {
  const { savingsPockets, language, isAutoSaveActive, toggleAutoSave, autoSaveTargetIds, autoSaveFrequency, autoSaveAmount, pendingMainGoal } = useStore()
  const strings = t[language]

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDepositOpen, setIsDepositOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isAutoSaveModalOpen, setIsAutoSaveModalOpen] = useState(false)
  const [selectedPocket, setSelectedPocket] = useState<SavingsPocket | null>(null)
  const [editPocket, setEditPocket] = useState<SavingsPocket | null>(null)
  
  // Hydration guard for Next.js persisted state
  const [hasHydrated, setHasHydrated] = useState(false)
  useEffect(() => {
    setHasHydrated(true)
  }, [])

  // Auto-trigger modal on mount if onboarding goal is pending
  useEffect(() => {
    if (hasHydrated && pendingMainGoal) {
      setEditPocket(null)
      setIsModalOpen(true)
    }
  }, [pendingMainGoal, hasHydrated])

  const handleOpenDeposit = (pocket: SavingsPocket) => {
    setSelectedPocket(pocket)
    setIsDepositOpen(true)
  }

  const handleEditPocket = (pocket: SavingsPocket) => {
    setEditPocket(pocket)
    setIsModalOpen(true)
  }

  const handleDeleteClick = (pocket: SavingsPocket) => {
    setSelectedPocket(pocket)
    setIsDeleteOpen(true)
  }

  const handleAddPocket = () => {
    setEditPocket(null)
    setIsModalOpen(true)
  }

  const handleToggleAutoSave = () => {
    if (isAutoSaveActive) {
      toggleAutoSave()
    } else {
      setIsAutoSaveModalOpen(true)
    }
  }

  if (!hasHydrated) return null;

  // Sort pockets: primary goals always on top
  const sortedPockets = [...savingsPockets].sort((a, b) => {
    const aMain = a.isMainGoal ? 1 : 0;
    const bMain = b.isMainGoal ? 1 : 0;
    return bMain - aMain;
  })

  return (
    <div className="p-4 space-y-6 pb-24 max-w-lg mx-auto">
      <header className="flex justify-between items-end">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary text-glow" />
            <h1 className="text-2xl font-bold">{strings.saveHeader}</h1>
          </div>
          <p className="text-muted-foreground text-sm">{strings.saveSubheader}</p>
        </div>
        <button 
          onClick={handleAddPocket}
          className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-slate-900 shadow-lg shadow-primary/20 hover:scale-110 active:scale-95 transition-all"
        >
          <Plus className="w-6 h-6" />
        </button>
      </header>

      {/* Auto-Save Card */}
      <div className="space-y-3">
        <Card className={cn(
          "glass-card border-primary/20 transition-all duration-300",
          isAutoSaveActive ? "bg-primary/5 shadow-lg shadow-primary/5" : "bg-slate-500/5 opacity-80"
        )}>
          <CardContent className="p-4 flex justify-between items-center">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <TrendingUp className={cn("w-4 h-4", isAutoSaveActive ? "text-primary" : "text-muted-foreground")} />
                <p className={cn("text-sm font-bold", isAutoSaveActive ? "text-primary" : "text-muted-foreground")}>{strings.saveSmartAuto}</p>
                {!isAutoSaveActive && <Badge variant="outline" className="text-[8px] h-3.5 border-slate-500/30 text-slate-500">PAUSED</Badge>}
              </div>
              <p className="text-[10px] text-muted-foreground">
                {isAutoSaveActive 
                  ? `Moving RM ${autoSaveAmount.toFixed(2)} ${autoSaveFrequency} to ${autoSaveTargetIds.length === savingsPockets.length ? "All Pockets" : `${autoSaveTargetIds.length} Pockets`}`
                  : "Automatically grow your savings while you sleep."
                }
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isAutoSaveActive && (
                <button 
                  onClick={() => setIsAutoSaveModalOpen(true)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground transition-colors"
                >
                  <Pencil className="w-3 h-3" />
                </button>
              )}
              <Button 
                size="sm" 
                onClick={handleToggleAutoSave}
                className={cn(
                  "text-[10px] h-7 font-bold transition-all px-4 rounded-lg",
                  isAutoSaveActive 
                    ? "bg-primary/10 text-primary border border-primary/20 hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/20" 
                    : "bg-primary text-slate-900 shadow-lg shadow-primary/20"
                )}
              >
                {isAutoSaveActive ? "Stop" : "Activate"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Savings Hub */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold px-1">{strings.saveActiveGoals}</h3>
        {sortedPockets.map((pocket, i) => {
          const isTargeted = autoSaveTargetIds.includes(pocket.id);
          const isActive = isAutoSaveActive && isTargeted;
          const isGrowth = pocket.mode === 'growth';
          const isMain = pocket.isMainGoal;

          const pocketNameMap: Record<string, string> = {
            '1': strings.savePocketEmerg,
            '2': strings.savePocketLaptop,
            '3': strings.savePocketRent,
          };
          const displayName = pocketNameMap[pocket.id] || pocket.name;

          return (
          <motion.div
            key={pocket.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn(isMain && "sticky top-2 z-20")}
          >
            <Card className={cn(
              "glass-card overflow-hidden group transition-all duration-300",
              isActive && "ring-1 ring-primary/30 bg-primary/5 shadow-lg shadow-primary/5",
              isGrowth && "border-primary/20 shadow-primary/5",
              isMain && "border-pink-600/40 bg-pink-50/5 dark:bg-slate-900/90 shadow-xl shadow-pink-600/10 scale-[1.02] backdrop-blur-md bg-opacity-95 dark:bg-opacity-95"
            )}>
              <CardContent className="p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner transition-all duration-500",
                        isMain ? "bg-pink-600/25 scale-110 shadow-pink-600/20 text-3xl" : isGrowth ? "bg-primary/20 scale-105 rotate-3 shadow-primary/20" : "bg-secondary"
                      )}>
                        {pocket.icon}
                      </div>
                      {isActive && (
                        <motion.div 
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-background flex items-center justify-center"
                        >
                          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        </motion.div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={cn("text-sm font-bold", isMain && "text-pink-700 dark:text-pink-300 text-base")}>{displayName}</p>
                        {isMain && (
                          <Badge className="text-[8px] h-3.5 bg-pink-600/25 text-pink-700 dark:text-pink-300 border-pink-600/35 px-1.5 font-black uppercase tracking-wider animate-pulse shrink-0">
                            🎯 Primary
                          </Badge>
                        )}
                        {isGrowth && (
                          <Badge className="text-[8px] h-3.5 bg-primary/20 text-primary border-primary/20 px-1 font-black shrink-0">
                            {strings.saveInvestedBadge}
                          </Badge>
                        )}
                        {isActive && (
                          <span className="text-[8px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0">
                            ✨ Funding
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] text-muted-foreground">RM {pocket.current.toFixed(2)} / RM {pocket.target}</p>
                        {isGrowth && (
                          <span className="text-[8px] text-emerald-500 font-bold">+4.2% p.a.</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleEditPocket(pocket)}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(pocket)}
                      className="p-1.5 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px]">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Progress</span>
                      {isGrowth && (
                        <span className="text-[9px] text-primary/80 font-bold capitalize">({pocket.riskLevel} Risk)</span>
                      )}
                    </div>
                    <span className={cn("font-bold text-primary", isMain && "text-pink-700 dark:text-pink-300")}>{Math.round((pocket.current / pocket.target) * 100)}%</span>
                  </div>
                  <Progress 
                    value={(pocket.current / pocket.target) * 100} 
                    className={cn("h-2", isGrowth && "bg-primary/10", isMain && "[&_[data-slot=progress-indicator]]:bg-pink-600 [&_[data-slot=progress-track]]:bg-pink-600/15")} 
                  />
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    {isGrowth && (
                      <div className="flex items-center gap-1 text-[9px] text-emerald-500 font-bold bg-emerald-500/5 px-2 py-0.5 rounded-full border border-emerald-500/10">
                        <TrendingUp className="w-2.5 h-2.5" /> Growth Enabled
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => handleOpenDeposit(pocket)}
                    className={cn("text-[10px] text-primary font-bold flex items-center gap-1 hover:gap-2 transition-all", isMain && "text-pink-700 dark:text-pink-300")}
                  >
                    {strings.saveAddFunds} <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          )
        })}
      </div>

      <SavingsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        editPocket={editPocket}
      />

      <DepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        pocket={selectedPocket}
      />

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        pocket={selectedPocket}
      />

      <AutoSaveModal
        isOpen={isAutoSaveModalOpen}
        onClose={() => setIsAutoSaveModalOpen(false)}
      />
    </div>
  )
}
