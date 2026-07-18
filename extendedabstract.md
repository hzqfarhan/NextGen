NextGen: AI-Powered Financial Companion for Youth

Muhammad Haziq Farhan bin Nordin1, Suriawati binti Suparjoh2, Muhammad Khairul Ibad bin Jima’ain3, Muhammad Aizat Ridhauddin bin Mohd Rizal4, Muhammad Danial bin Shaharuddin5, Muhammad Qaid Uqail bin Khairul Anuar6
1 Faculty of Computer Science and Information Technology, Universiti Tun Hussein Onn Malaysia, Parit Raja, Batu Pahat, Johor, Malaysia 

Corresponding author: Suriawati binti Suparjoh, suriati@uthm.edu.my

ABSTRACT
NextGen is an AI-powered financial companion designed to help students and young adults manage daily spending, commitments, and savings more confidently. Many youth users make spending decisions based only on their remaining balance, which can hide upcoming bills, transport costs, food expenses, savings goals, and end-of-month pressure. NextGen addresses the problem by providing a module that separates money into protected commitments, savings, and safe daily spending. The system is developed as a browser/PWA-based financial application supported by Zustand state management, Next.js API routes, PostgreSQL data storage, and a multi-agent Google Gemini AI Council. Beyond intelligent budgeting, NextGen provides localized financial coaching, structured AI responses cards, persistent chat history, dynamic follow-up recommendations and a Financial Health Dashboard that offers users immediate financial insights. In short, NextGen helps users make informed spending decisions, reduce financial anxiety and build sustainable money habits.
Keywords: Artificial Intelligence, Financial Technology, Youth Financial Wellness, Gamification, Progressive Web App.


Product Description
NextGen is a browser/PWA-based financial companion that helps youth users manage spending, commitments, savings, and financial decisions in one platform. The system includes key interfaces such as Dashboard, AI Coach, Bills/Save, Savings, Transfer, Insights, and Diagnostics. These interfaces are connected to a Zustand global state that manages wallet balance, scores, bills, savings pockets, and user activity. Data synchronization is handled through StoreSyncHandler and Next.js API routes, while PostgreSQL stores user, savings, transfer, bill, and chat log data. Google Gemini AI powers the NextGen AI Council, which provides structured financial guidance through specialized agents. The product also includes Safe Daily Spend, Smart Bill Lock, NextGen Score, Financial Health Dashboard, Pay Scanner, voice assistant, animated companions, membership tiers, streak rewards, persistent chat history, localized Malaysian financial language support, dynamic follow-up suggestions, structured AI response cards  and Progressive Web Application installation support.


Product Design and Implementation Overview

2.1 System Architecture
The system architecture consists of a Client layer, Next.js API Routes layer, Google Gemini AI layer, and PostgreSQL Database layer. The Client runs in a Browser/PWA environment and includes Dashboard, Coach (AI), Bills/Save, and other pages. These pages connect to the Zustand useStore, which holds global financial state such as wallet, score, bills, and pockets. StoreSyncHandler watches state changes and triggers synchronization. The API routes handle chat, user profile synchronization, savings, transfers, bills, diagnostics, and bulk state synchronization. Google Gemini AI supports multi-agent coaching, while PostgreSQL stores users, savings, transfers, bills, and chat_logs.


Figure 1. High-level architecture diagram of NextGen 

2.2 System Workflow
The workflow begins when users complete onboarding by entering their financial profile, available balance, commitments, and savings goals. After setup, the user views the dashboard that shows Total Balance, Protected Commitments, Spendable Balance, Safe Daily Spend, and NextGen Score. When a financial question is submitted, the system first validates the request before routing it to the appropriate Gemini-powered AI specialist through the NextGen AI Council. The selected agent generates structured financial recommendations that are presented as interactive response cards together with contextual follow-up suggestions. The user can visit Smart Bill Lock to confirm protected commitments, try Pay Scanner for a risky demo purchase, use Savings Hub to add funds to a goal pocket.  The workflow concludes by updating the dashboard and financial insights in real time, providing users with continuous and personalized financial guidance. 

Figure 2. Demo workflow of NextGen 

2.3 Multi-Agent AI Council
NextGen routes user queries to four Gemini-powered AI agents. Finance Strategist handles daily spending budgets, NextGen financial health scores, and general financial queries. Savings Sentinel supports goal pockets, micro-savings automation, and cutting costs suggestions. Commitment Shield handles Smart Bill Lock, BNPL assessment, loans, and debt shielding. Growth Guru supports long-term growth blueprints, unit trust explanations, and ASB analysis. The system also uses structured JSON messaging, where AI responses are generated as structured financial cards containing headlines, insights, key metrics, recommended actions, and contextual follow-up suggestions. The interface also displays the active financial specialist during processing, improving transparency and helping users understand which AI agent is handling their request. This makes the AI output easier to understand and more suitable for financial decision-making.

