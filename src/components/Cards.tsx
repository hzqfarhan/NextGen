"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { CreditCard, Plus, ShieldCheck, Zap, ArrowUpRight, History, Eye, EyeOff, Copy, Check, Lock } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useStore } from "@/store/useStore"
import { cn } from "@/lib/utils"

export function Cards() {
  const { user } = useStore()
  const cardHolderName = (user?.name || "Aiman").toUpperCase()
  const cardLastFour = "1728"

  const [isDetailsVisible, setIsDetailsVisible] = useState(false)
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [password, setPassword] = useState("")
  const [error, setError] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showLimitDialog, setShowLimitDialog] = useState(false)
  const [spendingLimit, setSpendingLimit] = useState("5000")

  const handleVerify = () => {
    if (password === "1234") {
      setIsDetailsVisible(true)
      setShowAuthDialog(false)
      setPassword("")
      setError(false)
    } else {
      setError(true)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(`424288129901${cardLastFour}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const toggleDetails = () => {
    if (isDetailsVisible) {
      setIsDetailsVisible(false)
    } else {
      setShowAuthDialog(true)
    }
  }

  return (
    <div className="p-4 space-y-6 pb-24 max-w-lg mx-auto">
      {/* Header section with vivid gradient title and standout Add Button */}
      <header className="flex justify-between items-center relative overflow-hidden z-10">
        <div className="space-y-1">
          <h1 className="text-2xl font-black bg-gradient-to-r from-[#DF0059] via-[#CC0D5A] to-[#FF6B6B] bg-clip-text text-transparent">
            My Cards
          </h1>
          <p className="text-[#727272] text-xs font-semibold tracking-wide flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#DF0059] animate-pulse" />
            Manage your virtual and physical cards
          </p>
        </div>
        <button className="w-10 h-10 rounded-full bg-gradient-to-br from-[#DF0059] to-[#CC0D5A] hover:from-[#CC0D5A] hover:to-[#DF0059] flex items-center justify-center text-white shadow-lg shadow-[#DF0059]/20 hover:scale-110 active:scale-95 transition-all duration-300">
          <Plus className="w-6 h-6" />
        </button>
      </header>

      {/* Auth Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={(open) => {
        setShowAuthDialog(open)
        if (!open) {
          setPassword("")
          setError(false)
        }
      }}>
        <DialogContent className="sm:max-w-md bg-white border border-[#F5CFDE] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#221F20] font-black">
              <Lock className="w-4 h-4 text-[#DF0059]" />
              Security Verification
            </DialogTitle>
            <DialogDescription className="text-[#727272] text-xs">
              Please enter your security password to view sensitive card details.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="password"
              placeholder="Enter Password (Hint: 1234)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={error ? "border-destructive focus-visible:ring-destructive/20 rounded-2xl" : "border-[#F5CFDE] rounded-2xl focus-visible:ring-[#DF0059]/20"}
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleVerify()}
            />
            {error && <p className="text-[10px] text-rose-500 mt-2 ml-1 font-semibold">Incorrect password. Please try again.</p>}
          </div>
          <DialogFooter className="sm:justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowAuthDialog(false)} className="rounded-2xl text-[#727272]">Cancel</Button>
            <Button onClick={handleVerify} className="bg-gradient-to-r from-[#DF0059] to-[#CC0D5A] text-white rounded-2xl shadow-md shadow-[#DF0059]/20 font-bold">Verify</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Spending Limit Dialog */}
      <Dialog open={showLimitDialog} onOpenChange={setShowLimitDialog}>
        <DialogContent className="sm:max-w-md bg-white border border-[#F5CFDE] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#221F20] font-black">
              <ArrowUpRight className="w-4 h-4 text-amber-500" />
              Adjust Spending Limit
            </DialogTitle>
            <DialogDescription className="text-[#727272] text-xs">
              Set your maximum daily spending limit for this card.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-[#727272] ml-1">Daily Limit (MYR)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[#727272]">RM</span>
                <Input
                  type="number"
                  placeholder="Enter Amount"
                  value={spendingLimit}
                  onChange={(e) => setSpendingLimit(e.target.value)}
                  className="pl-10 text-lg font-mono font-bold border-[#F5CFDE] rounded-2xl focus-visible:ring-[#DF0059]/20"
                  autoFocus
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {["1000", "5000", "10000"].map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  className={`text-[10px] h-9 rounded-2xl font-bold transition-all ${spendingLimit === amount ? 'border-[#DF0059] bg-[#FFE9F2] text-[#DF0059]' : 'border-slate-200 text-[#727272] hover:bg-slate-50'}`}
                  onClick={() => setSpendingLimit(amount)}
                >
                  RM {amount}
                </Button>
              ))}
            </div>
          </div>
          <DialogFooter className="sm:justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setShowLimitDialog(false)} className="rounded-2xl text-[#727272]">Cancel</Button>
            <Button onClick={() => setShowLimitDialog(false)} className="bg-gradient-to-r from-[#DF0059] to-[#CC0D5A] text-white rounded-2xl shadow-md shadow-[#DF0059]/20 font-bold">Update Limit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main Neo-Digital Credit Card Display */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative group perspective-1000 relative z-10"
      >
        <div className="w-full h-52 rounded-[2.2rem] bg-gradient-to-br from-[#DF0059] via-[#CC0D5A] to-[#221F20] p-6 text-white shadow-2xl relative overflow-hidden transform-gpu transition-transform duration-500 hover:rotate-y-12 border border-white/10">
          {/* Card reflections and design vector lines */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#FF6B6B]/20 rounded-full -ml-10 -mb-10 blur-2xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-white/5 rounded-full pointer-events-none scale-150" />

          <div className="relative h-full flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[9px] opacity-80 uppercase tracking-widest font-black text-[#FFE9F2]">Bank Islam</p>
                <div className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300 animate-pulse" />
                  <p className="text-base font-black">Virtual Card</p>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <h1
                  className="text-2xl font-black tracking-tight"
                  style={{
                    background: "linear-gradient(135deg, #FFFFFF 0%, rgba(255,255,255,0.85) 50%, rgba(255,107,107,0.7) 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    textShadow: "none",
                    filter: "drop-shadow(0 0 20px rgba(223,0,89,0.2))"
                  }}
                >
                  NextGen
                </h1>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex gap-4">
                  {isDetailsVisible ? (
                    <>
                      <span className="text-lg font-mono font-bold tracking-normal">4242</span>
                      <span className="text-lg font-mono font-bold tracking-normal">8812</span>
                      <span className="text-lg font-mono font-bold tracking-normal">9901</span>
                      <span className="text-lg font-mono font-bold tracking-normal">{cardLastFour}</span>
                    </>
                  ) : (
                    <>
                      <span className="text-lg font-mono tracking-[0.2em] font-bold">••••</span>
                      <span className="text-lg font-mono tracking-[0.2em] font-bold">••••</span>
                      <span className="text-lg font-mono tracking-[0.2em] font-bold">••••</span>
                      <span className="text-lg font-mono font-bold">{cardLastFour}</span>
                    </>
                  )}
                </div>
                <div className="flex gap-1.5">
                  {isDetailsVisible && (
                    <button
                      onClick={handleCopy}
                      className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all active:scale-90"
                      title="Copy Card Number"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  )}
                  <button
                    onClick={toggleDetails}
                    className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all active:scale-90"
                    title={isDetailsVisible ? "Hide Details" : "Show Details"}
                  >
                    {isDetailsVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[7px] opacity-75 uppercase tracking-wider font-bold">Card Holder</p>
                  <p className="text-xs font-bold uppercase tracking-wide">{cardHolderName}</p>
                </div>
                <div className="flex gap-6">
                  <div className="text-right">
                    <p className="text-[7px] opacity-75 uppercase tracking-wider font-bold">Expires</p>
                    <p className="text-xs font-bold">09/28</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[7px] opacity-75 uppercase tracking-wider font-bold">CVV</p>
                    <p className="text-xs font-bold font-mono">{isDetailsVisible ? "123" : "•••"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Redesigned Quick Actions with Glassmorphic Light Rose and Amber highlights */}
      <div className="grid grid-cols-2 gap-4 relative z-10">
        <Card className="bg-white/80 border border-[#F5CFDE] shadow-md shadow-pink-500/5 hover:shadow-lg hover:shadow-pink-500/10 hover:border-[#DF0059]/30 transition-all duration-300 hover:-translate-y-0.5 rounded-3xl overflow-hidden cursor-pointer">
          <CardContent className="p-4 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#DF0059]/10 flex items-center justify-center text-[#DF0059] shadow-sm shadow-[#DF0059]/5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-[#221F20]">Freeze Card</p>
              <p className="text-[9.5px] text-[#727272] font-semibold mt-0.5">Instantly lock card</p>
            </div>
          </CardContent>
        </Card>
        <Card
          className="bg-white/80 border border-[#F5CFDE] shadow-md shadow-pink-500/5 hover:shadow-lg hover:shadow-pink-500/10 hover:border-[#DF0059]/30 transition-all duration-300 hover:-translate-y-0.5 rounded-3xl overflow-hidden cursor-pointer"
          onClick={() => setShowLimitDialog(true)}
        >
          <CardContent className="p-4 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 shadow-sm shadow-amber-500/5">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-[#221F20]">Card Spending Limit</p>
              <p className="text-[9.5px] text-[#727272] font-semibold mt-0.5">Daily limit: RM {spendingLimit}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Details List - Rounded Light list Card */}
      <section className="space-y-3 relative z-10">
        <h3 className="text-[10px] uppercase font-black text-[#727272] px-2 tracking-widest">Card Details</h3>
        <Card className="bg-white/80 border border-[#F5CFDE] shadow-md rounded-3xl overflow-hidden">
          <CardContent className="p-0">
            {[
              { icon: History, label: "Transaction History", value: "View All", color: "text-[#DF0059]" },
              { icon: CreditCard, label: "Card Controls", value: "Locked", color: "text-emerald-600" },
            ].map((item, i) => (
              <div 
                key={item.label} 
                className={cn(
                  "p-4 flex items-center justify-between transition-all duration-300 hover:bg-[#FFE9F2]/20 cursor-pointer",
                  i === 0 ? 'border-b border-slate-100' : ''
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                  <span className="text-xs font-extrabold text-[#221F20]">{item.label}</span>
                </div>
                <span className="text-[10px] font-black text-[#727272]">{item.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
