# BeU NextGen: Project Description & Product Specification

BeU NextGen is an AI-powered financial wellness platform designed for university students and young adults in Malaysia. Built on top of the Next.js App Router framework, it helps youth spend smarter, save better, and understand money through gamification and localized AI-driven coaching.

---

## 1. Executive Summary & Value Proposition

| Dimension | Details |
| :--- | :--- |
| **Project Name** | **BeU NextGen** |
| **Core Question** | *"Can I afford this right now without hurting my future self?"* |
| **Target Audience** | Malaysian university students and young adults (Gen Z). |
| **Core Problem** | Traditional finance apps present a single total balance. This hides upcoming bills, commitments, and savings goals, leading to mental guesswork and end-of-month financial stress. |
| **The Solution** | BeU NextGen separates money into what the user has, what must be protected (commitments), and what can be safely spent. It leverages gamified streaks, product-linked tiers, and localized AI coaches to build sustainable money habits. |

---

## 2. Core Feature & Mechanics Matrix

This table summarizes the core features of the system, including the current features and the newly proposed gamification additions.

| Feature Area | Component Name | Description & Mechanics | Strategic Value |
| :--- | :--- | :--- | :--- |
| **Financial Guardrails** | **Safe Daily Spend** | Dynamically calculates the exact spendable limit per day based on allowance, days remaining in the cycle, and locked commitments. | Replaces mental budget guesswork with a clear, active daily limit. |
| | **Smart Bill Lock** | Allows users to lock their critical recurring expenses (rent, PTPTN, phone, transport) in automated, protected envelopes. | Protects users from accidentally spending money reserved for essential bills. |
| | **NextGen Score** | A weighted health indicator ($50\%$ Cashflow, $30\%$ Debt/Commitment Health, $20\%$ Savings Progress) that tracks overall financial safety. | Evaluates financial health in real-time instead of just looking at raw balance. |
| **Gamified Discipline** | **TikTok-Style Streaks** | A "Save-Not-Spend" engine. Stays under the *Safe Daily Spend* limit = $+1$ streak day. Overspending resets the streak to 0. | Boosts UI/UX polish and gamification by aligning with daily youth social patterns. |
| | **Visual Dashboard Cues** | Pulsing fire emoji (`🔥 X Days`) next to the cashflow tracker. The BeU Pet companion reacts dynamically (happy on streaks, sad/angry on breakage). | Maximizes intuitive, user-centered UI/UX and micro-animations. |
| | **Membership Tiers** | A 3-tiered reward system based on streak milestones (Novice, Pro, Legend) tracked in the global Zustand state. | Demonstrates technical implementation depth beyond superficial mockups. |

---

## 3. Tier Rewards & Product Integration

The system maps user loyalty tiers to simulated rewards and savings products.

| Tier Level | Tier Milestone | Product Integration | App Execution & Simulated Rewards |
| :--- | :--- | :--- | :--- |
| **1. Novice** | **Base Level**<br>*(0–6 Day Streak)* | Baseline access to the **4 AI Council Agents** | Default entry level. Standard interaction with savings and expense analysis tools (*Savings Sentinel, Debt Shield, Growth Guru, Finance Strategist*). |
| **2. Pro** | **Maintain 7-Day Streak** | **NextGen Reward Nest** savings pockets | Triggers automated prompts to move daily unspent capital into a *Reward Nest*. Earns prize-draw tickets and unlocks localized merchant partner rewards (e.g., **RM5 OFF Grab** or **10% OFF Koppiku**). |
| **3. Legend** | **Maintain 30-Day Streak** | **Premium Yield Simulator** | Unlocks simulated access to the premium fixed-deposit yield optimizer. Calculates optimization metrics for placing idle cash into fixed returns and applies a premium compound rate modifier (boosting from $6.5\%$ to $7.0\%$ p.a.) to Growth Starter pockets. |

---

## 4. Viral Social Campaign: Streak Sharing

This feature addresses user retention and organic acquisition through shareable streak content.

