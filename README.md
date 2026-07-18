<div align="center">
  <img src="public/assets/NEXTGEN.png" alt="BeU NextGen Logo" width="220" style="border-radius: 1.5rem; margin-bottom: 1rem; box-shadow: 0 10px 30px rgba(223,0,89,0.15);" />
  
  # BeU NextGen
  
  <h3><strong>AI-powered financial companion for youth money habits</strong></h3>
  <p>Theme: <em>"Future of Money: Reimagine Finance with AI"</em></p>
</div>

---

## Problem Statement

Students and young adults see one balance number and mentally guess what is safe to spend. That hides rent, bills, transport, food, savings goals, and end-of-month pressure inside the same number — causing overspending, missed commitments, and financial anxiety.

## Our Solution

BeU NextGen separates money into **what the user has**, **what must be protected**, and **what can be safely spent**. The NextGen AI Council turns risky money moments into quick, understandable decisions with a local Malaysian voice and practical next steps.

> Core question: *"Can I afford this right now without hurting my future self?"*

---

## Key Features

| Feature | Description |
|---|---|
| **Safe Daily Spend** | Computed safe budget per day based on balance, bills, and days remaining |
| **Smart Bill Lock** | Auto-protects recurring commitments — rent, phone, PTPTN, subscriptions |
| **NextGen Score** | 0–100 financial health score updated in real-time |
| **NextGen AI Council** | 4 Gemini-powered AI agents — Finance Strategist, Savings Sentinel, Commitment Shield, Growth Guru |
| **Structured AI Responses** | AI returns a JSON card (headline, status, insight, metric, CTA) instead of long paragraphs |
| **AI Topic Guard** | Off-topic messages are rejected instantly without calling the AI model |
| **Savings Hub** | Goal-based savings pockets with progress tracking and AI coaching |
| **Transfer with AI Match** | AI-suggested transfers with 95%+ confidence matching from transaction history |
| **Pay Scanner** | QR-style spend risk evaluator with Impulse Negotiator |
| **Roast & Toast Engine** | Malay dialect AI feedback on spending habits |
| **NextGen Companion** | 6 unlockable animated companions (Uteh, Zuko, Oreo, Oyen, Yunn, Lico) |
| **Membership Tiers** | Novice → Pro → Legend with unlockable features and companions |
| **Streak & Rewards** | Daily streak tracking, Streak Shield, prize-draw tickets |
| **Diagnostics Panel** | Real-time system health — DB latency, Gemini API status, ERD schema map |
| **Voice Assistant** | Speech-to-text financial queries with animated orb UI |
| **PWA Ready** | Installable on iOS/Android, manifest configured |

---

## Core Feature Showcase (Pitch Video Add-ons)

These additional high-fidelity features were successfully implemented in the functional prototype but were omitted from the 8-minute pitch video due to time constraints:

