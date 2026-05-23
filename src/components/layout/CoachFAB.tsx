"use client"

import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { useStore } from "@/store/useStore"
import { Pet } from "@/components/ui/Pet"

const MESSAGES = [
  "Click me!", 
  "Have a good day!", 
  "Need help?", 
  "Keep it up!", 
  "Doing great!", 
  "Check your stats!", 
  "Stay focused!",
  "Financial freedom!",
  "Save more today!",
  "Invest wisely!"
]

export function CoachFAB() {
  const pathname = usePathname()
  const [msgIndex, setMsgIndex] = useState(0)
  const { message: petMessage, animation: petAnimation } = useStore((state) => state.pet)
  const constraintsRef = useRef(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % MESSAGES.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  if (pathname === '/' || pathname === '/onboarding' || pathname === '/coach' || pathname === '/scan' || pathname === '/setup') return null
  const message = msgIndex === 0 ? petMessage : MESSAGES[msgIndex]

  return (
    <>
      {/* Hidden constraint boundary */}
      <div ref={constraintsRef} className="fixed inset-0 top-20 bottom-24 pointer-events-none" />
      
      <motion.div 
        drag
        dragConstraints={constraintsRef}
        dragElastic={0.1}
        dragTransition={{ power: 0.2, timeConstant: 200 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-24 right-4 z-40 cursor-grab active:cursor-grabbing flex items-center pointer-events-auto"
      >
        <div className="relative">
          {/* Chat Bubble */}
          <AnimatePresence mode="wait">
            <motion.div
              key={message}
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.8 }}
              className="absolute -top-4 -left-12 bg-[#FFE9F2]/95 backdrop-blur-sm px-2 py-1.5 rounded-xl rounded-br-none shadow-lg border border-[#F3C7D8] whitespace-nowrap pointer-events-none"
            >
              <p className="text-[6px] font-bold text-[#CC0D5A] tracking-tight" style={{ fontFamily: "'Press Start 2P', cursive" }}>
                {message}
              </p>
              {/* Bubble Tail */}
              <div className="absolute -bottom-1 right-0 w-2 h-2 bg-[#FFE9F2]/95 border-r border-b border-[#F3C7D8] rotate-45" />
            </motion.div>
          </AnimatePresence>

          <Link 
            href="/coach"
            className="block hover:scale-110 transition-transform active:scale-95"
          >
            <div className="relative pointer-events-none">
              <Pet animation={(petAnimation as any) || "idle"} size={80} />
            </div>
          </Link>
        </div>
      </motion.div>
    </>
  )
}
