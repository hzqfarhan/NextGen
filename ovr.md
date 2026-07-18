# BeU NextGen — Core Functions Overview

**BeU NextGen** is an AI-powered youth finance app for Malaysian students and young adults. It answers one question: *“Can I afford this right now without hurting my future self?”*

It splits money into **what you have**, **what must be protected**, and **what you can safely spend**, then wraps that with gamification and a multi-agent AI coach.

---

## 1. Financial engine (Zustand store)

**File:** `src/store/useStore.ts`  
Client-side source of truth, persisted in IndexedDB (with localStorage fallback).

| Core function | What it does |
|---|---|
| **Safe Daily Spend** | `(balance − commitments − auto-save − default savings) / days left` → daily spendable limit. Supports fixed/weekly, lump-sum, and irregular income. |
| **`addTransaction`** | Logs expense/income/saving, updates balance, recalculates safe daily, optional round-up. |
| **`updateNextGenScore`** | Weighted health score: **50% cashflow**, **30% debt**, **20% savings**. |
| **Savings pockets** | Create/update/delete pockets; deposit funds; block if daily spend would fall below **RM 10** (survival protocol). |
| **Auto-save / Round-up** | Scheduled micro-saves; spare change to pockets on expenses. |
| **Growth simulation** | Daily compound on “growth” pockets (low/med/high risk rates; Legend tier gets +0.5%). |
| **Smart bills** | Lock, autopay, pay now; roll next due date; safety rules (strict / balanced / flexible). |
| **Streaks & tiers** | Daily RM 1 savings quota → streak; **Novice → Pro → Legend**; Streak Shield; prize-draw tickets; Financial Passport export. |
| **Companion pet** | Message + animation state reacting to saves, bills, overspend. |

Supporting helpers:

- `getDaysRemaining()` — days until next income cycle  
- `calculateDailyLimit()` — core budget math  
- `checkAndRefreshDailyQuota()` — daily reset + default micro-save to main goal  

---

## 2. Domain libraries (`src/lib/`)

| Module | Core functions |
|---|---|
| **`billEngine.ts`** | `calculateNextDueDate`, `isBillDue`, `isAutoPaySafe`, `maskAccountNumber` |
| **`billIntelligence.ts`** | Urgency ranking (urgent/upcoming/safe), bill coverage vs balance |
| **`billTemplates.ts`** | Malaysia-specific bill templates (rent, phone, PTPTN, streaming, TNG, petrol, etc.) |
| **`spendingAnalysis.ts`** | Category breakdown + subscription heuristic detection |
| **`savingsProjection.ts`** | Savings velocity → projected goal completion date |
| **`transferParser.ts`** | Regex + Gemini parse of “Pay RM50 to Sarah” → amount/recipient/bank |
| **`db.ts`** | PostgreSQL connection pool |
| **`indexedDbStorage.ts`** | Zustand persistence adapter |
| **`apiRetry.ts`** | `fetchWithRetry` for flaky network calls |
| **`translations.ts`** | EN / MS strings |
| **`utils.ts`** | `cn()` class merge + haptic vibration helpers |

---

## 3. AI Council (Gemini)

**Main route:** `POST /api/chat`

### Guards (before Gemini)
1. **Prompt-injection** detection  
2. **Off-topic** filter (blocks non-finance chat without burning tokens)

### Four agents

| Agent ID | Persona | Role |
|---|---|---|
| `finance` | Finance Strategist | Budget, Safe Daily, score |
| `save` | Savings Sentinel | Goals, pockets, cutting spend |
| `debt` | Commitment Shield | Bills, BNPL, loans |
| `invest` | Growth Guru | ASB, FD, EPF, roboadvisors |

### Response shape
Structured JSON cards: `headline`, `status`, `insight`, `lesson`, `metric`, `action` / `actionType`, `followUps` — plus dialect-aware Malay/Manglish.

### Function calling (tools)
- `createSavingsPocket`  
- `addFundsToPocket`  
- `toggleSpendGuard`  
- `addTransaction`  

