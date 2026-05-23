"use client"

import { Bills } from "@/components/Bills"
import { useStore } from "@/store/useStore"
import { useEffect } from "react"

export default function BillsPage() {
  const processAutoPay = useStore(state => state.processAutoPay)

  useEffect(() => {
    // Run AutoPay check when visiting the bills page
    processAutoPay()
  }, [])

  return (
    <main className="min-h-screen bg-slate-50/30 dark:bg-slate-950/30">
      <Bills />
    </main>
  )
}