Figure 3. NextGen AI Council and structured financial responses 

2.4 Key Features of NextGen 

Table 1. Key Features of NextGen 
Feature
Function
Safe Daily Spend
Computes safe budget per day based on balance, bills, and days remaining 
Smart Bill Lock 
Auto-protects recurring commitments such as rent, phone, PTPTN, and subscriptions before money is treated as spendable
NextGen Score  
Shows a 0–100 financial health score updated in real time 
NextGen AI Council
Provide financial guidance through four Gemini-powered AI agents 
Structured AI Responses 
Returns JSON cards with headline, status, insight, metric, and CTA 
AI Topic Guard 
Rejects off-topic messages without calling the AI model 
Savings Hub 
Provides goal-based savings pockets with progress tracking and AI coaching 
Transfer with AI Match 
Suggests transfers with confidence matching from transaction history 
Pay Scanner 
Provides QR-style spend risk evaluation with Impulse Negotiator 
Roast & Toast Engine 
Gives Malay dialect AI feedback on spending habits 
NextGen Companion 
Provides six unlockable animated companions 
Membership Tiers 
Uses Novice, Pro, and Legend tiers 
Gamified Companion
Uses unlockable companions, streaks, tiers and rewards to encourage habits
Streak & Rewards 
Tracks daily streaks, Streak Shield, and AWFAR draw tickets 
Diagnostics Panel 
Shows database latency, Gemini API status, and ERD schema map 
Voice Assistant 
Supports speech-to-text financial queries with animated orb UI 
Dynamic Follow-up Suggestions
Generates contextual follow-up questions after each AI response to encourage continuous financial coaching. 
Persistent Chat History
Preserves previous conversations locally, allowing users to continue financial discussions after refreshing the application. 
Intelligent Agent Indicator
Shows which AI specialist is currently processing the user's request. 
Offline Sync Resilience
Automatically switches to local operation when cloud synchronization is temporarily unavailable. 



2.5 Comparison Between Common Money Management Method and Next Gen 

Table 2. Comparison Between Common Money Management Method and NextGen 

Aspect
Common Money Management Method 
NextGen 
Main Tool Used 
Users commonly rely on mobile banking balance, notes, spreadsheets, reminders, or basic expense trackers. 
NextGen combines balance tracking, safe spending, savings, bill protection, and AI guidance in one platform. 
Spending Decision 
Users usually check their remaining balance and decide manually whether they can afford something. 
Safe Daily Spend shows how much can be spent per day after considering balance, bills, and remaining days. 
Bill Management 
Users often depend on memory, calendar reminders, or manual tracking to remember commitments. 
Smart Bill Lock protects recurring commitments before money is counted as spendable. 
Savings Tracking 
Savings may be tracked separately in notes, bank accounts, or basic goal trackers. 
Savings Hub separates savings into goal-based pockets and tracks progress clearly. 
Financial Advice 
Users may depend on their own judgement, friends, online tips, or generic budgeting advice. 
The AI Council provides structured financial guidance using Gemini-powered agents. 
Transaction Risk 
Users may only realize a spending mistake after the money has already been used. 
Pay Scanner evaluates whether a transaction is safe, risky, or harmful before spending. 
Motivation 
Manual budgeting can feel repetitive and easy to abandon. 
Gamified companions, streaks, tiers, and rewards encourage consistent financial habits. 
Feedback Style 
Feedback is usually limited to numbers, transaction history, or basic alerts. 
Roast & Toast Engine gives localized Malay-style feedback on spending habits. 
System Visibility 
Users normally do not see whether AI, database, or backend services are functioning. 
Diagnostics Panel shows database latency, Gemini API status, and ERD schema map. 







Novelty and Uniqueness
NextGen is different from a normal balance-based spending experience because it separates money into what the user has, what must be protected, and what can be safely spent. Its novelty is shown through the NextGen AI Council, which routes financial queries to four Gemini-powered personas: Finance Strategist, Savings Sentinel, Commitment Shield, and Growth Guru. The system also uses structured JSON messaging so AI output becomes a visual card with headline, status, insight, metric, and call-to-action rather than a long paragraph. Other distinctive features are Smart Bill Lock, Safe Daily Spend, a 0–100 NextGen Score, Pay Scanner with Impulse Negotiator, Malay dialect Roast & Toast feedback, unlockable animated companions, membership tiers, streak rewards, voice assistant, diagnostics, and PWA readiness. Unlike conventional financial chatbots that provide generic responses, NextGen employs a multi-agent AI architecture capable of selecting specialized financial advisors based on user intent. The system further enhances user engagement through contextual follow-up recommendations, localized Malaysian financial language understanding, persistent conversation history, and transparent AI agent indication during processing. These features combine financial decision support, gamification, AI coaching, and system transparency in one functional prototype.