| Interface / Feature | Detailed System Capabilities & Pitch Video Explanations |
| :---: | --- |
| <img src="public/assets/git-img/main dashboard.PNG" width="360" alt="Main Dashboard" /> | **1. Core Financial Command Center (Main Dashboard)**<br><br>• **Safe Daily Spend Calculation:** Instantly calculates exactly what is safe to spend per day, protecting future bill locks and savings pockets.<br>• **Unified Visual Indicators:** Tracks streaks, membership progress, and real-time financial health without the user having to guess.<br>• **Quick Action Center:** Integrates QR scanner, rapid transfers, and smart bill management in one screen.<br><br>👉 **🌟 Key User Benefit:** **Eliminates the "Mental Math" Trap!** Never guess if you can afford lunch; your exact spendable balance is visible instantly, saving you from end-of-month panic! |
| <img src="public/assets/git-img/smartbill.jpg" width="360" alt="Smart Bill Lock" /> | **2. Smart Bill Lock (Commitment Shield)**<br><br>• **Auto-Shield Subscriptions:** Dynamically locks funds for recurring utility bills, student loans (PTPTN), or standard subscriptions.<br>• **Protected Wallet Slices:** Locked funds are subtracted from the spendable balance and visually isolated in a beautiful vault card interface.<br>• **Visual Progression Trackers:** Shows due dates, lock status, and historical lock completion records.<br><br>👉 **🛡️ Key User Benefit:** **Zero-Effort Commitment Protection!** Automatically guarantees you never accidentally spend your rent or phone bill money. |
| <img src="public/assets/git-img/companion.jpg" width="360" alt="Companion System" /> | **3. Gamified NextGen Companion System**<br><br>• **Interactive Avatars:** 6 animated virtual companions (including Oyen, Zuko, Oreo, Yunn) matching the user's financial habits.<br>• **Tier-Gated Unlocks:** Encourages sound savings disciplines by unlocking higher-status companions at Pro and Legend tiers.<br>• **Micro-Roasts & Prompts:** The companion serves as the reactive visual frontend of the multi-agent AI Council, cheering or roasting user decisions.<br><br>👉 **🤝 Key User Benefit:** **Finance Made Addictive!** Turns money management into a cute game—encouraging healthy savings habits through customizable companions that roast your bad spends and celebrate your savings! |
| <img src="public/assets/git-img/insights.jpg" width="360" alt="Dynamic Insights" /> | **4. Recharts Advanced Spending Insights**<br><br>• **High-Contrast Data Visuals:** Modern custom light-mode analytics showing spending trends and weekly fluctuations.<br>• **Categorized Spend Breakdown:** Color-coded categorical Recharts grids highlighting dynamic budget deviations and savings allocations.<br>• **Streak Metrics:** Visualized progression of habit streak consistency and gamified scores.<br><br>👉 **📊 Key User Benefit:** **Spot Hidden Money Leaks Instantly!** Beautiful high-contrast visual charts pinpoint exactly where your funds are slipping away, so you can optimize budgets with absolute clarity. |
| <img src="public/assets/git-img/voicemode.jpg" width="360" alt="Voice Assistant UI" /> | **5. Smart Voice Assistant Mode**<br><br>• **Speech-to-Text Processing:** Low-latency localized voice input matching the Malaysian accent and financial context.<br>• **Interactive Visual Aura:** Floating glowing gradient orb animations syncing real-time voice capture states.<br>• **Hands-Free AI Council Queries:** Quick vocal prompts like *"Can I afford bubble tea today?"* instantly yield structured JSON feedback.<br><br>👉 **🎙️ Key User Benefit:** **Vocalize Your Financial Queries!** Skip the typing and speak naturally—ask the AI Council complex questions on-the-go and get visual cards instantly. |
| <img src="public/assets/git-img/sharestreak.jpg" width="360" alt="Streak Sharing & Rewards" /> | **6. Social Streak Sharing & Rewards**<br><br>• **Viral Malaysian Themes:** Shareable streak generation badges supporting custom backgrounds (WhatsApp, Telegram, IG Stories).<br>• **Prize Draw Gating:** Unlocks free raffle tickets from streak achievements.<br>• **Streak Shield Protection:** Gamified shields preventing streak breaks during emergency spend periods.<br><br>👉 **🎁 Key User Benefit:** **Get Rewarded for Discipline!** Turn consistency into real-world value—share your progress with beautiful designs, use Streak Shields, and earn prize-draw tickets! |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| UI Runtime | React 18 |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| State | Zustand |
| Charts | Recharts |
| Icons | Lucide React |
| AI Model | Google Gemini 3.1 Flash Lite |
| Database | PostgreSQL (IPONESERVER — NovaCloud) |

---

## System Architecture & Data Flow

BeU NextGen is built on a highly resilient, modern web stack featuring real-time client-state sync, relational database persistence, and a multi-agent AI framework. Below is the comprehensive high-level system mapping.

### High-Level Architecture Diagram