| Campaign Component | Operational Action Workflow | Business & Structural Value |
| :--- | :--- | :--- |
| **The Macro Hook** | Encourage users to share savings milestones and Financial Passport graphics. | Builds retention loops through social proof and habit tracking. |
| **The Trend Theme** | **"Graduation From Broke"** challenge for consistent savers. | Speaks directly to youth-centered social challenges. |
| **"Share My Roast" Button** | Placed in the **Pay Scanner** (`/scan`) and **AI Coach** (`/coach`) panels. Exports a hilariously savage Malay/Manglish financial de-influencing roast. | Converts witty, localized app content into an organic, loop-based acquisition tool. |
| **Canvas Generation** | Programmatically compiles a mobile-friendly graphic containing the current BeU Pet asset, the custom AI roast text, user streak data, and an application download QR code. | Leverages the hosting environment to dynamically serve real-time download targets. |
| **The Virality Incentive** | Sharing the generated "Financial Passport" graphic grants the user a **24-hour "Streak Shield"** (protects streak from breaking for one day) + a simulated **RM10 Referral Bonus** loop. | Creates realistic customer retention loops around habit discipline. |

---

## 5. Technical Blueprint & Product Requirements Document (PRD)

### 5.1 Functional Requirements (FR)

| Requirement ID | Technical Module | Functional Specification (What It Must Do) |
| :--- | :--- | :--- |
| **SR-1.1** | **Streak Tracking** | Must monitor daily discretionary transaction inputs against the calculated *Safe Daily Spend* threshold. |
| **SR-1.2** | **Increment Logic** | At 11:59 PM (simulated), if total daily expenditure $\le$ *Safe Daily Spend*, the global state variable `currentStreak` increments by $+1$. |
| **SR-1.3** | **Reset Logic** | If daily spend exceeds *Safe Daily Spend*, `currentStreak` drops to 0. Updates pet companion state to sad or angry. |
| **SR-1.4** | **Streak Shield** | Provides an interface once a week to consume a "Streak Shield" earned via social media sharing to prevent status decay. |
| **SR-2.1** | **Tier Computation** | Evaluates user loyalty tiers dynamically (`Novice` $\to$ `Pro` $\to$ `Legend`) inside the state engine whenever store states update. |
| **SR-3.1** | **Roast Export** | Renders a high-visibility canvas export action button immediately after the local dialect generation sequence completes in the AI Coach or Scanner. |
| **SR-3.2** | **Referral Loop** | QR code targets must accept inbound parameters during onboarding (`/setup`), triggering a dual credit configuration hook (simulating the RM10 reward). |

### 5.2 Technical & Data Requirements

| Layer | System Target | Implementation Specification (How It Works Under the Hood) |
| :--- | :--- | :--- |
| **Zustand State** | **`useStore.ts` Extension** | Extend global TypeScript interfaces to track: `currentStreak: number`, `highestStreak: number`, `lastCalculatedDate: string` (to avoid double-calculation), `membershipTier: 'Novice' \| 'Pro' \| 'Legend'`, `streakShieldActive: boolean`, `rewardDrawTickets: number`, and `isPassportExported: boolean`. |
| **Data Sync** | **Local & Cloud Sync** | Support persistent local state sync (via Zustand middleware) and define a sync schema (`POST /api/sync`) to commit streak datasets. |
| **Security Layer** | **API Key Orchestration** | Ensure sensitive keys (`GEMINI_API_KEY`) are accessed via server-side routing endpoints/proxies rather than exposed in client-side bundles. |

### 5.3 UI/UX & Visual Requirements

| UI Element | Animation Framework | Visual Specification |
| :--- | :--- | :--- |
| **Streak Tracker** | **Tailwind CSS / Framer Motion** | Highly visible, pulsing fire emoji component directly embedded inside the main interactive command dashboard view (`🔥 X Days`). |
| **Tier Status Change** | **Framer Motion** | Fullscreen, celebratory card flip animation detailing unlocked rewards when user graduates to a new tier. |
| **BeU Pet Reactions** | **Framer Motion / CSS Sprites** | Intercepts state changes immediately: triggers excited/cheering animation loops on successful daily closures, and think states when computing yields. |

---

## 6. Positioning Strategy

| Pitch Angle | What Traditional Apps Say | What BeU NextGen Proves |
| :--- | :--- | :--- |
| **User Retention** | *"We built an app to teach students how to save money through generic data charts."* | *"Our streak engine turns daily savings discipline into a gamified milestone loop with companions, shields, and shareable social proof."* |
| **Product Value** | *"We show links to basic financial products that users can read about."* | *"We seamlessly unlock savings products (Reward Nest prize draws & Premium Yield deposits) by making asset locks a direct perk of gamified lifestyle achievements."* |
