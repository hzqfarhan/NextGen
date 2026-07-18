"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowUpRight, ShieldCheck, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/store/useStore"
import { cn } from "@/lib/utils"

export default function Landing() {
  const router = useRouter();
  const [nameInput, setNameInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Passcode verification states
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleStart = async () => {
    const finalName = nameInput.trim();
    if (!finalName) return;

    setIsLoading(true);
    setErrorMsg("");
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500); // 3.5 seconds timeout

      // Fetch profile from database (checking if user exists)
      const res = await fetch(`/api/sync?username=${encodeURIComponent(finalName)}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const data = await res.json();
      
      if (data.success && (data.data || data.exists)) {
        // User exists! Show passcode modal for authorization
        setIsLoading(false);
        setShowPasscodeModal(true);
      } else {
        // User does not exist! Route them to onboarding and delete setupDate to prevent early sync
        useStore.setState((state) => ({ 
          user: { 
            ...state.user, 
            name: finalName, 
            setupDate: undefined 
          } 
        }));
        router.push('/setup');
      }
    } catch (e) {
      console.error(e);
      // Fallback to onboarding if connection times out/fails
      useStore.setState((state) => ({ 
        user: { 
          ...state.user, 
          name: finalName, 
          setupDate: undefined 
        } 
      }));
      router.push('/setup');
    }
  };

  const handleVerifyPasscode = async () => {
    if (passcodeInput.length !== 4) return;
    setIsVerifying(true);
    setErrorMsg("");

    try {
      const res = await fetch(`/api/sync?username=${encodeURIComponent(nameInput.trim())}&passcode=${passcodeInput}`);
      const data = await res.json();

      if (res.status === 200 && data.success && data.data) {
        // Passcode correct! Sync state and route to dashboard
        useStore.setState(data.data);
        router.push('/dashboard');
      } else {
        setErrorMsg("Incorrect passcode. Please try again.");
        setPasscodeInput("");
        setIsVerifying(false);
      }
    } catch (e) {
      setErrorMsg("Verification failed. Please check connection.");
      setIsVerifying(false);
    }
  };

  // Auto-verify when passcode length reaches 4
  useEffect(() => {
    if (passcodeInput.length === 4 && showPasscodeModal) {
      handleVerifyPasscode();
    }
  }, [passcodeInput]);

  // Keypad presses
  const handleKeypadPress = (val: string) => {
    if (passcodeInput.length >= 4) return;
    setPasscodeInput(prev => prev + val);
    setErrorMsg("");
  };

  const handleKeypadBackspace = () => {
    setPasscodeInput(prev => prev.slice(0, -1));
    setErrorMsg("");
  };

  const handleKeypadClear = () => {
    setPasscodeInput("");
    setErrorMsg("");
  };

  // Keyboard binding for keypad
  useEffect(() => {
    if (!showPasscodeModal) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isVerifying) return;
      if (e.key >= '0' && e.key <= '9') {
        handleKeypadPress(e.key);
      } else if (e.key === 'Backspace') {
        handleKeypadBackspace();
      } else if (e.key === 'Escape') {
        setShowPasscodeModal(false);
        setPasscodeInput("");
        setErrorMsg("");
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showPasscodeModal, passcodeInput, isVerifying]);

  return (
    <div className="min-h-screen bg-transparent text-foreground flex flex-col items-center justify-between p-8 overflow-hidden relative font-sans">
      
      {/* Background Liquid blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            x: [0, 50, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: [0, -45, 0],
            x: [0, -30, 0],
            y: [0, 60, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] bg-secondary/20 blur-[100px] rounded-full"
        />
        
        <div className="absolute inset-0 flex items-center justify-center opacity-70 scale-110">
          <svg viewBox="0 0 200 200" className="w-full h-full max-w-2xl filter blur-sm">
            <defs>
              <linearGradient id="liquidGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#DF0059" />
                <stop offset="52%" stopColor="#E06E9C" />
                <stop offset="100%" stopColor="#FFC107" />
              </linearGradient>
            </defs>
            <motion.path 
              animate={{
                d: [
                  "M45,-67.2C58.9,-61.1,71.2,-49.2,77.5,-34.8C83.8,-20.5,84.1,-3.7,79.5,11.5C74.9,26.7,65.3,40.3,53.2,50.7C41.1,61.1,26.5,68.4,10.6,71.3C-5.3,74.2,-22.4,72.7,-37.8,65.5C-53.2,58.3,-66.8,45.4,-73.4,30.1C-80,14.8,-79.6,-2.9,-73.9,-18.8C-68.2,-34.7,-57.2,-48.9,-44.1,-55.4C-31,-61.9,-15.5,-60.7,0.1,-60.8C15.7,-60.9,31.1,-73.3,45,-67.2Z",
                  "M38.5,-55.2C49.9,-46.8,59.3,-35.6,64.2,-22.6C69.1,-9.6,69.5,5.2,65.2,19.2C60.9,33.2,51.8,46.4,39.6,54.8C27.4,63.2,12.2,66.8,-2.8,70.5C-17.8,74.2,-32.5,78,-44.7,72.5C-56.9,67,-66.6,52.2,-71.4,36.5C-76.2,20.8,-76.1,4.2,-71.9,-10.8C-67.7,-25.8,-59.4,-39.2,-47.8,-47.6C-36.2,-56,-21.3,-59.4,-6.6,-50.2C8.1,-41.1,27.1,-63.6,38.5,-55.2Z",
                  "M45,-67.2C58.9,-61.1,71.2,-49.2,77.5,-34.8C83.8,-20.5,84.1,-3.7,79.5,11.5C74.9,26.7,65.3,40.3,53.2,50.7C41.1,61.1,26.5,68.4,10.6,71.3C-5.3,74.2,-22.4,72.7,-37.8,65.5C-53.2,58.3,-66.8,45.4,-73.4,30.1C-80,14.8,-79.6,-2.9,-73.9,-18.8C-68.2,-34.7,-57.2,-48.9,-44.1,-55.4C-31,-61.9,-15.5,-60.7,0.1,-60.8C15.7,-60.9,31.1,-73.3,45,-67.2Z"
                ]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              transform="translate(100 100)" 
              fill="url(#liquidGrad)" 
              className="opacity-75"
            />
          </svg>
        </div>
      </div>

      {/* Header */}
      <header className="w-full max-w-lg z-10 flex items-center justify-between">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-1"
        >
          <h1
            className="text-4xl font-black tracking-tight mb-2"
            style={{
              background: 'linear-gradient(135deg, #DF0059 0%, #CC0D5A 52%, #221F20 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: 'none',
              filter: 'drop-shadow(0 12px 30px rgba(223,0,89,0.22))'
            }}
          >
            NextGen
          </h1>
          <div className="w-1.5 h-1.5 bg-secondary rounded-full mt-2" />
        </motion.div>
        
        <div className="hidden sm:flex items-center gap-4 text-[11px] font-bold opacity-60">
          <span>9:41</span>
          <div className="flex gap-0.5">
            <div className="w-0.5 h-2 bg-foreground rounded-full" />
            <div className="w-0.5 h-2.5 bg-foreground rounded-full" />
            <div className="w-0.5 h-3 bg-foreground rounded-full" />
            <div className="w-0.5 h-3.5 bg-foreground rounded-full" />
          </div>
        </div>
      </header>

      {/* Hero Content */}
      <main className="w-full max-w-lg z-10 flex flex-col items-start gap-6 mt-12 sm:mt-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <h1 className="text-6xl sm:text-7xl font-bold tracking-tight leading-[0.95] max-w-xs">
            Can I afford this <span className="text-primary italic">right now?</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground font-medium max-w-xs leading-snug">
            BeU NextGen helps you protect must-pay money, calculate Safe Daily Spend, and pause risky purchases before future-you feels it.
          </p>
        </motion.div>
      </main>

      {/* Actions */}
      <footer className="w-full max-w-lg z-10 flex flex-col items-center gap-6 pb-4 sm:pb-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full flex items-center gap-4"
        >
          <div className="flex-1 flex flex-col gap-3">
            <Input 
              placeholder="Enter your name (e.g. Aiman)" 
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="h-14 rounded-2xl bg-white/50 backdrop-blur-sm border-foreground/10 text-lg px-6 text-black"
            />
            <Button 
              onClick={handleStart}
              disabled={isLoading || !nameInput.trim()}
              className="w-full h-16 bg-foreground text-background hover:bg-foreground/90 rounded-[2rem] text-lg font-bold flex items-center justify-between px-8 group disabled:opacity-50"
            >
              {isLoading ? (
                <>Verifying Profile... <Loader2 className="w-6 h-6 animate-spin" /></>
              ) : (
                <>Start NextGen <ArrowUpRight className="w-6 h-6 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></>
              )}
            </Button>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" size="icon" className="w-16 h-16 rounded-full border-foreground/10 bg-background/50 backdrop-blur-xl hover:bg-foreground/5">
              <ShieldCheck className="w-7 h-7" />
            </Button>
          </div>
        </motion.div>
        
        <div className="w-32 h-1 bg-foreground/10 rounded-full mt-4" />
      </footer>
      
      {/* Decorative Blur for Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-8 bg-slate-900 rounded-b-3xl z-20 hidden sm:block" />

      {/* Passcode Keypad Modal Overlay */}
      <AnimatePresence>
        {showPasscodeModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!isVerifying) {
                  setShowPasscodeModal(false);
                  setPasscodeInput("");
                  setErrorMsg("");
                }
              }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xl z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white border border-pink-100 shadow-2xl rounded-[2.5rem] p-8 w-full max-w-sm flex flex-col items-center gap-6"
              >
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-black text-slate-900">Enter Passcode</h3>
                  <p className="text-xs text-slate-500">
                    Enter the 4-digit passcode for <strong>{nameInput}</strong> to access dashboard.
                  </p>
                </div>

                {/* Passcode Dots */}
                <div className="flex justify-center gap-4 py-2">
                  {[0, 1, 2, 3].map((idx) => {
                    const filled = passcodeInput.length > idx;
                    return (
                      <div
                        key={idx}
                        className={cn(
                          "w-4 h-4 rounded-full border-2 transition-all duration-150",
                          filled
                            ? "bg-primary border-primary scale-110 shadow-sm shadow-primary/30"
                            : "border-slate-300"
                        )}
                      />
                    );
                  })}
                </div>

                {errorMsg && (
                  <p className="text-rose-500 text-xs font-bold text-center">
                    {errorMsg}
                  </p>
                )}

                {/* Keypad Grid */}
                <div className="grid grid-cols-3 gap-3 w-full max-w-[240px] mx-auto pt-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                      key={num}
                      disabled={isVerifying}
                      onClick={() => handleKeypadPress(num.toString())}
                      className="w-14 h-14 rounded-full bg-slate-50 active:bg-slate-100 disabled:opacity-50 text-slate-950 font-bold text-lg flex items-center justify-center transition-colors outline-none border border-slate-100 shadow-sm"
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    disabled={isVerifying}
                    onClick={handleKeypadClear}
                    className="w-14 h-14 rounded-full text-slate-400 font-bold text-xs flex items-center justify-center outline-none"
                  >
                    Clear
                  </button>
                  <button
                    disabled={isVerifying}
                    onClick={() => handleKeypadPress('0')}
                    className="w-14 h-14 rounded-full bg-slate-50 active:bg-slate-100 disabled:opacity-50 text-slate-950 font-bold text-lg flex items-center justify-center transition-colors outline-none border border-slate-100 shadow-sm"
                  >
                    0
                  </button>
                  <button
                    disabled={isVerifying}
                    onClick={handleKeypadBackspace}
                    className="w-14 h-14 rounded-full text-slate-400 font-bold text-xs flex items-center justify-center outline-none"
                  >
                    ⌫
                  </button>
                </div>

                <div className="w-full flex gap-3 mt-2">
                  <Button
                    variant="outline"
                    disabled={isVerifying}
                    onClick={() => {
                      setShowPasscodeModal(false);
                      setPasscodeInput("");
                      setErrorMsg("");
                    }}
                    className="flex-1 h-12 rounded-2xl text-xs font-bold border-slate-200 text-black hover:bg-slate-50"
                  >
                    Cancel
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  )
}