### Related AI routes
| Route | Purpose |
|---|---|
| `/api/chat/classify` | Intent → savings / debt / invest / transfer / bills / balance |
| `/api/chat/alternatives` | Cheaper Shopee/Lazada alternatives under budget |
| `/api/chat/log` | Persist chat turns to `chat_logs` |

**Client orchestration:** `useCoachChat` + `Coach.tsx` — multi-session chat, voice (speech-to-text), local analysis, Gemini function execution.

---

## 4. Data persistence & sync

| Layer | Role |
|---|---|
| **IndexedDB** | Offline-first Zustand snapshot |
| **`StoreSyncHandler`** | Pull/merge on load; push on change |
| **`POST /api/sync`** | Full state upsert → `user_sync` + `users` + `savings` + `transfers` + `bills` |
| **CRUD APIs** | `/api/user`, `/api/savings`, `/api/transfers`, `/api/bills` |
| **Passcode** | Optional gate on sync GET (401 clears local state) |

PostgreSQL tables: `users`, `user_sync`, `savings`, `transfers`, `bills`, `chat_logs`.

---

## 5. Product surfaces (UI)

| Route | Component | Core job |
|---|---|---|
| `/` | Landing | Brand entry / onboarding start |
| `/setup` | Setup flow | Profile, allowance, income pattern, commitments |
| `/dashboard` | Dashboard | Balance, Safe Daily, score, streak, quick actions |
| `/coach` | Coach | AI chat + voice + structured cards |
| `/bills` | Bills | Smart Bill Lock CRUD, lock/autopay/pay |
| `/savings` | Savings | Goal pockets, deposits, growth mode |
| `/transfer` | Transfer | AI-assisted transfer + contact confidence match |
| `/scan` | Scanner | Impulse / affordability check (“can I buy this?”) |
| `/reports` | Reports | Recharts spend & progress insights |
| `/transactions` | Transactions | History list |
| `/cards` | Cards | Card hub mock |
| `/agents` | AgentCommandCenter | Council agent status board |
| `/settings` | Settings | Language, companion, prefs |
| `/diagnostics` | Diagnostics | DB latency, Gemini health, table explorer, ERD |

Shared shell: Navbar, Coach FAB + companion, splash, PWA service worker, global background.

---

## 6. Gamification & rewards

- **Streak engine** — meet RM 1/day savings (and/or stay under Safe Daily depending on flow)  
- **Tiers** — Novice (0–6) → Pro (7+) → Legend (30+)  
- **Unlocks** — companions (Uteh free; Zuko/Oreo Pro; Oyen/Yunn/Lico Legend)  
- **Reward Nest** — lock funds → prize-draw tickets (`moveFundsToRewardNest`)  
- **Streak Shield** — protect streak after share/referral-style actions  
- **Financial Passport** — export streak and rewards snapshot (`exportFinancialPassport`)  

---

## 7. End-to-end mental model

```text
Onboarding → Wallet + bills + income cycle in Zustand
     ↓
Every spend/save recalculates Safe Daily + NextGen Score
     ↓
Bills lock commitments; autopay uses safety rules
     ↓
AI Coach answers with structured cards / runs tools
     ↓
Streaks & tiers reward discipline; companion reacts
     ↓
StoreSyncHandler persists to PostgreSQL when online
```

---

## Stack (actual in repo)

- **Next.js 16** App Router, **React 19**, **TypeScript**  
- **Zustand** + IndexedDB, **Tailwind 4**, **Framer Motion**, **Recharts**  
- **Google Gemini** (REST), **PostgreSQL** via `pg`  
- Dev server: **port 2221**

---

## Bottom line

The **core** of NextGen is not “another bank UI.” It is a **client-side financial OS** that:

1. **Computes** what is safe to spend  
2. **Protects** commitments (bills)  
3. **Coaches** via specialized Gemini agents with tool actions  
4. **Gamifies** habits (streaks, tiers, companion)  
5. **Syncs** that state to the cloud when available  

Everything else (scanner, transfer match, diagnostics, share cards) is a product surface on top of that engine.
