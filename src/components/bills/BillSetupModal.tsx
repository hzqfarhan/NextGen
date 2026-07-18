"use client"

import { useStore, Bill, BillFrequency, AutoPaySafety, BillCategory } from "@/store/useStore"
import { t } from "@/lib/translations"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BILL_TEMPLATES, BillTemplate } from "@/lib/billTemplates"
import { ChevronLeft } from "lucide-react"

interface BillSetupModalProps {
  isOpen: boolean
  onClose: () => void
  editingBill?: Bill | null
  onSelectPrepaidTopUp?: () => void
  onSelectPostpaid?: () => void
}

export function BillSetupModal({ isOpen, onClose, editingBill, onSelectPrepaidTopUp, onSelectPostpaid }: BillSetupModalProps) {
  const { language, addBill, updateBill } = useStore()
  const strings = t[language]

  const [selectedTemplate, setSelectedTemplate] = useState<BillTemplate | null>(null)
  const [formData, setFormData] = useState<Partial<Bill>>({})

  // Confirmation dialog states
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)

  // Initialize form
  useEffect(() => {
    setShowCancelConfirm(false)
    setShowSubmitConfirm(false)
    if (editingBill) {
      setFormData(editingBill)
      const template = BILL_TEMPLATES.find(t => t.category === editingBill.category)
      setSelectedTemplate(template || BILL_TEMPLATES.find(t => t.category === 'custom')!)
    } else {
      setFormData({
        isLocked: true,
        autopayEnabled: false,
        reminderDaysBefore: 3,
        frequency: "monthly",
        status: "upcoming",
        source: "manual"
      })
      setSelectedTemplate(null)
    }
  }, [editingBill, isOpen])

  const handleSelectTemplate = (template: BillTemplate) => {
    if (template.category === 'prepaid_topup') {
      if (onSelectPrepaidTopUp) onSelectPrepaidTopUp();
      return;
    }
    if (template.category === 'phone') {
      if (onSelectPostpaid) onSelectPostpaid();
      return;
    }
    setSelectedTemplate(template)
    setFormData(prev => ({
      ...prev,
      category: template.category,
      name: template.category === 'custom' ? "" : template.title,
      mode: template.defaultMode,
      paymentRail: template.defaultRail,
      autopayEnabled: false, // Default AutoPay OFF as per spec
      isLocked: true, // Default Smart Bill Lock ON
    }))
  }

  const handleAttemptCloseAction = () => {
    // If the user has made edits or selected a template, show confirmation
    const isModified = selectedTemplate || editingBill;
    if (isModified) {
      setShowCancelConfirm(true);
    } else {
      onClose();
    }
  };

  const handleAttemptClose = (open: boolean) => {
    if (!open) {
      handleAttemptCloseAction();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.amount) return
    setShowSubmitConfirm(true)
  }

  const executeSubmit = () => {
    setShowSubmitConfirm(false)
    
    // Calculate due dates based on dueDay
    const dueDayNum = Number(formData.dueDay) || 1
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    
    let nextDue = new Date(year, month, dueDayNum)
    // If the due day has already passed this month, move to next month
    if (nextDue.getTime() < now.getTime()) {
      nextDue = new Date(year, month + 1, dueDayNum)
    }
    const nextDueDateStr = nextDue.toISOString()

    const preparedData = {
      ...formData,
      dueDay: dueDayNum,
      dueDate: nextDueDateStr,
      nextDueDate: nextDueDateStr,
    }

    if (editingBill) {
      updateBill(editingBill.id, { ...preparedData, updatedAt: new Date().toISOString() })
    } else {
      const newBill: Bill = {
        id: Math.random().toString(36).substring(7),
        createdAt: new Date().toISOString(),
        ...preparedData,
      } as Bill
      addBill(newBill)
    }
    onClose()
  }

  const isSimulatedAutoPay = formData.mode === 'simulated_autopay'
  const isAutoTrack = formData.mode === 'auto_track'
  const isBudgetLock = formData.mode === 'budget_lock'

  return (
    <Dialog open={isOpen} onOpenChange={handleAttemptClose}>
      <DialogContent className="sm:max-w-[450px] rounded-[2rem] p-0 overflow-hidden border border-slate-200/60 glass-card shadow-2xl text-slate-900 relative">
        
        {/* Cancel Confirmation Popup */}
        <AnimatePresence>
          {showCancelConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6"
            >
              <motion.div
                initial={{ scale: 0.95, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 10 }}
                className="bg-white border border-slate-100 shadow-2xl rounded-3xl p-6 text-center space-y-4 w-full max-w-xs"
              >
                <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto text-xl">
                  ⚠️
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm text-slate-900">Discard Changes?</h4>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                    Adakah anda pasti mahu batal? Semua perubahan yang belum disimpan akan hilang.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCancelConfirm(false)}
                    className="h-10 rounded-xl text-xs font-bold border-slate-200 text-slate-900 hover:bg-slate-50"
                  >
                    No, keep
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setShowCancelConfirm(false);
                      onClose();
                    }}
                    className="h-10 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-sm"
                  >
                    Yes, discard
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {showSubmitConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6"
            >
              <motion.div
                initial={{ scale: 0.95, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 10 }}
                className="bg-white border border-slate-100 shadow-2xl rounded-3xl p-6 text-center space-y-4 w-full max-w-xs"
              >
                <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto text-xl">
                  ✅
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm text-slate-900">Confirm and Save?</h4>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                    Adakah anda pasti untuk simpan bil ini? / Are you sure you want to save this bill?
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowSubmitConfirm(false)}
                    className="h-10 rounded-xl text-xs font-bold border-slate-200 text-slate-900 hover:bg-slate-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={executeSubmit}
                    className="h-10 rounded-xl text-xs font-bold bg-primary hover:bg-primary/95 text-white shadow-sm"
                  >
                    Confirm
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {!selectedTemplate && !editingBill ? (
            <motion.div
              key="picker"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6 space-y-6"
            >
              <DialogHeader>
                <DialogTitle className="text-xl font-black text-slate-900">{strings.billsAdd}</DialogTitle>
                <DialogDescription className="text-xs font-medium text-slate-500">Choose a template to get started</DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto pr-1">
                {BILL_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.category}
                    onClick={() => handleSelectTemplate(tpl)}
                    className="flex items-center gap-2 p-2 rounded-2xl bg-slate-50 border border-slate-200/60 hover:bg-slate-100 hover:border-slate-300 transition-all group w-full shadow-sm"
                  >
                    <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-lg group-hover:scale-110 transition-transform flex-shrink-0 shadow-sm border border-slate-100">
                      {tpl.icon}
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="text-[10px] font-black text-slate-800 leading-tight truncate">{tpl.title}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <form onSubmit={handleSubmit}>
                <div className="p-6 space-y-6">
                  <DialogHeader className="flex flex-row items-center gap-4 space-y-0">
                    {!editingBill && (
                      <button 
                        type="button"
                        onClick={() => setSelectedTemplate(null)}
                        className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                    )}
                    <div>
                      <DialogTitle className="text-xl font-black text-slate-900">
                        {editingBill ? strings.billsEdit : `Setup ${selectedTemplate?.title}`}
                      </DialogTitle>
                      <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        {selectedTemplate?.description}
                      </DialogDescription>
                    </div>
                  </DialogHeader>

                  <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {/* Setup Fields */}
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-primary/70">Bill Setup</Label>
                      <div className="grid grid-cols-1 gap-4">
                        {selectedTemplate?.setupFields.map(field => (
                          <div key={field.name} className="space-y-1.5">
                            <Label className="text-[10px] font-bold text-slate-500 ml-1">{field.label}</Label>
                            {field.type === 'select' ? (
                              <Select 
                                value={(formData[field.name as keyof Bill] as string) ?? ""} 
                                onValueChange={val => setFormData(p => ({ ...p, [field.name]: val }))}
                              >
                                <SelectTrigger className="rounded-2xl border-slate-200 bg-slate-50 text-slate-900 h-11 focus:ring-primary/50">
                                  <SelectValue placeholder={`Select ${field.label}`} />
                                </SelectTrigger>
                                <SelectContent className="bg-white border-slate-200 text-slate-900 rounded-2xl shadow-lg">
                                  {field.options?.map(opt => (
                                    <SelectItem key={opt} value={opt} className="focus:bg-slate-50 cursor-pointer">{opt}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Input 
                                type={field.type}
                                value={formData[field.name as keyof Bill] as string || ""}
                                onChange={e => setFormData(p => ({ ...p, [field.name]: field.type === 'number' ? Number(e.target.value) : e.target.value }))}
                                placeholder={field.placeholder}
                                className="rounded-2xl border-slate-200 bg-slate-50 text-slate-900 h-11 placeholder:text-slate-400 focus:border-primary/50"
                                required={field.required}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Payment / AutoPay Fields */}
                    {!isBudgetLock && selectedTemplate && (selectedTemplate.paymentFields.length > 0 || selectedTemplate.category === 'phone') && (
                      <div className="space-y-4 pt-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-emerald-500/70">
                            {isSimulatedAutoPay ? 'AutoPay Details' : 'Auto-track Details'}
                          </Label>
                          {isSimulatedAutoPay && (
                            <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                              <span className="text-[8px] font-black text-emerald-500 uppercase tracking-tighter">Simulated</span>
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-1 gap-4 p-4 rounded-[2rem] bg-slate-50 border border-slate-200/60 shadow-inner">
                          {selectedTemplate.paymentFields.map(field => (
                            <div key={field.name} className="space-y-1.5">
                                <Label className="text-[10px] font-bold text-slate-500 ml-1">{field.label}</Label>
                                {field.type === 'select' ? (
                                  <Select 
                                    value={(formData[field.name as keyof Bill] as string) ?? ""} 
                                    onValueChange={val => setFormData(p => ({ ...p, [field.name]: val }))}
                                  >
                                    <SelectTrigger className="rounded-xl border-slate-200 bg-white text-slate-900 h-10 text-xs">
                                      <SelectValue placeholder={`Select ${field.label}`} />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-slate-200 text-slate-900 rounded-xl shadow-lg">
                                      {field.options?.map(opt => (
                                        <SelectItem key={opt} value={opt} className="focus:bg-slate-50 cursor-pointer">{opt}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <Input 
                                    type={field.type}
                                    value={formData[field.name as keyof Bill] as string || ""}
                                    onChange={e => setFormData(p => ({ ...p, [field.name]: e.target.value }))}
                                    placeholder={field.placeholder}
                                    className="rounded-xl border-slate-200 bg-white text-slate-900 h-10 text-xs placeholder:text-slate-400 focus:border-emerald-500/50 focus:ring-emerald-500/30"
                                    required={field.required && formData.autopayEnabled}
                                  />
                                )}
                              </div>
                            ))
                          }
                        </div>
                      </div>
                    )}

                    {/* Safety & Controls */}
                    <div className="space-y-4 pt-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Safety & Rules</Label>
                      <div className="space-y-3 p-4 rounded-[2rem] bg-slate-50 border border-slate-200/60 shadow-inner">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="text-xs font-bold text-slate-800">Smart Bill Lock</Label>
                            <p className="text-[9px] text-slate-500">Protect money for this bill first</p>
                          </div>
                          <Switch 
                            checked={formData.isLocked} 
                            onCheckedChange={val => setFormData(p => ({ ...p, isLocked: val }))}
                          />
                        </div>

                        {isSimulatedAutoPay && (
                          <div className="flex items-center justify-between border-t border-slate-200/60 pt-3">
                            <div className="space-y-0.5">
                              <Label className="text-xs font-bold text-slate-800">Enable AutoPay</Label>
                              <p className="text-[9px] text-slate-500">Pay automatically when safe</p>
                            </div>
                            <Switch 
                              checked={formData.autopayEnabled} 
                              onCheckedChange={val => setFormData(p => ({ ...p, autopayEnabled: val }))}
                            />
                          </div>
                        )}

                        {isAutoTrack && (
                          <div className="flex items-center justify-between border-t border-slate-200/60 pt-3">
                            <div className="space-y-0.5">
                              <Label className="text-xs font-bold text-slate-800">Auto-track</Label>
                              <p className="text-[9px] text-slate-500">Detect payment from bank history</p>
                            </div>
                            <Switch 
                              checked={formData.autoTrackEnabled} 
                              onCheckedChange={val => setFormData(p => ({ ...p, autoTrackEnabled: val }))}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <DialogFooter className="p-6 bg-slate-50 border-t border-slate-200/60">
                  <Button type="button" variant="ghost" onClick={handleAttemptCloseAction} className="rounded-2xl font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100">
                    {strings.billsCancel}
                  </Button>
                  <Button type="submit" className="rounded-2xl bg-primary hover:bg-primary/95 text-white font-black px-10 shadow-lg shadow-primary/20">
                    {editingBill ? strings.billsSave : 'Confirm Bill'}
                  </Button>
                </DialogFooter>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
