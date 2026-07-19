"use client"

import { useStore } from "@/store/useStore"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { QrCode, ScanLine, X, AlertTriangle, ArrowRight, Zap, AlertCircle, ChevronDown, Coffee, ShoppingBag, Gamepad2, SwitchCamera, ImageIcon } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import dynamic from "next/dynamic"

const QrScanner = dynamic(
  () => import('@yudiel/react-qr-scanner').then((mod) => mod.Scanner),
  { ssr: false }
)
import { TopUpModal } from "./TopUpModal"
import { cn } from "@/lib/utils"
import { Pet } from "@/components/ui/Pet"

export function Scanner() {
  const router = useRouter()
  const { user, addTransaction, safeDailySpend, initialSafeDaily, transactions, selectedCompanion } = useStore()
  
  const [scannedItem, setScannedItem] = useState<{ merchant: string, amount: number, category: string } | null>(null)
  const [isIntercepted, setIsIntercepted] = useState(false)
  const [isWarning, setIsWarning] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isFailed, setIsFailed] = useState(false)
  const [showTopUpModal, setShowTopUpModal] = useState(false)
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment")
  const [afterMessage, setAfterMessage] = useState<{ type: 'success' | 'warning', text: string } | null>(null)

  const handleCancelIntercept = () => {
    setIsIntercepted(false)
    setAfterMessage({ 
      type: 'success', 
      text: 'Good job! PTPTN selamat. Future you is smiling and proud of you.' 
    })
    setTimeout(() => {
      setAfterMessage(prev => {
        if (prev?.type === 'success') {
          setScannedItem(null)
          return null
        }
        return prev
      })
    }, 2500)
  }

  const handleProceedIntercept = () => {
    setIsIntercepted(false)
    setAfterMessage({ 
      type: 'warning', 
      text: 'Sigh... don\'t say NextGen didn\'t warn you! Tengok wallet tu menangis.' 
    })
    setTimeout(() => {
      setAfterMessage(prev => {
        if (prev?.type === 'warning') {
          setIsWarning(true)
          return null
        }
        return prev
      })
    }, 2500)
  }

  const handleSwapCamera = () => {
    setFacingMode(prev => prev === "environment" ? "user" : "environment")
  }

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setScannedItem({
        merchant: "Starbucks Coffee",
        amount: 18.50,
        category: "Food"
      })
      setIsIntercepted(true)
    }
  }

  // Calculate remaining daily spending quota
  const todayStr = new Date().toDateString()
  const todayExpenses = transactions
    .filter(t => t.type === 'expense' && new Date(t.date).toDateString() === todayStr)
    .reduce((sum, t) => sum + t.amount, 0)
  
  const originalQuota = initialSafeDaily || 15.0
  const currentQuotaRemaining = originalQuota - todayExpenses

  const scanAmount = scannedItem ? scannedItem.amount : 0
  const quotaAfterPurchase = currentQuotaRemaining - scanAmount

  // Spend Guardian Alert Style Level:
  // 1. Green - when remaining spending quota is more than 50% than original quota
  // 2. Yellow - when it below 50% or the payment causing the remaining quota below 50%
  // 3. Red - exceed the quota
  const alertColor = quotaAfterPurchase < 0 
    ? "red" 
    : quotaAfterPurchase < (0.5 * originalQuota) 
      ? "yellow" 
      : "green"

  const alertStyles = {
    green: {
      bg: "bg-emerald-500/10",
      border: "border-b border-emerald-500/20",
      text: "text-emerald-600",
      darkText: "text-emerald-800/80",
      iconBg: "bg-emerald-500/20"
    },
    yellow: {
      bg: "bg-amber-500/10",
      border: "border-b border-amber-500/20",
      text: "text-amber-600",
      darkText: "text-amber-800/80",
      iconBg: "bg-amber-500/20"
    },
    red: {
      bg: "bg-rose-500/10",
      border: "border-b border-rose-500/20",
      text: "text-rose-600",
      darkText: "text-rose-800/80",
      iconBg: "bg-rose-500/20"
    }
  }[alertColor]

  // Custom Simulator States
  const [customMerchant, setCustomMerchant] = useState("")
  const [customAmount, setCustomAmount] = useState("")
  const [customCategory, setCustomCategory] = useState("Shopping")

  const handleCustomScan = () => {
    const amt = parseFloat(customAmount)
    if (isNaN(amt) || amt <= 0) return

    setScannedItem({
      merchant: customMerchant.trim() || "Local Shop",
      amount: amt,
      category: customCategory
    })
    setIsIntercepted(true)
  }

  const handleConfirmPay = () => {
    setIsProcessing(true)
    setTimeout(() => {
      if (scannedItem!.amount > user.currentBalance) {
        setIsProcessing(false)
        setIsFailed(true)
      } else {
        addTransaction({
          id: Date.now().toString(),
          title: scannedItem!.merchant,
          amount: scannedItem!.amount,
          date: new Date().toISOString(),
          category: scannedItem!.category,
          type: 'expense',
          confidence: 0.95
        })
        router.push("/dashboard")
      }
    }, 1500)
  }

  return (
    <div className="h-[calc(100vh-64px)] bg-slate-50 relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 z-0 bg-slate-900">
        <QrScanner
          onScan={(result) => {
            if (result && result.length > 0) {
              setScannedItem({
                merchant: "Starbucks Coffee",
                amount: 18.50,
                category: "Food"
              })
              setIsIntercepted(true)
            }
          }}
          onError={(error) => console.log(error?.message)}
          formats={['qr_code']}
          constraints={{ facingMode }}
          components={{ finder: false }}
        />
        
        {/* Cutout Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 overflow-hidden">
          {/* Box Shadow Trick for cutout overlay */}
          <div className="w-64 h-64 rounded-xl border-2 border-primary/80 relative shadow-[0_0_0_4000px_rgba(0,0,0,0.6)]">
            
            {/* Corner highlights */}
            <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-xl"></div>
            <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-xl"></div>
            <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-xl"></div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-xl"></div>
            
            {/* Laser */}
            <motion.div 
              animate={{ y: [0, 240, 0] }} 
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="absolute top-0 left-0 right-0 h-[2px] bg-primary shadow-[0_0_15px_#A855F7]"
            />
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="z-10 p-4 flex justify-between items-center bg-gradient-to-b from-white/90 to-transparent pb-8">
        <h1 className="text-slate-900 font-bold">Scan DuitNow QR</h1>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => document.getElementById('gallery-upload')?.click()} className="text-slate-900 hover:bg-slate-200/50 rounded-full">
            <ImageIcon className="w-5 h-5" />
          </Button>
          <input id="gallery-upload" type="file" accept="image/*" className="hidden" onChange={handleGalleryUpload} />
          
          <Button variant="ghost" size="icon" onClick={handleSwapCamera} className="text-slate-900 hover:bg-slate-200/50 rounded-full">
            <SwitchCamera className="w-5 h-5" />
          </Button>

          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="text-slate-900 hover:bg-slate-200/50 rounded-full">
              <X className="w-6 h-6" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 z-10 flex flex-col justify-end p-4 pb-12">
        
        <AnimatePresence>

          {scannedItem && isIntercepted && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
            >
              <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-3xl p-6 shadow-2xl text-white w-full max-w-sm space-y-6 relative overflow-hidden border border-rose-400/30">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/20 rounded-full blur-3xl"></div>
                
                <div className="flex flex-col items-center text-center space-y-3 z-10 relative pt-2">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-2 shadow-inner">
                    <Zap className="w-10 h-10 text-white animate-bounce" />
                  </div>
                  <h2 className="text-3xl font-black uppercase tracking-tight">HOLD UP, BOSSKU! 🛑</h2>
                  <p className="text-lg font-bold text-rose-50 leading-snug">
                    {scannedItem.merchant === "Starbucks Coffee" 
                      ? `Starbucks lagi?! RM${scannedItem.amount.toFixed(2)} terbang camtu je?` 
                      : `RM${scannedItem.amount.toFixed(2)} untuk ${scannedItem.merchant}? Biar betul?`}
                  </p>
                  <div className="bg-black/10 rounded-xl p-3 w-full backdrop-blur-sm border border-black/5 mt-2">
                    <p className="text-sm font-semibold text-rose-100">
                      {scannedItem.merchant === "Starbucks Coffee"
                        ? "Air Coway kat kolej kediaman kan free. Tak payah nak ngada-ngada kopi kayangan. PTPTN bulan ni cukup ke tak tu?"
                        : "Fikir masak-masak sebelum scan. Nanti hujung bulan makan meggi je dalam bilik."}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 z-10 relative pt-4">
                  <Button 
                    className="w-full h-14 bg-white text-rose-600 hover:bg-rose-50 font-black rounded-xl text-base shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
                    onClick={handleCancelIntercept}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="ghost"
                    className="w-full h-12 text-rose-100 hover:bg-rose-700/50 hover:text-white font-bold rounded-xl text-sm"
                    onClick={handleProceedIntercept}
                  >
                    Proceed
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {afterMessage && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="absolute inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
              onClick={() => {
                if (afterMessage.type === 'success') {
                  setAfterMessage(null);
                  setScannedItem(null);
                } else {
                  setAfterMessage(null);
                  setIsWarning(true);
                }
              }}
            >
              <div className="bg-white rounded-3xl p-6 shadow-2xl text-center max-w-sm w-full space-y-4 border border-slate-100 relative overflow-hidden">
                
                {/* Companion avatar */}
                <div className="mx-auto w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center border-4 border-white shadow-md relative z-10">
                  <Pet animation={afterMessage.type === 'success' ? 'idle' : 'walk'} size={64} companionId={selectedCompanion} />
                </div>
                
                <h3 className={cn("text-2xl font-black relative z-10", afterMessage.type === 'success' ? "text-emerald-600" : "text-rose-600")}>
                  {afterMessage.type === 'success' ? 'Fuh, Selamat!' : 'Aduhai... Degilnya!'}
                </h3>
                <p className="text-slate-600 font-medium relative z-10">
                  {afterMessage.text}
                </p>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest relative z-10 mt-2">
                  Tap anywhere to continue
                </p>
              </div>
            </motion.div>
          )}

          {scannedItem && isWarning && !isProcessing && !afterMessage && (
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="w-full max-h-[75vh] overflow-y-auto scrollbar-hide rounded-3xl shadow-2xl"
            >
              <Card className="bg-white border-none rounded-3xl overflow-hidden">
                <div className={cn(alertStyles.bg, "p-4 flex gap-3", alertStyles.border)}>
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", alertStyles.iconBg, alertStyles.text)}>
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className={cn("text-sm font-bold", alertStyles.text)}>NextGen AI Council Decision</h3>
                    <p className={cn("text-xs leading-relaxed mt-1", alertStyles.darkText)}>
                      Spend Guardian flags this RM{scannedItem.amount.toFixed(2)} {scannedItem.category.toLowerCase()} payment as {alertColor === "red" ? "critical" : alertColor === "yellow" ? "medium" : "low"} risk. 
                      Your Safe Daily Spend after purchase becomes RM{quotaAfterPurchase.toFixed(2)}.
                    </p>
                  </div>
                </div>
                
                <CardContent className="p-6 space-y-6">
                  <div className="text-center space-y-1">
                    <p className="text-sm text-slate-500 font-medium">Paying {scannedItem.merchant}</p>
                    <p className="text-4xl font-black text-slate-900 tracking-tight">RM {scannedItem.amount.toFixed(2)}</p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Impulse Negotiator</p>
                      <div className="grid grid-cols-1 gap-2 mt-2">
                        {["Need or dopamine?", "Worth how many hours of work?", "Will future you still thank you next week?"].map((question) => (
                          <div key={question} className="rounded-xl bg-white border border-slate-100 px-3 py-2 text-[11px] font-bold text-slate-700">
                            {question}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-2xl bg-gradient-to-br from-[#FFE9F2] to-white border border-pink-100 p-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#CC0D5A]">Future-Me Visualizer</p>
                      <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                        <div>
                          <p className="text-slate-400 text-[10px]">Current</p>
                          <p className="font-black text-slate-900">RM {currentQuotaRemaining.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-[10px]">After Purchase</p>
                          <p className={cn("font-black", quotaAfterPurchase < 10 ? "text-rose-600" : "text-emerald-600")}>RM {quotaAfterPurchase.toFixed(2)}</p>
                        </div>
                      </div>
                      <p className="mt-2 text-[11px] leading-relaxed text-slate-600">
                        {quotaAfterPurchase < 10
                          ? "Future you may enter survival mode. Delay this purchase by 24 hours and your Safe Daily Spend stays healthier."
                          : "Future you still has breathing room, but NextGen recommends staying mindful."}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-amber-50 border border-amber-100 p-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">Malay Dialect Roast & Toast</p>
                      <p className="mt-1 text-[11px] font-semibold text-amber-900 leading-relaxed">
                        {quotaAfterPurchase < 10
                          ? `Bossku, RM${scannedItem.amount.toFixed(2)} masa safe spend tinggal RM${currentQuotaRemaining.toFixed(2)}? Style ada, tapi bajet tengah tinggal separuh nyawa.`
                          : "Cun, masih dalam kawalan. NextGen approve, tapi jangan lupa matlamat simpanan hari ni."}
                      </p>
                      <p className="mt-2 text-[10px] font-bold text-amber-700">Next action: Move this into a 24-hour Cooling-Off Pocket.</p>
                      <div className="flex justify-between items-center mt-3 pt-2 border-t border-amber-200/50">
                        <span className="text-[9px] text-amber-600 font-medium">Share to get Streak Shield + RM10!</span>
                        <button
                          onClick={() => {
                            useStore.getState().activateStreakShield();
                            useStore.setState((s) => ({
                              user: { ...s.user, currentBalance: s.user.currentBalance + 10 }
                            }));
                            alert("Passport generated! 🛡️ Streak Shield activated & RM10 simulated referral bounty added to wallet!");
                          }}
                          className="px-2.5 py-1 rounded-lg bg-amber-600 text-white font-extrabold text-[9px] hover:bg-amber-700 transition-colors shadow-sm flex items-center gap-1"
                        >
                          📢 Share My Roast
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      variant="outline" 
                      className="h-12 border-slate-200 text-slate-600 rounded-xl"
                      onClick={() => setScannedItem(null)}
                    >
                      Cool Off
                    </Button>
                    <Button 
                      className="h-12 bg-rose-500 hover:bg-rose-600 text-white rounded-xl"
                      onClick={handleConfirmPay}
                    >
                      Pay Anyway
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {isProcessing && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center justify-center space-y-4"
            >
              <div className="w-16 h-16 rounded-full border-4 border-slate-200 border-t-primary animate-spin"></div>
              <p className="font-medium text-slate-600">Processing Payment...</p>
            </motion.div>
          )}

          {isFailed && !isProcessing && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full bg-white p-6 rounded-3xl shadow-2xl flex flex-col space-y-6"
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-rose-500/20 flex items-center justify-center mx-auto text-rose-500">
                  <AlertCircle className="w-10 h-10 animate-bounce" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-slate-900">Payment Declined</h3>
                  <p className="text-xs text-muted-foreground">
                    Insufficient funds in your virtual wallet.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 space-y-2">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Your Balance:</span>
                  <span className="font-bold text-slate-700">RM {user.currentBalance.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Required:</span>
                  <span className="font-bold text-rose-600">RM {scannedItem!.amount.toFixed(2)}</span>
                </div>
                <div className="border-t border-rose-100/50 pt-2 flex justify-between text-xs font-bold text-rose-600">
                  <span>Shortfall:</span>
                  <span>RM {(scannedItem!.amount - user.currentBalance).toFixed(2)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="h-12 border-slate-200 text-slate-600 rounded-xl"
                  onClick={() => {
                    setIsFailed(false)
                    setScannedItem(null)
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  className="h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl"
                  onClick={() => setShowTopUpModal(true)}
                >
                  Top Up
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <TopUpModal 
          isOpen={showTopUpModal} 
          onClose={() => {
            setShowTopUpModal(false)
            if (user.currentBalance >= scannedItem!.amount) {
              setIsFailed(false)
            }
          }} 
        />
      </div>
    </div>
  )
}
