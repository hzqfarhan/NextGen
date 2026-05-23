"use client"

import { useStore, Agent } from "@/store/useStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { Zap, Activity, Cpu, Shield, Brain, Target, MessageCircle, AlertCircle, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { t } from "@/lib/translations"

const agentIcons: Record<string, any> = {
  orch: Cpu,
  spend: Activity,
  cash: Brain,
  debt: Shield,
  budget: Zap,
  save: Target,
  nudge: AlertCircle,
  coach: MessageCircle,
}

export function AgentCommandCenter() {
  const { agents, language } = useStore()
  const strings = t[language]

  return (
    <div className="p-4 space-y-6 pb-24 max-w-lg mx-auto">
      <header className="space-y-1">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary text-glow" />
          <h1 className="text-2xl font-bold">{strings.agentHeader}</h1>
        </div>
        <p className="text-muted-foreground text-sm">{strings.agentSubheader}</p>
      </header>

      {/* Orchestrator Status */}
      <Card className="glass-card border-primary/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-primary/20">
          <motion.div 
            className="h-full bg-primary neon-border"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
        </div>
        <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Cpu className="w-4 h-4 text-primary" /> {strings.agentNameOrch}
          </CardTitle>
          <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30">
            {strings.agentOrchStatus}
          </Badge>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="text-xs text-muted-foreground italic">{strings.agentOrchLog}</p>
        </CardContent>
      </Card>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 gap-4">
        {agents.map((agent, index) => {
          const Icon = agentIcons[agent.id] || Zap
          return (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={cn(
                "glass-card border-l-4 transition-all duration-300",
                agent.status === 'alert' ? "border-l-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)]" : "border-l-primary/30"
              )}>
                <CardContent className="p-4 flex gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    agent.status === 'alert' ? "bg-amber-500/20 text-amber-500" : "bg-primary/10 text-primary"
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-sm font-bold">{strings[('agentName' + agent.id.charAt(0).toUpperCase() + agent.id.slice(1)) as keyof typeof strings] || agent.name}</h3>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Activity className="w-2.5 h-2.5" /> {(agent.confidence * 100).toFixed(0)}% {strings.agentConfidence}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {agent.tools.map(tool => (
                          <div key={tool} className="w-1.5 h-1.5 rounded-full bg-primary/30" title={tool} />
                        ))}
                      </div>
                    </div>
                    
                    <p className="text-[11px] leading-relaxed text-muted-foreground bg-slate-100/50 p-2 rounded-lg border border-slate-200">
                      {strings[('agentFinding' + agent.id.charAt(0).toUpperCase() + agent.id.slice(1)) as keyof typeof strings] || agent.latestFinding}
                    </p>

                    {agent.status === 'alert' && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="p-1 rounded bg-amber-500/20 text-amber-500">
                          <AlertCircle className="w-3 h-3" />
                        </div>
                        <p className="text-[10px] font-bold text-amber-500 uppercase tracking-tight">
                          {strings.agentAction}: {strings[('agentRec' + agent.id.charAt(0).toUpperCase() + agent.id.slice(1)) as keyof typeof strings] || agent.recommendedAction}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Simulation Feed */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">{strings.agentSystemLogs}</h3>
        <div className="bg-slate-100/80 rounded-2xl p-4 border border-slate-200 font-mono text-[9px] space-y-1 h-32 overflow-hidden">
          <p className="text-emerald-500">[OK] SPENDING_SENSE: Categorized GrabFood - RM25.50</p>
          <p className="text-primary font-bold">[INFO] CASHFLOW_PREDICT: Updating broke_date: 2026-05-18</p>
          <p className="text-amber-500">[WARN] DEBT_SHIELD: New BNPL simulation detected</p>
          <p className="text-primary-400">[CMD] ORCHESTRATOR: Dispatching behavioral_nudge</p>
          <p className="text-muted-foreground">[LOG] System latency: 12ms</p>
          <motion.p 
            animate={{ opacity: [1, 0, 1] }} 
            transition={{ duration: 1, repeat: Infinity }}
            className="text-primary-400"
          >
            _
          </motion.p>
        </div>
      </div>
    </div>
  )
}
