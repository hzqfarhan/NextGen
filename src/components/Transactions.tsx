"use client"

import { useStore } from "@/store/useStore"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Plus, Filter, Wallet } from "lucide-react"
import { cn } from "@/lib/utils"

import { useState } from "react"

export function Transactions() {
  const { transactions, user } = useStore()
  const [searchQuery, setSearchQuery] = useState("")

  const filteredTransactions = transactions.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-4 space-y-6 pb-24 max-w-lg mx-auto">
      <header className="flex justify-between items-end">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary text-glow" />
            <h1 className="text-2xl font-bold">Transactions</h1>
          </div>
          <p className="text-muted-foreground text-sm">Monthly balance: RM {user.currentBalance.toFixed(2)}</p>
        </div>
        <button className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-slate-900 shadow-lg shadow-primary/20 active:scale-95 transition-all">
          <Plus className="w-6 h-6" />
        </button>
      </header>

      <div className="relative group">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <input
          placeholder="Search transactions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-foreground/5 border border-border rounded-2xl h-12 pl-10 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-muted-foreground/50"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-10 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <div className="w-4 h-4 rounded-full bg-foreground/10 flex items-center justify-center text-[10px] font-bold">✕</div>
          </button>
        )}
        <Filter className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      </div>

      <ScrollArea className="h-[calc(100vh-280px)]">
        <div className="space-y-3">
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((t) => (
              <Card key={t.id} className="glass-card">
                <CardContent className="p-4 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center text-xl">
                      {t.type === 'saving' ? '🛡️' :
                        t.type === 'income' ? '💰' :
                          t.category === 'Food' ? '🍱' :
                            t.category === 'Transport' ? '🚗' :
                              t.category === 'Housing' ? '🏠' :
                                t.category === 'Utilities' ? '📱' :
                                  t.category === 'Education' ? '🎓' :
                                    t.category === 'Entertainment' ? '📺' : '🛍️'}
                    </div>
                    <div>
                      <p className="text-xs font-bold">{t.title}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] text-muted-foreground">{t.category}</p>
                        <Badge variant="outline" className="text-[8px] h-3 px-1 border-emerald-500/30 text-emerald-500 bg-emerald-500/5">
                          {Math.round((t.confidence || 0) * 100)}% MATCH
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "text-sm font-bold",
                      t.type === 'expense' ? "text-rose-500" : t.type === 'saving' ? "text-amber-400" : "text-emerald-500"
                    )}>
                      {t.type === 'expense' ? '- RM' : t.type === 'saving' ? 'RM' : '+ RM'}{t.amount.toFixed(2)}
                    </p>
                    <p className="text-[9px] text-muted-foreground">{new Date(t.date).toLocaleDateString()}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="py-20 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto">
                <Search className="w-8 h-8 text-muted-foreground/30" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-muted-foreground">No transactions found</p>
                <p className="text-xs text-muted-foreground/60">Try searching for a different keyword</p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
