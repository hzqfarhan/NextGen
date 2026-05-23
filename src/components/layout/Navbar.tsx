"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Zap, CreditCard, Shield, Settings, MessageSquare, Target, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

import { QrCode } from "lucide-react"
import { useStore } from "@/store/useStore"
import { t } from "@/lib/translations"

export function Navbar() {
  const pathname = usePathname()
  const { language, hasNotificationSave } = useStore()
  const strings = t[language]

  if (pathname === '/' || pathname === '/coach' || pathname === '/setup' || pathname === '/diagnostics') return null

  const leftNavItems = [
    { icon: Home, label: strings.navHome, href: "/dashboard" },
    { icon: CreditCard, label: strings.navCards, href: "/cards" },
  ]

  const rightNavItems = [
    { icon: Target, label: strings.navSave, href: "/savings" },
    { icon: TrendingUp, label: strings.navReports, href: "/reports" },
  ]

  return (
    <nav className="fixed bottom-4 left-4 right-4 z-50 bg-background/60 dark:bg-background/40 backdrop-blur-xl border border-border rounded-2xl shadow-lg">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {/* Left Items */}
        <div className="flex justify-around items-center w-2/5">
          {leftNavItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center space-y-1 transition-all duration-300",
                  isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive && "text-glow")} />
                <span className="text-[10px] font-medium">{item.label}</span>
                {isActive && (
                  <div className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full neon-border" />
                )}
              </Link>
            )
          })}
        </div>

        {/* Center QR Button */}
        <div className="w-1/5 flex justify-center -mt-8">
          <Link href="/scan" className="w-14 h-14 rounded-full bg-primary flex flex-col items-center justify-center text-white shadow-lg shadow-primary/30 border-4 border-primary hover:scale-105 transition-transform">
            <QrCode className="w-6 h-6" />
            <span className="text-[8px] font-bold mt-0.5">{strings.navPay}</span>
          </Link>
        </div>

        {/* Right Items */}
        <div className="flex justify-around items-center w-2/5">
          {rightNavItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  if (item.href === "/savings") {
                    useStore.setState({ hasNotificationSave: false })
                  }
                }}
                className={cn(
                  "flex flex-col items-center justify-center space-y-1 transition-all duration-300 relative",
                  isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className="relative">
                  <item.icon className={cn("w-5 h-5", isActive && "text-glow")} />
                  {item.href === "/savings" && hasNotificationSave && (
                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
                {isActive && (
                  <div className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full neon-border" />
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