Benefit to Mankind	
According to the repository, NextGen targets students and young adults who mentally guess what is safe to spend from one balance number. The stated problem is that rent, bills, transport, food, savings goals, and end-of-month pressure become hidden inside that number, causing overspending, missed commitments, and financial anxiety. The product benefits users by showing Safe Daily Spend, protecting recurring commitments through Smart Bill Lock, tracking savings pockets, and providing quick financial decisions through the AI Council. Continuous AI coaching, persistent conversations, and contextual follow-up recommendations encourage long-term financial learning rather than one-time budgeting decisions.  Its demo flow also shows onboarding, dashboard review, bill protection, AI Coach use, Pay Scanner risk checking, Savings Hub funding, transfer matching, and diagnostics verification.


Innovation Impact and Commercialization Potential
NextGen demonstrates the practical application of artificial intelligence in personal financial management through a multi-agent architecture that delivers personalized financial coaching, budgeting assistance, affordability analysis, and intelligent financial insights. The platform encourages users to develop responsible financial habits, improve financial literacy, and make informed spending and saving decisions through real-time, context-aware recommendations. Its modular and scalable architecture enables future integration with banking services, digital wallets, educational institutions, and fintech platforms, providing strong potential for commercialization as a Software-as-a-Service (SaaS) solution or enterprise financial wellness platform. The project supports the United Nations Sustainable Development Goals (SDGs) by promoting SDG 4: Quality Education through accessible financial education, SDG 8: Decent Work and Economic Growth by strengthening financial capability and economic resilience, and SDG 12: Responsible Consumption and Production by encouraging sustainable spending, budgeting, and long-term financial planning.

Figure 4. Sustainable Development Goals: Quality Education, Decent Work and Economic Growth, Responsible Consumption and Production


Acknowledgment
The authors would like to acknowledge Universiti Tun Hussein Onn Malaysia, Faculty of Computer Science and Information Technology, for the academic support and guidance provided throughout the development of this project. Appreciation is extended to all project members for their contributions to the ideation, design, implementation, and documentation of the system.


Researchers’ Biography


Muhammad Haziq Farhan bin Nordin is an Information Technology student at the Faculty of Computer Science and Information Technology, Universiti Tun Hussein Onn Malaysia. His areas of interest include Frontend Development, User Interface (UI) Design, and Human-Computer Interaction. In this project, he contributed to frontend development and the creation of user interface mockups.




Suriawati binti Suparjoh is an Information Technology lecturer at the Faculty of Computer Science and Information Technology, Universiti Tun Hussein Onn Malaysia. Her areas of interest include Software Quality Assurance, Mobile Application and Multimedia Technology. In this project, she served as the primary supervisor, providing expert guidance and oversight on system quality assurance. 


Muhammad Khairul Ibad Bin Jima’ain is an Information Technology student at the Faculty of Computer Science and Information Technology, Universiti Tun Hussein Onn Malaysia. His areas of interest include Full-Stack Development, Mobile and Web Development, Machine Learning development and Agentive AI. In this project, he contributed to development and trained the AI Agent.


Muhammad Aizat Ridhauddin bin Mohd Rizal is an Information Technology student at the Faculty of Computer Science and Information Technology, Universiti Tun Hussein Onn Malaysia. His areas of interest include Backend Architecture, Cloud Computing, and Database Management. In this project, he contributed to backend development, database design, and API integration.


Muhammad Danial bin Shaharuddin is an Information Technology student at the Faculty of Computer Science and Information Technology, Universiti Tun Hussein Onn Malaysia. His areas of interest include Systems Analysis, Agile Methodologies, and Software Architecture. In this project, he contributed to the system design, requirement gathering, and overall project management.

Muhammad Qaid Uqail bin Khairul Anuar is an Information Technology student at the Faculty of Computer Science and Information Technology, Universiti Tun Hussein Onn Malaysia. His areas of interest include Technical Writing, Data Analytics, and Mobile Development. In this project, he contributed to the development of comprehensive documentation, system analysis, and project insights.






References 

hzqfarhan, “NextGen” GitHub repository, 2026. Accessed: Jun. 24, 2026. 
O. Hean, U. Saha, and B. Saha, “Can AI Help with Your Personal Finances?” arXiv:2412.19784, 2025. [Online]. Available: https://arxiv.org/html/2412.19784v3 
A. N. Ruiz-Carhuamaca, J. A. Yauricasa-Seguil, and J. C. Morales-Arevalo, “Design of a Mobile Learning App for Financial Literacy in Young People Using Gamification,” International Journal of Advanced Computer Science and Applications, vol. 15, no. 12, 2024. [Online]. Available: https://thesai.org/Publications/ViewPaper?Code=IJACSA&Issue=12&SerialNo=10&Volume=15 