<div align="center">
  <img src="public/assets/git-img/systemarchitecture.png" alt="System Architecture Diagram" width="700" style="border-radius: 1rem; border: 1px solid #E5E7EB; box-shadow: 0 4px 20px rgba(0,0,0,0.05); margin-bottom: 1.5rem;" />
</div>

```text
┌────────────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser / PWA)                         │
│                                                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │  Dashboard   │  │  Coach (AI)  │  │  Bills/Save  │  ...pages        │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                  │
│         │                 │                  │                         │
│         └─────────────────┴──────────────────┘                         │
│                           │                                            │
│                    ┌──────▼──────┐                                     │
│                    │  Zustand    │  ← Global financial state           │
│                    │  useStore   │    (wallet, score, bills, pockets)  │
│                    └──────┬──────┘                                     │
│                           │                                            │
│                    ┌──────▼──────┐                                     │
│                    │StoreSyncHndl│  ← Watches state & triggers sync    │
│                    └─────────────┘                                     │
└───────────────────────────┬────────────────────────────────────────────┘
                            │ HTTPS Sync / Fetch Request
┌───────────────────────────▼────────────────────────────────────────────┐
│                      NEXT.JS API ROUTES (Serverless)                   │
│                                                                        │
│  POST /api/chat          → Gemini AI multi-agent coaching              │
│  GET/POST /api/user      → Sync user profile to PostgreSQL             │
│  GET/POST /api/savings   → CRUD goal pockets                           │
│  GET/POST /api/transfers → CRUD transaction records                    │
│  GET/POST /api/bills     → CRUD smart bill locks                       │
│  GET /api/diagnostics/*  → Health checks (DB + Gemini latency)         │
│  POST /api/sync          → Bulk database state synchronization         │
└──────────────┬────────────────────────────┬────────────────────────────┘
               │                            │
    ┌──────────▼──────────┐      ┌──────────▼──────────┐
    │   Google Gemini AI  │      │  PostgreSQL Database │
    │  (REST API, Flash)  │      │   (IPONESERVER)     │
    │                     │      │                     │
    │  4 Agent Personas:  │      │  Tables:            │
    │  • Finance Strategist│      │  • users            │
    │  • Savings Sentinel │      │  • savings          │
    │  • Commitment Shield│      │  • transfers        │
    │  • Growth Guru      │      │  • bills            │
    │  └──────────────────┘      │  • chat_logs        │
    └─────────────────────┘      └─────────────────────┘
```

For the absolute complete low-level architectural specification including API request-response bodies, state slice definitions, and exact database schemas, please refer to the detailed [System Architecture Specification](docs/system_architecture.md).

---

### Core Architectural Pillars

#### 1. Real-Time Client-Database Sync Flow
* **Zustand State Engine (`src/store/useStore.ts`)**: Serves as the single-source-of-truth in-memory client database. Houses active wallet balances, streaks, smart bills, pockets, and gamified metrics.
* **Reactive Store Synchronization (`StoreSyncHandler`)**: A custom React component wrapper that listens to deep reactive changes within the Zustand store. Whenever a transaction, bill lock, or pocket update occurs locally, it automatically pushes delta updates to the server database via `/api/sync` or standard CRUD endpoints.
* **PostgreSQL Persistence**: Hosted on **IPONESERVER (NovaCloud)**, ensuring all simulated money movements, savings pockets, and user metrics persist across multiple login sessions, device reloads, or install cycles.

#### 2. Multi-Agent AI Council Framework
Rather than relying on a single general chatbot, BeU NextGen routes queries to the **AI Council**: a specialized team of 4 dedicated Gemini agents:
* 💼 **Finance Strategist (`finance`)**: Monopolizes daily spending budgets, NextGen financial health scores, and generic queries.
* 🎯 **Savings Sentinel (`save`)**: Custom goal pockets builder, micro-savings automation, and cutting costs.
* 🛡️ **Commitment Shield (`debt`)**: Smart Bill Lock coordinator, BNPL assessment, and loan/debt shield.
* 📈 **Growth Guru (`invest`)**: Long-term growth blueprints, unit trust explanations, and ASB analysis.

