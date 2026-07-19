import { useState, useEffect, useRef } from "react";
import { useStore } from "@/store/useStore";
import { Message, ChatAction } from "@/components/coach/types";
import { parseTransferIntent } from "@/lib/transferParser";
import { fetchWithRetry } from "@/lib/apiRetry";
import { analyzeSpending, detectSubscriptions } from "@/lib/spendingAnalysis";
import { analyzeBills, checkBillCoverage } from "@/lib/billIntelligence";
import { calculateSavingsVelocity } from "@/lib/savingsProjection";
import { haptic } from "@/lib/utils";

export function useCoachChat() {
  const { user, safeDailySpend, transactions, nextGenScore, addSavingsPocket, savingsPockets, bills, addTransaction } = useStore();
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

  const [isLoaded, setIsLoaded] = useState(false);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [undoToast, setUndoToast] = useState<{ message: string; onUndo: () => void } | null>(null);

  // Multi-session chat state bound to Zustand for Supabase Sync
  const sessions = useStore(s => s.coachSessions) || [];
  const coachMessagesMap = useStore(s => s.coachMessagesMap) || {};
  const currentSessionId = useStore(s => s.coachCurrentSessionId) || 'default';
  
  const messages = coachMessagesMap[currentSessionId] || [];

  const setSessions = (newSessions: any[]) => {
    useStore.setState({ coachSessions: newSessions });
  };

  const setCurrentSessionId = (newId: string) => {
    useStore.setState({ coachCurrentSessionId: newId });
  };

  const setMessages = (newMessages: Message[] | ((prev: Message[]) => Message[])) => {
    const currentMap = useStore.getState().coachMessagesMap || {};
    const currentId = useStore.getState().coachCurrentSessionId || 'default';
    const oldMessages = currentMap[currentId] || [];
    const resolvedMessages = typeof newMessages === 'function' ? newMessages(oldMessages) : newMessages;
    
    useStore.setState({
      coachMessagesMap: {
        ...currentMap,
        [currentId]: resolvedMessages
      }
    });
  };

  // Speech Recognition states
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef("");
  const hasGreetedRef = useRef(false);

  const triggerGreeting = () => {
    const store = useStore.getState();
    const urgentBills = analyzeBills(store.bills.filter(b => b.status !== 'paid')).filter(b => b.status === 'urgent').length;
    
    let greetingMessage: Message | null = null;
 
    if (urgentBills > 0) {
      greetingMessage = {
        timestamp: new Date().toISOString(),
        role: 'assistant',
        agent: 'Commitment Shield',
        content: `Hey! You have ${urgentBills} urgent bill(s) due soon. Want me to check if you have enough balance to cover them?`,
        actions: [{ id: 'check_bills', label: 'Check Bills', type: 'check_bills' }]
      };
    }
 
    if (greetingMessage) {
      setMessages([greetingMessage]);
    } else {
      setMessages([]);
    }
    setIsLoaded(true);
  };

  // Load persisted sessions and active chat
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 1. Initialize sessions list from Zustand or localStorage
      let loadedSessions = useStore.getState().coachSessions || [];
      if (loadedSessions.length === 0) {
        const savedSessions = localStorage.getItem('coach_sessions');
        if (savedSessions) {
          try {
            loadedSessions = JSON.parse(savedSessions);
          } catch (e) {
            console.error(e);
          }
        }
      }
      if (!Array.isArray(loadedSessions) || loadedSessions.length === 0) {
        loadedSessions = [{ id: 'default', title: 'Sembang Utama / Main Chat', createdAt: new Date().toISOString() }];
      }

      // 2. Initialize current session ID
      const savedCurrentSessionId = localStorage.getItem('coach_current_session_id') || useStore.getState().coachCurrentSessionId || 'default';

      // 2b. If the current session already has user messages, start a fresh session for this new visit!
      let hasUserMessages = false;
      const currentMessagesSaved = localStorage.getItem(`coach_messages_${savedCurrentSessionId}`);
      if (currentMessagesSaved) {
        try {
          const parsed = JSON.parse(currentMessagesSaved);
          hasUserMessages = Array.isArray(parsed) && parsed.some((m: any) => m.role === 'user');
        } catch (e) {}
      } else {
        const zustandMsgs = (useStore.getState().coachMessagesMap || {})[savedCurrentSessionId] || [];
        hasUserMessages = zustandMsgs.some((m: any) => m.role === 'user');
      }

      let activeId = savedCurrentSessionId;

      if (hasUserMessages) {
        activeId = Math.random().toString(36).substring(7);
        const newSession = {
          id: activeId,
          title: `Sembang Baru / New Chat #${loadedSessions.length + 1}`,
          createdAt: new Date().toISOString(),
          isUncommitted: true
        };
        loadedSessions.push(newSession);
        localStorage.setItem('coach_current_session_id', activeId);
      }

      setCurrentSessionId(activeId);

      // Clean loaded sessions list: keep the current active one, and any other session that has at least one user message
      const cleanedSessions = loadedSessions.filter((s: any) => {
        if (s.id === activeId) return true;
        let savedMessages = localStorage.getItem(`coach_messages_${s.id}`);
        if (!savedMessages) {
          const zMsgs = (useStore.getState().coachMessagesMap || {})[s.id];
          if (zMsgs) savedMessages = JSON.stringify(zMsgs);
        }
        if (!savedMessages) return false;
        try {
          const parsed = JSON.parse(savedMessages);
          return Array.isArray(parsed) && parsed.some((m: any) => m.role === 'user');
        } catch (e) {
          return false;
        }
      });

      // Clear empty messages from localStorage and Zustand for pruned sessions
      loadedSessions.forEach((s: any) => {
        const stillExists = cleanedSessions.some((cs: any) => cs.id === s.id);
        if (!stillExists && s.id !== activeId) {
          localStorage.removeItem(`coach_messages_${s.id}`);
          const currentMap = { ...(useStore.getState().coachMessagesMap || {}) };
          delete currentMap[s.id];
          useStore.setState({ coachMessagesMap: currentMap });
        }
      });

      // Persist only committed sessions to localStorage
      const committed = cleanedSessions.filter((s: any) => !s.isUncommitted);
      localStorage.setItem('coach_sessions', JSON.stringify(committed));

      setSessions(cleanedSessions);

      // 3. Load messages for the current session
      let savedMessages = localStorage.getItem(`coach_messages_${activeId}`);
      if (!savedMessages) {
        const zustandMsgs = (useStore.getState().coachMessagesMap || {})[activeId];
        if (zustandMsgs && zustandMsgs.length > 0) {
          savedMessages = JSON.stringify(zustandMsgs);
        }
      }

      // Only restore from cache if the conversation has actual user interaction.
      // If it's purely assistant greeting messages (no user messages), always
      // regenerate a fresh greeting from live store data.
      if (savedMessages) {
        try {
          const parsed = JSON.parse(savedMessages);
          const hasUserMsg = Array.isArray(parsed) && parsed.some((m: any) => m.role === 'user');
          if (Array.isArray(parsed) && parsed.length > 0 && hasUserMsg) {
            setMessages(parsed);
            setIsLoaded(true);
            return;
          }
        } catch (e) {
          console.error(e);
        }
      } else if (activeId === 'default') {
        // Backward compatibility: import from old single-session cache
        const oldSaved = localStorage.getItem('coach_messages');
        if (oldSaved) {
          try {
            const parsed = JSON.parse(oldSaved);
            const hasUserMsg = Array.isArray(parsed) && parsed.some((m: any) => m.role === 'user');
            if (Array.isArray(parsed) && parsed.length > 0 && hasUserMsg) {
              setMessages(parsed);
              localStorage.setItem('coach_messages_default', oldSaved);
              setIsLoaded(true);
              return;
            }
          } catch (e) {}
        }
      }
    }

    // Trigger greeting if no messages loaded
    triggerGreeting();
  }, []);

  // Persist messages for the active session and commit session if user interacted
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined' && currentSessionId) {
      localStorage.setItem(`coach_messages_${currentSessionId}`, JSON.stringify(messages));
      if (currentSessionId === 'default') {
        localStorage.setItem('coach_messages', JSON.stringify(messages));
      }

      // Check if this active session has user messages
      const hasUserMsg = messages.some(m => m.role === 'user');
      if (hasUserMsg) {
        // Check if this session is currently marked as uncommitted in the state list
        const sessionIndex = sessions.findIndex((s: any) => s.id === currentSessionId);
        if (sessionIndex !== -1 && sessions[sessionIndex].isUncommitted) {
          // Commit it!
          const updatedSessions = sessions.map((s: any) => 
            s.id === currentSessionId ? { ...s, isUncommitted: false } : s
          );
          setSessions(updatedSessions);
          
          // Persist all committed sessions
          const committed = updatedSessions.filter((s: any) => !s.isUncommitted);
          localStorage.setItem('coach_sessions', JSON.stringify(committed));
        }
      }
    }
  }, [messages, isLoaded, currentSessionId, sessions]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = 'en-US';

        rec.onstart = () => {
          setIsListening(true);
          setInterimTranscript("");
          transcriptRef.current = "";
        };

        rec.onend = () => {
          setIsListening(false);
          const finalPrompt = transcriptRef.current.trim();
          if (finalPrompt) {
            sendMessage(finalPrompt);
            transcriptRef.current = "";
          }
        };

        rec.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        rec.onresult = (event: any) => {
          let interim = "";
          let final = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcriptText = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              final += transcriptText;
            } else {
              interim += transcriptText;
            }
          }
          if (final) {
            setInput(prev => {
              const base = prev.trim();
              const updated = base ? `${base} ${final}` : final;
              transcriptRef.current = updated;
              return updated;
            });
            setInterimTranscript("");
          } else if (interim) {
            setInterimTranscript(interim);
          }
        };
        recognitionRef.current = rec;
      }
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) recognitionRef.current.stop();
    else recognitionRef.current.start();
  };

  const validateToolCall = (name: string, args: any): { valid: boolean; error?: string } => {
    const store = useStore.getState();
    const balance = store.user.currentBalance;

    switch (name) {
      case 'createSavingsPocket': {
        const deposit = Number(args.deposit) || 0;
        const target = Number(args.target) || 0;
        const pocketName = args.name?.trim();

        if (!pocketName) {
          return { valid: false, error: "Nama pocket tidak boleh kosong. / Pocket name cannot be empty." };
        }
        if (target <= 0) {
          return { valid: false, error: "Jumlah sasaran mesti melebihi RM 0. / Target amount must be greater than RM 0." };
        }
        if (deposit < 0) {
          return { valid: false, error: "Jumlah deposit tidak boleh negatif. / Deposit amount cannot be negative." };
        }
        if (deposit > balance) {
          return { valid: false, error: `Baki tidak mencukupi untuk mendepositkan RM ${deposit.toFixed(2)} (Baki semasa: RM ${balance.toFixed(2)}).` };
        }
        break;
      }
      case 'addFundsToPocket': {
        const amount = Number(args.amount) || 0;
        const pocketName = args.pocketName?.trim();

        if (!pocketName) {
          return { valid: false, error: "Nama pocket tidak boleh kosong. / Pocket name cannot be empty." };
        }
        if (amount <= 0) {
          return { valid: false, error: "Jumlah pindahan mesti melebihi RM 0. / Transfer amount must be greater than RM 0." };
        }
        if (amount > balance) {
          return { valid: false, error: `Baki tidak mencukupi untuk memindahkan RM ${amount.toFixed(2)} (Baki semasa: RM ${balance.toFixed(2)}).` };
        }
        break;
      }
      case 'addTransaction': {
        const amount = Number(args.amount) || 0;
        const title = args.title?.trim();

        if (!title) {
          return { valid: false, error: "Tajuk transaksi tidak boleh kosong. / Transaction title cannot be empty." };
        }
        if (amount <= 0) {
          return { valid: false, error: "Jumlah transaksi mesti melebihi RM 0. / Transaction amount must be greater than RM 0." };
        }
        break;
      }
      case 'toggleSpendGuard': {
        if (args.enable === undefined) {
          return { valid: false, error: "Parameter 'enable' tidak sah. / Invalid 'enable' parameter." };
        }
        break;
      }
    }
    return { valid: true };
  };

  const executeGeminiFunctionCall = (fnCall: { name: string; args: any }): { success: boolean; message: string; redirect?: { label: string; href: string }; proposal?: any } => {
    const store = useStore.getState();

    // Run Guardrail Verification
    const validation = validateToolCall(fnCall.name, fnCall.args);
    if (!validation.valid) {
      useStore.setState({ pet: { ...useStore.getState().pet, animation: "angry" } });
      return {
        success: false,
        message: `🛡️ [Guardrail Alert] ${validation.error}`,
      };
    }

    try {
      switch (fnCall.name) {
        case 'createSavingsPocket': {
          const deposit = fnCall.args.deposit || 0;
          const mode = fnCall.args.mode || 'savings';
          const riskLevel = mode === 'growth' ? 'medium' : 'low';
          store.setSaveTarget(fnCall.args.target.toString());
          store.setSaveDeposit(deposit.toString());
          useStore.setState({ pet: { ...useStore.getState().pet, animation: "happy" } });
          return {
            success: true,
            message: `I can help you set up the "${fnCall.args.name}" pocket with a target of RM ${fnCall.args.target}. Would you like to confirm this${deposit > 0 ? ` and make an initial deposit of RM ${deposit}` : ' with an initial deposit'}?`,
            proposal: { type: 'create_pocket', name: fnCall.args.name, target: fnCall.args.target, current: deposit, icon: '💰', mode, riskLevel }
          };
        }
        case 'addFundsToPocket': {
          const pocket = store.savingsPockets.find(p => p.name.toLowerCase().includes(fnCall.args.pocketName.toLowerCase()));
          if (!pocket) return { success: false, message: `I couldn't find a pocket named "${fnCall.args.pocketName}". Try listing your pockets first!` };
          store.addFundsToPocket(pocket.id, fnCall.args.amount);
          useStore.setState({ pet: { ...useStore.getState().pet, animation: "excited" } });
          return {
            success: true,
            message: `Successfully deposited RM ${fnCall.args.amount.toFixed(2)} into your ${pocket.name}!`,
            redirect: { label: 'Go to Savings', href: '/savings' },
            proposal: { type: 'add_funds', pocketId: pocket.id, pocketName: pocket.name, amount: fnCall.args.amount, icon: pocket.icon }
          };
        }
        case 'addTransaction': {
          const { title, amount, category } = fnCall.args;
          
          useStore.setState((s) => ({
            transactions: [
              {
                id: Math.random().toString(),
                title,
                amount: -Math.abs(amount), // Transactions are negative
                date: new Date().toISOString(),
                category: category || 'Other',
                type: 'expense',
                isSubscription: false
              },
              ...s.transactions
            ],
            user: {
              ...s.user,
              currentBalance: s.user.currentBalance - Math.abs(amount)
            }
          }));

          return {
            success: true,
            message: `Recorded your expense of RM ${amount.toFixed(2)} for ${title}. Your balance has been updated.`,
          };
        }
        case 'toggleSpendGuard': {
          const shouldEnable = fnCall.args.enable;
          if (shouldEnable !== store.isSpendGuardActive) store.toggleSpendGuard();
          useStore.setState({ pet: { ...useStore.getState().pet, animation: shouldEnable ? "happy" : "idle" } });
          return { success: true, message: shouldEnable ? 'Spend Guard is now ON.' : 'Spend Guard is now OFF.' };
        }
        default: return { success: false, message: `Unknown function: ${fnCall.name}` };
      }
    } catch (error: any) {
      useStore.setState({ pet: { ...useStore.getState().pet, animation: "angry" } });
      return { success: false, message: `Action blocked: ${error.message}` };
    }
  };

  const logChat = (agentId: string, message: string, response: string, functionCalled?: string) => {
    fetch('/api/chat/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_name: user.name, agent_id: agentId, message, response, function_called: functionCalled || null }),
    }).catch(() => {});
  };

  const buildAIContext = () => {
    const store = useStore.getState();
    const spending = analyzeSpending(store.transactions);
    const topCategories = spending.slice(0, 3).map(s => `${s.category} (RM ${s.total})`).join(", ");
    const billStatus = analyzeBills(store.bills.filter(b => b.status !== 'paid'));
    const billCoverage = checkBillCoverage(store.user.currentBalance, billStatus);
    const urgentBills = billStatus.filter(b => b.status === 'urgent').length;
    
    // Sprint 5: Subscriptions & DTI
    const subscriptions = detectSubscriptions(store.transactions);
    const monthlyIncome = store.user.monthlyIncome; 
    const totalMonthlyBills = store.bills.reduce((sum, b) => sum + b.amount, 0);
    const dtiRatio = Math.round((totalMonthlyBills / monthlyIncome) * 100);

    return {
      balance: store.user.currentBalance,
      safeDailySpend: store.safeDailySpend,
      nextGenScore: store.nextGenScore,
      isSpendGuardActive: store.isSpendGuardActive,
      savingsPockets: store.savingsPockets.map(p => ({ name: p.name, current: p.current, target: p.target })),
      recentSpending: topCategories || "No recent spending",
      urgentBillsCount: urgentBills,
      canCoverUpcomingBills: billCoverage.canCover,
      subscriptionsDetected: subscriptions.length > 0 ? subscriptions : "None",
      dtiRatio: `${dtiRatio}% (Income: RM ${monthlyIncome})`,
    };
  };

  const handleAction = async (action: ChatAction) => {
    haptic.light();
    if (action.type === 'follow_up') {
      // Clear the actions from the previous message so they disappear when clicked
      setMessages(prev => prev.map(m => ({ ...m, actions: undefined })));
      sendMessage(action.label);
      return;
    }

    if (isExecuting) return;
    setIsExecuting(true);

    if (action.type !== 'simulate_affordability') {
      setMessages(prev => [
        ...prev.map(m => ({ ...m, actions: undefined })),
        { timestamp: new Date().toISOString(), role: 'user', content: action.label }
      ]);
    }

    await new Promise(resolve => setTimeout(resolve, 2000));

    let responseText = "";
    let redirect: { href: string; label: string } | undefined;
    let proposal: any = undefined;
    let deduction: number | undefined = undefined;

    switch (action.type) {
      case 'create_pocket':
        try {
          const store = useStore.getState();
          const depositVal = parseFloat(store.saveDeposit) || 0;
          const oldBalance = store.user.currentBalance;
          addSavingsPocket({
            id: Math.random().toString(36).substring(2, 11),
            name: action.payload.name,
            target: action.payload.target,
            current: depositVal,
            icon: action.payload.icon || '💰',
            mode: action.payload.mode || 'savings',
            riskLevel: action.payload.riskLevel
          });
          setMessages(prev => {
            const next = [...prev];
            let lastIdx = -1;
            for (let k = next.length - 1; k >= 0; k--) {
              if (next[k].proposal?.type === 'create_pocket') {
                next[k].proposal = { ...next[k].proposal, current: depositVal };
                lastIdx = k;
                break;
              }
            }
            if (lastIdx > -1) next.splice(lastIdx, 1);
            return next;
          });
          responseText = `Done! I've created your "${action.payload.name}" pocket with a target of RM ${action.payload.target}. Track it in the Savings tab!`;
          if (depositVal > 0) {
            deduction = oldBalance;
          }
          setUndoToast({
            message: "Pocket created",
            onUndo: () => {
              useStore.setState(s => ({ savingsPockets: s.savingsPockets.slice(0, -1) }));
              setUndoToast(null);
            }
          });
          setTimeout(() => setUndoToast(null), 4000);
          store.setSaveTarget(""); store.setSaveDeposit("");
          redirect = { label: "View Pockets", href: "/savings" };
          useStore.setState({ pet: { ...useStore.getState().pet, animation: "excited" } });
        } catch (error: any) {
          responseText = `Warning: ${error.message}`;
          useStore.setState({ pet: { ...useStore.getState().pet, animation: "angry" } });
        }
        break;
      case 'add_funds':
        try {
          const oldState = useStore.getState();
          const todayStr = new Date().toDateString();
          const todayExpenses = oldState.transactions.filter(t => t.type === 'expense' && new Date(t.date).toDateString() === todayStr).reduce((sum, t) => sum + t.amount, 0);
          const oldBalance = oldState.user.currentBalance;
          const oldQuota = oldState.initialSafeDaily - todayExpenses;
          const oldSafeDaily = oldState.safeDailySpend;

          const amt = action.payload.amount;
          useStore.getState().addFundsToPocket(action.payload.pocketId, amt);
          const newState = useStore.getState();
          const newSafeDaily = newState.calculateDailyLimitForBalance(newState.user.currentBalance);
          const newQuota = newState.initialSafeDaily - todayExpenses;

          responseText = `I've moved RM ${amt.toFixed(2)} to ${action.payload.pocketName}. You're making great progress!`;
        setUndoToast({
          message: `Added RM ${amt.toFixed(2)}`,
          onUndo: () => {
             // Reverse the transaction and pocket addition
             useStore.setState(s => {
               const pIdx = s.savingsPockets.findIndex(p => p.id === action.payload.pocketId);
               if (pIdx > -1) {
                 const newPockets = [...s.savingsPockets];
                 newPockets[pIdx].current -= amt;
                 return {
                   user: { ...s.user, currentBalance: s.user.currentBalance + amt },
                   savingsPockets: newPockets
                 };
               }
               return s;
             });
             setUndoToast(null);
          }
        });
        setTimeout(() => setUndoToast(null), 4000);
          proposal = { type: 'deposit_summary', amount: action.payload.amount, before: { balance: oldBalance, quota: oldQuota, safeDaily: oldSafeDaily }, after: { balance: newState.user.currentBalance, quota: newQuota, safeDaily: newSafeDaily } };
          useStore.setState({ pet: { ...useStore.getState().pet, animation: "excited" } });
          redirect = { label: "Go to Savings", href: "/savings" };

          setMessages(prev => [...prev, { timestamp: new Date().toISOString(), role: 'assistant', agent: 'Savings Sentinel', content: responseText, proposal, redirect }]);
          setIsExecuting(true);

          setTimeout(() => {
            const pocket = useStore.getState().savingsPockets.find(p => p.id === action.payload.pocketId);
            if (!pocket) { setIsExecuting(false); return; }
            const remaining = pocket.target - pocket.current;
            if (remaining <= 0) {
              setMessages(prev => [...prev, { timestamp: new Date().toISOString(), role: 'assistant', agent: 'Finance Strategist', content: `Incredible! You've successfully hit your target!` }]);
              setIsExecuting(false); return;
            }
            
            const store = useStore.getState();
            const projection = calculateSavingsVelocity(pocket.id, store.transactions, pocket.current, pocket.target);
            
            let daily = remaining / 90; // Fallback
            let date = new Date(); date.setDate(date.getDate() + 90);
            
            if (projection.avgDailySavings > 0 && projection.projectedDate) {
              daily = projection.avgDailySavings;
              date = projection.projectedDate;
            }
            
            const weekly = daily * 7;
            const monthly = daily * 30;
            
            setMessages(prev => [...prev, {
              timestamp: new Date().toISOString(),
              role: 'assistant',
              agent: 'Finance Strategist',
              content: projection.avgDailySavings > 0 ? `Based on your recent savings pace, here is your projection.` : `Great job! I've calculated a structured plan.`,
              proposal: { type: 'strategist_goal_planner', daily, weekly, monthly, targetDate: date.toLocaleDateString('en-MY'), pocketName: pocket.name, remaining, basedOnHistory: projection.avgDailySavings > 0 }
            }]);
            setIsExecuting(false);
          }, 2000);
          return;
        } catch (error: any) {
          responseText = `Warning: ${error.message}`;
          useStore.setState({ pet: { ...useStore.getState().pet, animation: "angry" } });
        }
        break;
      case 'check_bills': {
        const storeState = useStore.getState();
        const urgentBillsList = storeState.bills.filter(b => b.status !== 'paid');

        const totalAmount = urgentBillsList.reduce((sum, b) => sum + b.amount, 0);

        responseText = `Here are your upcoming bills. The total amount is RM ${totalAmount.toFixed(2)}. Would you like to make a payment now?`;
        
        setMessages(prev => [
          ...prev,
          {
            timestamp: new Date().toISOString(),
            role: 'assistant',
            agent: 'Commitment Shield',
            content: responseText,
            proposal: {
              type: 'check_bills_list',
              bills: urgentBillsList,
              totalAmount
            }
          }
        ]);
        haptic.success();
        setIsExecuting(false);
        return;
      }
      case 'pay_bill': {
        try {
          const storeState = useStore.getState();
          const billId = action.payload.billId;
          const bill = storeState.bills.find(b => b.id === billId);
          if (!bill) {
            throw new Error("Bill not found.");
          }
          if (bill.status === 'needs_setup') {
            throw new Error(`The bill "${bill.name}" requires setup (account/reference number) before you can pay it.`);
          }

          if (storeState.user.currentBalance < bill.amount) {
            throw new Error(`Insufficient balance to pay this bill (Need RM ${bill.amount.toFixed(2)}, Balance is RM ${storeState.user.currentBalance.toFixed(2)}).`);
          }

          storeState.payBillNow(billId);

          responseText = `Done! I've paid RM ${bill.amount.toFixed(2)} for your ${bill.name} bill. Your new balance is RM ${useStore.getState().user.currentBalance.toFixed(2)}.`;
          
          setMessages(prev => [
            ...prev,
            {
              timestamp: new Date().toISOString(),
              role: 'assistant',
              agent: 'Commitment Shield',
              content: responseText
            }
          ]);
          haptic.success();
          setIsExecuting(false);
          return;
        } catch (error: any) {
          responseText = `Warning: ${error.message}`;
          useStore.setState({ pet: { ...useStore.getState().pet, animation: "angry" } });
          setMessages(prev => [
            ...prev,
            {
              timestamp: new Date().toISOString(),
              role: 'assistant',
              agent: 'Commitment Shield',
              content: responseText
            }
          ]);
          setIsExecuting(false);
          return;
        }
      }
      case 'setup_bill_prompt': {
        const storeState = useStore.getState();
        const billId = action.payload.billId;
        const bill = storeState.bills.find(b => b.id === billId);
        if (!bill) {
          responseText = "Warning: Bill not found.";
          setIsExecuting(false);
          return;
        }

        responseText = `Let's complete the setup for **${bill.name}** first so you can enable AutoPay and safely pay it. Please enter the Account / Reference Number:`;
        setMessages(prev => [
          ...prev,
          {
            timestamp: new Date().toISOString(),
            role: 'assistant',
            agent: 'Commitment Shield',
            content: responseText,
            proposal: {
              type: 'setup_bill_form',
              bill
            }
          }
        ]);
        haptic.success();
        setIsExecuting(false);
        return;
      }
      case 'save_setup_and_pay': {
        try {
          const storeState = useStore.getState();
          const billId = action.payload.billId;
          const setupData = action.payload.setupData || {};
          const bill = storeState.bills.find(b => b.id === billId);
          if (!bill) {
            throw new Error("Bill not found.");
          }

          // Check if any fields in setupData are empty
          const missingFields: string[] = [];
          Object.entries(setupData).forEach(([key, val]) => {
            if (typeof val === 'string' && val.trim() === '') {
              missingFields.push(key);
            }
          });

          if (missingFields.length > 0) {
            throw new Error("All setup fields are required. Please fill in all fields.");
          }

          // Determine name and amount updates
          let updatedName = bill.name;
          let updatedAmount = bill.amount;
          
          if (setupData.provider) {
            const isPrepaid = (bill.category === 'prepaid_topup' || bill.name.toLowerCase().includes('prepaid'));
            updatedName = `${setupData.provider} ${isPrepaid ? 'Prepaid' : 'Postpaid'}`;
          }
          if (setupData.amount) {
            updatedAmount = parseFloat(setupData.amount) || bill.amount;
          }

          // Update the bill in Zustand store
          useStore.setState(state => ({
            bills: state.bills.map(b => b.id === billId ? {
              ...b,
              name: updatedName,
              amount: updatedAmount,
              accountNumber: setupData.accountNumber || b.accountNumber || setupData.referenceNumber,
              referenceNumber: setupData.referenceNumber || b.referenceNumber,
              billerCode: setupData.billerCode || b.billerCode,
              bankName: setupData.bankName || b.bankName,
              recipientName: setupData.recipientName || b.recipientName,
              provider: setupData.provider || b.provider,
              productType: setupData.productType || b.productType,
              passType: setupData.passType || b.passType,
              vehicleLabel: setupData.vehicleLabel || b.vehicleLabel,
              serviceName: setupData.serviceName || b.serviceName,
              planName: setupData.planName || b.planName,
              accountEmail: setupData.accountEmail || b.accountEmail,
              paymentSourceLabel: setupData.paymentSourceLabel || b.paymentSourceLabel,
              tngCardNickname: setupData.tngCardNickname || b.tngCardNickname,
              tngCardLast4: setupData.tngCardLast4 || b.tngCardLast4,
              ref1: setupData.ref1 || b.ref1,
              ref2: setupData.ref2 || b.ref2,
              status: 'upcoming',
              isLocked: true,
              autopayEnabled: true
            } : b)
          }));

          // Trigger payBillNow
          const updatedBill = useStore.getState().bills.find(b => b.id === billId);
          if (!updatedBill) throw new Error("Failed to retrieve updated bill.");

          if (storeState.user.currentBalance < updatedBill.amount) {
            throw new Error(`Insufficient balance to pay this bill (Need RM ${updatedBill.amount.toFixed(2)}, Balance is RM ${storeState.user.currentBalance.toFixed(2)}).`);
          }

          storeState.payBillNow(billId);

          responseText = `Setup completed! Account information updated for **${updatedBill.name}** and AutoPay has been enabled. I've successfully locked your bill and paid RM ${updatedBill.amount.toFixed(2)} for ${updatedBill.name}.`;
          
          setMessages(prev => [
            ...prev,
            {
              timestamp: new Date().toISOString(),
              role: 'assistant',
              agent: 'Commitment Shield',
              content: responseText
            }
          ]);
          haptic.success();
          setIsExecuting(false);
          return;
        } catch (error: any) {
          responseText = `Warning: ${error.message}`;
          useStore.setState({ pet: { ...useStore.getState().pet, animation: "angry" } });
          setMessages(prev => [
            ...prev,
            {
              timestamp: new Date().toISOString(),
              role: 'assistant',
              agent: 'Commitment Shield',
              content: responseText
            }
          ]);
          setIsExecuting(false);
          return;
        }
      }
      case 'postpone':
        responseText = "Understood. I've moved this suggestion to the backlog.";
        break;
      case 'prioritize_emergency':
        responseText = "Smart move. Prioritizing your Emergency Fund will boost your NextGen Score.";
        redirect = { label: "Go to Savings", href: "/savings" };
        break;
      case 'transfer':
        try {
          const oldState = useStore.getState();
          const parsedAmount = parseFloat(action.payload.amount) || 0;
          
          if (parsedAmount > 500 && !action.payload.otpConfirmed) {
            responseText = `For your security, transfers over RM 500.00 require an OTP confirmation.`;
            proposal = { type: 'otp_verification', amount: parsedAmount, recipient: action.payload.recipient };
            useStore.setState({ pet: { ...useStore.getState().pet, animation: "think" } });
            break; // Stop and wait for OTP action
          }

          const nextSafeDaily = oldState.calculateDailyLimitForBalance(oldState.user.currentBalance - parsedAmount);

          if (nextSafeDaily < 10.0) throw new Error(`Transfer blocked. Safe daily spending would fall below RM 10.00.`);

          addTransaction({
            id: `txn-${Date.now()}`,
            title: `Transfer to ${action.payload.recipient}`,
            amount: parsedAmount,
            category: 'Transfer',
            date: new Date().toISOString(),
            type: 'expense',
            confidence: 1.0
          });
          responseText = `Transfer complete. RM ${parsedAmount.toFixed(2)} sent to ${action.payload.recipient}.`;
          redirect = { label: "View Transactions", href: "/transactions" };
          useStore.setState({ pet: { ...useStore.getState().pet, animation: "excited" } });
        } catch (error: any) {
          responseText = `Warning: ${error.message}`;
          useStore.setState({ pet: { ...useStore.getState().pet, animation: "angry" } });
        }
        break;
      case 'simulate_affordability':
        const store = useStore.getState();
        const item = store.affordItem || "this item";
        const priceVal = store.affordPrice;

        setMessages(prev => {
          const next = [...prev];
          for (let k = next.length - 1; k >= 0; k--) {
            if (next[k].proposal?.type === 'affordability') {
              next[k].proposal = { ...next[k].proposal, item, price: priceVal };
              break;
            }
          }
          return [...next.map(m => ({ ...m, actions: undefined })), { timestamp: new Date().toISOString(), role: 'user', content: `Checking if I can afford ${item} for RM ${priceVal}` }];
        });

        await new Promise(resolve => setTimeout(resolve, 1500));

        const p = parseFloat(priceVal);
        const impact = p / 14;
        const newDailySpend = safeDailySpend - impact;
        let recommendation = "Safe";
        if (newDailySpend < 5) recommendation = "Avoid";
        else if (newDailySpend < 12) recommendation = "Caution";

        const budgetLimit = user.currentBalance * 0.3;
        const isRisky = recommendation === "Avoid" || recommendation === "Caution";
        
        let adviceSummary = "";
        if (recommendation === "Avoid") adviceSummary = `At RM ${p.toLocaleString()}, this is well above the safe threshold.`;
        else if (recommendation === "Caution") adviceSummary = `This is within reach, but will tighten your budget.`;
        else adviceSummary = `Great news — this fits comfortably within your budget.`;

        const analysisResult = { item, price: p, impact: impact.toFixed(2), newDailySpend: Math.max(0, newDailySpend).toFixed(2), recommendation, debtRiskImpact: (p / 20).toFixed(0), adviceSummary };

        setMessages(prev => [...prev, { timestamp: new Date().toISOString(), role: 'assistant', agent: 'Commitment Shield', content: isRisky ? `This exceeds your safety threshold.` : `Looks good!`, proposal: { type: 'affordability_result', ...analysisResult } }]);

        if (isRisky) {
          try {
            const altRes = await fetch('/api/chat/alternatives', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ item, budgetLimit })
            });
            const altData = await altRes.json();
            let alternatives = altData.alternatives || [];
            
            // Fix image paths
            alternatives = alternatives.map((alt: any) => ({
              ...alt,
              image: alt.image.startsWith('/') ? `${basePath}${alt.image}` : alt.image
            }));

            store.setSelectedPlatform(null);
            setMessages(prev => [...prev, { timestamp: new Date().toISOString(), role: 'assistant', agent: 'Finance Strategist', content: alternatives.length > 0 ? `I've sourced alternatives that fit your budget:` : `Hold off on this purchase.`, proposal: alternatives.length > 0 ? { type: 'strategist_alternative', alternatives, budgetLimit: budgetLimit.toFixed(0) } : undefined }]);
            haptic.success();
          } catch (e) {
             setMessages(prev => [...prev, { timestamp: new Date().toISOString(), role: 'assistant', agent: 'Finance Strategist', content: `Hold off on this purchase.` }]);
          }
        } else {
          haptic.success();
        }
        store.setAffordItem(""); store.setAffordPrice(""); setIsExecuting(false);
        return;
    }
    setMessages(prev => [...prev, { timestamp: new Date().toISOString(), role: 'assistant', agent: action.type === 'transfer' ? 'Finance Strategist' : 'Savings Sentinel', content: responseText, redirect, proposal, deduction }]);
    haptic.success();
    setIsExecuting(false);
  };

  const sendMessage = async (overrideText?: string) => {
    const textToSubmit = (overrideText || input).trim();
    if (!textToSubmit || isThinking) return;

    haptic.light();
    
    const lower = textToSubmit.toLowerCase();

    // 1.1c Fast-path rule override for deterministic commands
    if (lower === "what's my balance?" || lower === "balance" || lower.includes("baki")) {
      setMessages(prev => [...prev, { timestamp: new Date().toISOString(), role: 'user', content: textToSubmit }]);
      if (!overrideText) setInput("");
      setTimeout(() => {
        setMessages(prev => [...prev, {
          timestamp: new Date().toISOString(),
          role: 'assistant', agent: 'Finance Strategist',
          content: `Your current balance is RM ${user.currentBalance.toFixed(2)}.`,
          structured: { headline: "Balance Update", status: "good", insight: "You are on track.", metric: { label: "Balance", value: `RM ${user.currentBalance.toFixed(2)}`, trend: "flat" } }
        }]);
      }, 500);
      return;
    }
    
    if (lower.includes("spend guard on")) {
      useStore.getState().toggleSpendGuard();
      setMessages(prev => [...prev, { timestamp: new Date().toISOString(), role: 'user', content: textToSubmit }, { timestamp: new Date().toISOString(), role: 'assistant', agent: 'Commitment Shield', content: "Spend Guard is now ON." }]);
      setUndoToast({
        message: "Spend Guard turned ON",
        onUndo: () => {
          useStore.getState().toggleSpendGuard();
          setUndoToast(null);
        }
      });
      setTimeout(() => setUndoToast(null), 4000);
      if (!overrideText) setInput("");
      return;
    }

    if (lower.includes("show my pockets") || lower.includes("list pockets")) {
      setMessages(prev => [...prev, { timestamp: new Date().toISOString(), role: 'user', content: textToSubmit }, { timestamp: new Date().toISOString(), role: 'assistant', agent: 'Savings Sentinel', content: `You have ${savingsPockets.length} pockets:`, proposal: { type: 'list_pockets' } }]);
      if (!overrideText) setInput("");
      return;
    }

    setMessages(prev => [...prev, { timestamp: new Date().toISOString(), role: 'user', content: textToSubmit }]);
    if (!overrideText) setInput("");
    setIsThinking(true);
    useStore.setState({ pet: { ...useStore.getState().pet, animation: "think" } });

    try {
      // 1.1b Classify intent
      const classifyRes = await fetch('/api/chat/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSubmit })
      });
      const classifyData = await classifyRes.json();
      const intent = classifyData.intent || 'general_finance';

      // 1.2b Pass history (last 5 messages)
      const history = messages.slice(-5).map(m => ({
        role: m.role,
        content: m.content
      }));

      // Agent mapping based on intent
      let agentId = 'finance';
      let agentName = 'Finance Strategist';
      let taskType: string | null = null;
      let nextAnim = "idle";

      if (intent === 'savings') { agentId = 'save'; agentName = 'Savings Sentinel'; taskType = 'create_pocket'; nextAnim = "happy"; }
      else if (intent === 'debt' || intent === 'bills') { agentId = 'debt'; agentName = 'Commitment Shield'; taskType = 'affordability'; nextAnim = "blink"; }
      else if (intent === 'invest') { agentId = 'invest'; agentName = 'Growth Guru'; nextAnim = "excited"; }
      else if (intent === 'transfer') { agentId = 'finance'; agentName = 'Finance Strategist'; taskType = 'transfer'; nextAnim = "think"; }

      setActiveAgent(agentName);
      const responses: Message[] = [];

      // Clean up previous unsubmitted proposals of the same task type
      if (taskType) {
        setMessages(prev => {
          let baseMessages = [...prev];
          const unsubmittedIndices = new Set<number>();
          baseMessages.forEach((msg, idx) => {
            if (msg.proposal?.type === taskType && (msg.actions || !msg.proposal?.item)) {
              unsubmittedIndices.add(idx);
              if (idx > 0 && baseMessages[idx - 1].role === 'user') unsubmittedIndices.add(idx - 1);
            }
          });
          return baseMessages.filter((_, idx) => !unsubmittedIndices.has(idx));
        });
      }

      if (intent === 'transfer') {
        const transferDetails = await parseTransferIntent(textToSubmit);
        
        if (transferDetails.recipient && transferDetails.amount) {
          const isUnknownBank = transferDetails.bank === 'Unknown Bank';
          responses.push({
            timestamp: new Date().toISOString(),
            role: 'assistant', agent: 'Finance Strategist', 
            content: isUnknownBank ? "I couldn't find this recipient in your contacts. Please verify before sending:" : "I've prepared a transfer proposal:",
            proposal: { 
              name: `Transfer to ${transferDetails.recipient}`, 
              type: 'transfer', 
              amount: transferDetails.amount, 
              recipient: transferDetails.recipient, 
              bank: transferDetails.bank, 
              icon: '💸' 
            },
            actions: [
              { id: 'approve', label: 'Approve & Send', type: 'transfer', payload: { amount: transferDetails.amount, recipient: transferDetails.recipient } }, 
              { id: 'postpone', label: 'Decline', type: 'postpone' }
            ]
          });
        } else {
           responses.push({
            timestamp: new Date().toISOString(),
            role: 'assistant', agent: 'Finance Strategist', 
            content: "Who would you like to transfer to, and how much?",
          });
        }
      } else {
        // Fast path for spending breakdown
        if (textToSubmit.includes("spend") && textToSubmit.includes("breakdown") || textToSubmit.includes("category")) {
          const spending = analyzeSpending(useStore.getState().transactions);
          responses.push({ timestamp: new Date().toISOString(), role: 'assistant', agent: 'Finance Strategist', content: `Here is your 30-day spending breakdown:`, proposal: { type: 'spending_breakdown', spending } });
          setMessages(prev => [...prev, ...responses]);
          setIsThinking(false);
          setActiveAgent(null);
          useStore.setState({ pet: { ...useStore.getState().pet, animation: nextAnim } });
          return;
        }

        // Fast path for bills
        if (textToSubmit.includes("bill") && textToSubmit.includes("due")) {
          const billStatus = analyzeBills(useStore.getState().bills.filter(b => b.status !== 'paid'));
          responses.push({ timestamp: new Date().toISOString(), role: 'assistant', agent: 'Commitment Shield', content: `Here are your upcoming bills:`, proposal: { type: 'bill_timeline', bills: billStatus } });
          setMessages(prev => [...prev, ...responses]);
          setIsThinking(false);
          setActiveAgent(null);
          useStore.setState({ pet: { ...useStore.getState().pet, animation: 'blink' } });
          return;
        }

        const res = await fetchWithRetry('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: textToSubmit, agentId, context: buildAIContext(), history })
        });
        const data = await res.json();
        
        if (data.fallback) {
           // Rule-based fallback if API has an error
           responses.push({ timestamp: new Date().toISOString(), role: 'assistant', agent: agentName, content: `Your balance is RM ${user.currentBalance.toFixed(2)} and your safe daily spend is RM ${safeDailySpend.toFixed(2)}. (Offline mode)` });
        } else if (data.functionCall) {
          const result = executeGeminiFunctionCall(data.functionCall);
          responses.push({ timestamp: new Date().toISOString(), role: 'assistant', agent: agentName, content: result.message, redirect: result.redirect, proposal: result.proposal });
          logChat(agentId, textToSubmit, result.message, data.functionCall.name);
        } else {
          let aiActions: ChatAction[] = [];
          if (data.structured?.followUps?.length) {
            aiActions = data.structured.followUps.map((q: string, i: number) => ({
              id: `followup_${i}_${Date.now()}`,
              label: q,
              type: 'follow_up'
            }));
          }
          responses.push({ 
            timestamp: new Date().toISOString(), 
            role: 'assistant', 
            agent: agentName, 
            content: data.reply || data.structured?.headline || "Got it.", 
            structured: data.structured, 
            isFallbackModel: data.isFallbackModel,
            actions: aiActions.length > 0 ? aiActions : undefined
          });
        }
      }

      setMessages(prev => [...prev, ...responses]);
      setIsThinking(false);
      setActiveAgent(null);
      useStore.setState({ pet: { ...useStore.getState().pet, animation: nextAnim } });
      
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { 
        timestamp: new Date().toISOString(), role: 'assistant', 
        agent: 'Finance Strategist', 
        content: `Your balance is RM ${user.currentBalance.toFixed(2)} and your safe daily spend is RM ${safeDailySpend.toFixed(2)}. (Offline fallback)`,
        actions: [{ id: 'retry', label: 'Retry API', type: 'postpone' }]
      }]);
      setIsThinking(false);
      setActiveAgent(null);
      useStore.setState({ pet: { ...useStore.getState().pet, animation: 'idle' } });
    }
  };

  const createSession = () => {
    if (typeof window === 'undefined') return;

    // Save current session first
    localStorage.setItem(`coach_messages_${currentSessionId}`, JSON.stringify(messages));

    const newId = Math.random().toString(36).substring(7);
    const newSession = {
      id: newId,
      title: `Sembang Baru / New Chat #${sessions.length + 1}`,
      createdAt: new Date().toISOString(),
      isUncommitted: true
    };

    // Clean current sessions list (remove uncommitted ones that don't have user messages)
    const currentSessionsList = JSON.parse(localStorage.getItem('coach_sessions') || '[]');
    const cleanedSessions = currentSessionsList.filter((s: any) => {
      if (s.id === currentSessionId) {
        return messages.some(m => m.role === 'user');
      }
      const savedMessages = localStorage.getItem(`coach_messages_${s.id}`);
      if (!savedMessages) return false;
      try {
        const parsed = JSON.parse(savedMessages);
        return Array.isArray(parsed) && parsed.some((m: any) => m.role === 'user');
      } catch (e) {
        return false;
      }
    });

    // Remove local storage for pruned sessions
    currentSessionsList.forEach((s: any) => {
      const stillExists = cleanedSessions.some((cs: any) => cs.id === s.id);
      if (!stillExists && s.id !== currentSessionId) {
        localStorage.removeItem(`coach_messages_${s.id}`);
      }
    });

    // If current session was pruned, wipe it
    const currentHasUserMsg = messages.some(m => m.role === 'user');
    if (!currentHasUserMsg && currentSessionId !== 'default') {
      localStorage.removeItem(`coach_messages_${currentSessionId}`);
    }

    const updatedSessions = [...cleanedSessions, newSession];
    setSessions(updatedSessions);

    // Save committed sessions list to localStorage (exclude the new uncommitted one)
    const committed = updatedSessions.filter((s: any) => !s.isUncommitted);
    localStorage.setItem('coach_sessions', JSON.stringify(committed));

    setCurrentSessionId(newId);
    localStorage.setItem('coach_current_session_id', newId);

    // Reset messages and trigger greeting
    setMessages([]);
    setIsLoaded(false);
    setTimeout(() => {
      triggerGreeting();
    }, 50);
  };

  const switchSession = (id: string) => {
    if (typeof window === 'undefined') return;

    // Save current session first
    localStorage.setItem(`coach_messages_${currentSessionId}`, JSON.stringify(messages));

    // Prune other empty sessions
    const currentSessionsList = JSON.parse(localStorage.getItem('coach_sessions') || '[]');
    const cleanedSessions = currentSessionsList.filter((s: any) => {
      if (s.id === id) return true; // Always keep target
      if (s.id === currentSessionId) {
        // Keep current session only if there is a user message
        return messages.some(m => m.role === 'user');
      }
      const savedMessages = localStorage.getItem(`coach_messages_${s.id}`);
      if (!savedMessages) return false;
      try {
        const parsed = JSON.parse(savedMessages);
        return Array.isArray(parsed) && parsed.some((m: any) => m.role === 'user');
      } catch (e) {
        return false;
      }
    });

    // Clean up empty messages from localStorage
    currentSessionsList.forEach((s: any) => {
      const stillExists = cleanedSessions.some((cs: any) => cs.id === s.id);
      if (!stillExists && s.id !== id) {
        localStorage.removeItem(`coach_messages_${s.id}`);
      }
    });

    // If current session was pruned, wipe it
    const currentHasUserMsg = messages.some(m => m.role === 'user');
    if (!currentHasUserMsg && currentSessionId !== 'default') {
      localStorage.removeItem(`coach_messages_${currentSessionId}`);
    }

    // Ensure at least one session remains
    if (cleanedSessions.length === 0) {
      cleanedSessions.push({ id: 'default', title: 'Sembang Utama / Main Chat', createdAt: new Date().toISOString() });
    }

    setSessions(cleanedSessions);
    
    // Save committed sessions list to localStorage (exclude the target session if it is uncommitted)
    const committed = cleanedSessions.filter((s: any) => !s.isUncommitted);
    localStorage.setItem('coach_sessions', JSON.stringify(committed));

    setCurrentSessionId(id);
    localStorage.setItem('coach_current_session_id', id);

    const savedMessages = localStorage.getItem(`coach_messages_${id}`);
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error(e);
        setMessages([]);
      }
    } else {
      setMessages([]);
      setIsLoaded(false);
      setTimeout(() => {
        triggerGreeting();
      }, 50);
    }
  };

  const deleteSession = (id: string) => {
    if (typeof window === 'undefined') return;

    const updatedSessions = sessions.filter(s => s.id !== id);
    localStorage.setItem('coach_sessions', JSON.stringify(updatedSessions));
    setSessions(updatedSessions);
    localStorage.removeItem(`coach_messages_${id}`);

    // If we deleted the current active session, switch to another
    if (currentSessionId === id) {
      const fallbackId = updatedSessions[0]?.id || 'default';
      if (updatedSessions.length === 0) {
        const defaultSession = { id: 'default', title: 'Sembang Utama / Main Chat', createdAt: new Date().toISOString() };
        setSessions([defaultSession]);
        localStorage.setItem('coach_sessions', JSON.stringify([defaultSession]));
      }
      switchSession(fallbackId);
    }
  };

  const renameSession = (id: string, newTitle: string) => {
    if (typeof window === 'undefined') return;

    const updatedSessions = sessions.map(s => s.id === id ? { ...s, title: newTitle } : s);
    setSessions(updatedSessions);
    localStorage.setItem('coach_sessions', JSON.stringify(updatedSessions));
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem(`coach_messages_${currentSessionId}`);
    if (currentSessionId === 'default') {
      localStorage.removeItem('coach_messages');
    }
    triggerGreeting();
  };

  return {
    messages,
    setMessages,
    input,
    setInput,
    isThinking,
    activeAgent,
    isExecuting,
    undoToast,
    setUndoToast,
    isListening,
    interimTranscript,
    toggleListening,
    handleAction,
    sendMessage,
    clearChat,
    sessions,
    currentSessionId,
    createSession,
    switchSession,
    deleteSession,
    renameSession
  };
}
