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
}

export function BillSetupModal({ isOpen, onClose, editingBill }: BillSetupModalProps) {
  const { language, addBill, updateBill } = useStore()
  const strings = t[language]

  const [selectedTemplate, setSelectedTemplate] = useState<BillTemplate | null>(null)
  const [formData, setFormData] = useState<Partial<Bill>>({})

  // Initialize form
  useEffect(() => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.amount) return

    if (editingBill) {
      updateBill(editingBill.id, { ...formData, updatedAt: new Date().toISOString() })
    } else {
      const newBill: Bill = {
        id: Math.random().toString(36).substring(7),
        createdAt: new Date().toISOString(),
        ...formData,
      } as Bill
      addBill(newBill)
    }
    onClose()
  }

  const isSimulatedAutoPay = formData.mode === 'simulated_autopay'
  const isAutoTrack = formData.mode === 'auto_track'
  const isBudgetLock = formData.mode === 'budget_lock'

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] rounded-[2rem] p-0 overflow-hidden border border-white/10 glass-card shadow-2xl text-white">
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
                <DialogTitle className="text-xl font-black text-white">{strings.billsAdd}</DialogTitle>
                <DialogDescription className="text-xs font-medium text-white/50">Choose a template to get started</DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto pr-1">
                {BILL_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.category}
                    onClick={() => handleSelectTemplate(tpl)}
                    className="flex items-center gap-2 p-2 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group w-full"
                  >
                    <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-lg group-hover:scale-110 transition-transform flex-shrink-0">
                      {tpl.icon}
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="text-[10px] font-black text-white leading-tight truncate">{tpl.title}</p>
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
                        className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                    )}
                    <div>
                      <DialogTitle className="text-xl font-black text-white">
                        {editingBill ? strings.billsEdit : `Setup ${selectedTemplate?.title}`}
                      </DialogTitle>
                      <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-white/40">
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
                            <Label className="text-[10px] font-bold text-white/50 ml-1">{field.label}</Label>
                            {field.type === 'select' ? (
                              <Select 
                                value={(formData[field.name as keyof Bill] as string) ?? ""} 
                                onValueChange={val => setFormData(p => ({ ...p, [field.name]: val }))}
                              >
                                <SelectTrigger className="rounded-2xl border-white/10 bg-white/5 text-white h-11 focus:ring-primary/50">
                                  <SelectValue placeholder={`Select ${field.label}`} />
                                </SelectTrigger>
                                <SelectContent>
                                  {field.options?.map(opt => (
                                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Input 
                                type={field.type}
                                value={formData[field.name as keyof Bill] as string || ""}
                                onChange={e => setFormData(p => ({ ...p, [field.name]: field.type === 'number' ? Number(e.target.value) : e.target.value }))}
                                placeholder={field.placeholder}
                                className="rounded-2xl border-white/10 bg-white/5 text-white h-11 placeholder:text-white/20 focus:border-primary/50"
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
                        <div className="grid grid-cols-1 gap-4 p-4 rounded-[2rem] bg-white/5 border border-white/10">
                          {selectedTemplate.category === 'phone' ? (
                            <>
                              <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold text-white/40 ml-1">Mobile Number</Label>
                                <Input 
                                  value={formData.referenceNumber || ""}
                                  onChange={e => setFormData(p => ({ ...p, referenceNumber: e.target.value }))}
                                  placeholder="01x-xxx xxxx"
                                  className="rounded-xl border-white/10 bg-white/5 text-white h-10 text-xs placeholder:text-white/20"
                                  required={formData.autopayEnabled}
                                />
                              </div>
                              {formData.productType === 'Postpaid' && (
                                <>
                                  <div className="space-y-1.5">
                                    <Label className="text-[10px] font-bold text-white/40 ml-1">JomPAY Biller Code</Label>
                                    <Input 
                                      value={formData.billerCode || ""}
                                      onChange={e => setFormData(p => ({ ...p, billerCode: e.target.value }))}
                                      placeholder="e.g. 1234"
                                      className="rounded-xl border-white/10 bg-white/5 text-white h-10 text-xs placeholder:text-white/20"
                                      required={formData.autopayEnabled}
                                    />
                                  </div>
                                  <div className="space-y-1.5">
                                    <Label className="text-[10px] font-bold text-white/40 ml-1">Account Number</Label>
                                    <Input 
                                      value={formData.accountNumber || ""}
                                      onChange={e => setFormData(p => ({ ...p, accountNumber: e.target.value }))}
                                      placeholder="•••• ••••"
                                      className="rounded-xl border-white/10 bg-white/5 text-white h-10 text-xs placeholder:text-white/20"
                                      required={formData.autopayEnabled}
                                    />
                                  </div>
                                </>
                              )}
                            </>
                          ) : (
                            selectedTemplate.paymentFields.map(field => (
                              <div key={field.name} className="space-y-1.5">
                                <Label className="text-[10px] font-bold text-white/40 ml-1">{field.label}</Label>
                                {field.type === 'select' ? (
                                  <Select 
                                    value={(formData[field.name as keyof Bill] as string) ?? ""} 
                                    onValueChange={val => setFormData(p => ({ ...p, [field.name]: val }))}
                                  >
                                    <SelectTrigger className="rounded-xl border-white/10 bg-white/5 text-white h-10 text-xs">
                                      <SelectValue placeholder={`Select ${field.label}`} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {field.options?.map(opt => (
                                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <Input 
                                    type={field.type}
                                    value={formData[field.name as keyof Bill] as string || ""}
                                    onChange={e => setFormData(p => ({ ...p, [field.name]: e.target.value }))}
                                    placeholder={field.placeholder}
                                    className="rounded-xl border-white/10 bg-white/5 text-white h-10 text-xs placeholder:text-white/20 focus:border-emerald-500/50"
                                    required={field.required && formData.autopayEnabled}
                                  />
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}

                    {/* Safety & Controls */}
                    <div className="space-y-4 pt-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-white/30">Safety & Rules</Label>
                      <div className="space-y-3 p-4 rounded-[2rem] bg-white/5 border border-white/10">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="text-xs font-bold text-white">Smart Bill Lock</Label>
                            <p className="text-[9px] text-white/40">Protect money for this bill first</p>
                          </div>
                          <Switch 
                            checked={formData.isLocked} 
                            onCheckedChange={val => setFormData(p => ({ ...p, isLocked: val }))}
                          />
                        </div>

                        {isSimulatedAutoPay && (
                          <div className="flex items-center justify-between border-t border-white/5 pt-3">
                            <div className="space-y-0.5">
                              <Label className="text-xs font-bold text-white">Enable AutoPay</Label>
                              <p className="text-[9px] text-white/40">Pay automatically when safe</p>
                            </div>
                            <Switch 
                              checked={formData.autopayEnabled} 
                              onCheckedChange={val => setFormData(p => ({ ...p, autopayEnabled: val }))}
                            />
                          </div>
                        )}

                        {isAutoTrack && (
                          <div className="flex items-center justify-between border-t border-white/5 pt-3">
                            <div className="space-y-0.5">
                              <Label className="text-xs font-bold text-white">Auto-track</Label>
                              <p className="text-[9px] text-white/40">Detect payment from bank history</p>
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

                <DialogFooter className="p-6 bg-white/5 border-t border-white/10">
                  <Button type="button" variant="ghost" onClick={onClose} className="rounded-2xl font-bold text-white/50 hover:text-white hover:bg-white/5">
                    {strings.billsCancel}
                  </Button>
                  <Button type="submit" className="rounded-2xl bg-primary hover:bg-primary/80 text-white font-black px-10 shadow-lg shadow-primary/20">
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