#### 3. Structured JSON Messaging & Topic Guard
* **Input-Topic Guard**: Prevents prompt injection and off-topic chat abuse. The system runs an instant local keyword check for financial context. If a user asks the AI to play games or write poems, the system triggers a localized, ultra-fast rejection without burning Gemini API quota tokens.
* **Strict Schema Outputs**: The server enforces a strict JSON output schema. The AI doesn't just blabber text; it returns `{ structured: { headline, status, insight, metric, cta } }` which translates into a custom dynamic visual card, or triggers a client-side execution call (e.g., automatically building a savings pocket on behalf of the user).

---

## Live System Diagnostics Panel (`/diagnostics`)

To guarantee transparency and verify platform resilience for hackathon judges, BeU NextGen includes a built-in **Diagnostics & Health Monitor** available at `http://localhost:2221/diagnostics` (or `/diagnostics` within the web app).

![System Diagnostics Overview](https://img.shields.io/badge/System-Healthy-49B9B3?style=for-the-badge&logo=postgresql)
![AI Connection](https://img.shields.io/badge/Gemini_AI-Online-DF0059?style=for-the-badge&logo=google-gemini)

<div align="center">
  <img src="public/assets/git-img/diagnostic.png" alt="Diagnostics Panel Showcase" width="700" style="border-radius: 1rem; border: 1px solid #E5E7EB; box-shadow: 0 4px 20px rgba(0,0,0,0.05); margin-top: 1rem; margin-bottom: 1.5rem;" />
</div>

This panel allows real-time execution testing and environment diagnostics of every core cloud integration:

### 1. Cloud Infrastructure Integration Checks
* **PostgreSQL Database Diagnostic**: Executes live ping commands to **IPONESERVER** to report connection latency (usually `< 15ms`), parses the server IP address safely, and validates that all 5 critical tables (`users`, `savings`, `transfers`, `bills`, `chat_logs`) exist and are queryable.
* **Google Gemini AI Diagnostic**: Sends a live test package payload directly to the Google Generative Language API. It verifies API key authenticity, tests parsing speeds, and outputs latency metrics alongside a live connection confirmation.

### 2. API Quota & Usage Monitor
Provides dynamic progress indicators showing real-time developer API usage against model thresholds:
* **RPM (Requests Per Minute)**: Tracks instant chat load spikes to prevent rate-limit throttling.
* **RPD (Requests Per Day)**: Monitors cumulative daily query volumes (e.g. up to 500 requests for `gemini-3.1-flash-lite`), helping manage server cost structures.

### 3. Dynamic SQL Database Explorer
A fully integrated, live explorer of relational table data directly inside the client dashboard. Judges can inspect:
* **`chat_logs`**: Review exact timestamped records of user prompts, raw Gemini structured card responses, and specific function calls triggered by the AI.
* **`users`**: See real-time balances, NextGen scores, and streaks updated by `StoreSyncHandler`.
* **`savings`, `transfers`, `bills`**: Inspect dynamic database entities as they are created or modified in real time.

### 4. Interactive ERD Schema Map 🗺️
A visual schematic showing the relational schema of our database. It highlights how the centralized `users` table links via 1-to-many (`1:N`) relationships (foreign keys) directly into the `savings`, `transfers`, `bills`, and `chat_logs` tables—offering clear proof of data engineering rigour.

<div align="center">
  <img src="public/assets/git-img/erd.png" alt="Database ERD Schema Map" width="700" style="border-radius: 1rem; border: 1px solid #E5E7EB; box-shadow: 0 4px 20px rgba(0,0,0,0.05); margin-top: 1rem; margin-bottom: 1.5rem;" />
</div>

---

### Page Architecture & Routes Map

| Route | Component File | Security / Rendering | Core Functionality |
|---|---|---|---|
| `/` | `Landing.tsx` | Client SSR | Splash screen, onboarding, brand introduction |
| `/setup` | `/setup/page.tsx` | Form Controller | Step-by-step financial profile setup (allowance, bill setup) |
| `/dashboard` | `Dashboard.tsx` | Dashboard Layout | Real-time Safe Daily Spend, NextGen Score, Quick Actions |
| `/coach` | `Coach.tsx` | Dynamic Chat PWA | Interactive voice and text chat interface with the AI Council |
| `/bills` | `Bills.tsx` | Smart Locks Grid | Interactive Smart Bill Lock management & lock/unlock flows |
| `/savings` | `Savings.tsx` | Progress Charts | Goal pockets, cash injections, risk/priority level configs |
| `/transfer` | `Transfer.tsx` | ML Search Form | Dynamic transactions, autocomplete, recipient confidence match |
| `/scan` | `Scanner.tsx` | Cam Mock / QR | QR scan input, Impulse Negotiator mode, spend impact roast |
| `/reports` | `Reports.tsx` | Recharts Visuals | Monthly expenditure charts, category breakdowns, savings progress |
| `/diagnostics`| `DiagnosticsPage` | Admin Console | Real-time system health logs, DB tables inspector, ERD map |
| `/settings` | `Settings.tsx` | Control Center | Theme selectors, language toggles (EN/MS), diagnostics hook |

---

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:2221`.

### Environment Variables

```bash
# Required for AI coaching
GEMINI_API_KEY=your_key_here

# Required for persistent database (hosted on IPONESERVER — NovaCloud)
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Optional
GEMINI_MODEL=gemini-3.1-flash-lite
NEXT_PUBLIC_BASE_PATH=
```

---

## Database Setup

Run DDL in order:

```sql
-- 1. users
-- 2. savings
-- 3. transfers
-- 4. bills
-- 5. chat_logs
```

See `/docs/system_architecture.md` for full schema.

---

## Demo Flow

1. Complete onboarding — set allowance, next allowance date, and commitments.
2. Open Dashboard — see Total Balance, Protected Commitments, Spendable Balance, Safe Daily Spend, and NextGen Score.
3. Visit Smart Bill Lock — confirm commitments are auto-protected.
4. Open AI Coach — ask "What is my Safe Daily Spend?" — see structured AI card response.
5. Try Pay Scanner — choose a risky demo purchase and watch Impulse Negotiator activate.
6. Visit Savings Hub — add funds to a goal pocket.
7. Try Transfer — use AI-suggested match for a recent contact.
8. Visit Diagnostics — verify DB connection, Gemini latency, and view the ERD Schema Map.

---

## AI Tools Used

| Tool | Usage |
|---|---|
| **Google Gemini 3.1 Flash Lite** | All AI coaching, structured JSON financial responses, function calling (createSavingsPocket, addFundsToPocket, toggleSpendGuard) |
| **Antigravity** | System architecture, component implementation, database schema, API routes, agent routing logic |

> All AI-generated code has been reviewed, tested, and understood by the team. We can walk through any part during Q&A.

---

## Libraries & Credits

| Library | Version | Purpose |
|---|---|---|
| `next` | 14 | App Router, PWA manifest, SSR |
| `react` | 18 | Component rendering |
| `zustand` | latest | Global financial state management |
| `framer-motion` | latest | Animations and transitions |
| `recharts` | latest | Spending and score charts |
| `lucide-react` | latest | Interface icons |
| `tailwindcss` | latest | Utility-first styling |
| `@google/generative-ai` | latest | Gemini AI integration |
| `pg` / `postgres` | latest | PostgreSQL client |

---

## Team / Acknowledgements

BeU NextGen is a prototype for youth financial wellness in Malaysia.

> This system uses a live PostgreSQL database for persistence but does not connect to real bank accounts. All balance and transaction data is for demonstration purposes.
