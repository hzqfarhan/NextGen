# AI Agent Migration & Cloud Deployment Guide

This guide provides the complete blueprints, configuration files, prompts, and server setup instructions required to clone the AI agent architecture from the **GX Youth** project and deploy it onto your own cloud servers.

---

## Part 1: The AI Agent Prompt & Tool Blueprints

To replicate the AI Coach (GX Buddy) in another system, your backend must send the system instructions (personas) and tool/function declarations to your LLM API (e.g. Gemini 2.5 Flash).

### 1. The System Instructions (Personas)
The coach uses **4 distinct personas** depending on the conversation domain. Below are the prompts:

```text
================================================================================
Persona 1: Finance Strategist (Chief Advisor)
================================================================================
You are Finance Strategist, the chief financial advisor.
You look at the big picture: safe daily spending, net worth, emergency funds, and overarching goals.
Directly answer user questions about their daily spending limits, budgeting, and overall financial health.
Do not refuse to answer or constantly defer to other agents unless the question is highly specific to another domain. Use RM currency.

================================================================================
Persona 2: Savings Sentinel (Budgeting & Cash Retention)
================================================================================
You are Savings Sentinel, a strict financial advisor specializing in budgeting, expense reduction, savings pockets, and cash retention strategies for young Malaysians.
Directly help the user find ways to cut expenses, set up savings goals, and build budgets.
Always answer questions directly. Use RM currency.

================================================================================
Persona 3: Debt Shield (Liabilities & BNPL Protection)
================================================================================
You are Debt Shield, a specialist in liability management, interest rates, BNPL risks, and loan/credit card payoff strategies.
Directly answer questions about debt management and strategies.
Always warn about BNPL risks. Use RM currency.

================================================================================
Persona 4: Growth Guru (Wealth & Investments)
================================================================================
You are Growth Guru, a wealth-building specialist focused on investments, compound interest, ASB, unit trusts, and portfolio growth for Malaysians.
Directly answer questions about investments, returns, and growth opportunities.
Always mention risk level (Low/Medium/High). Use RM currency.
```

### 2. The Tool (Function Calling) Schemas
To allow the AI to trigger native actions, declare the following JSON schema alongside your LLM request:

```json
[
  {
    "name": "createSavingsPocket",
    "description": "Creates a new savings pocket (goal) for the user with a specific target and optional initial deposit. Use this whenever the user wants to set a goal, create a fund, or setup a pocket.",
    "parameters": {
      "type": "OBJECT",
      "properties": {
        "name": {
          "type": "STRING",
          "description": "The name of the goal or pocket (e.g. New Phone, Trip to Japan, Laptop)"
        },
        "target": {
          "type": "NUMBER",
          "description": "The target goal amount in RM (e.g. 2500)"
        },
        "deposit": {
          "type": "NUMBER",
          "description": "Initial amount to deposit in RM. Default is 0."
        },
        "mode": {
          "type": "STRING",
          "description": "Savings mode: 'savings' (low risk, standard) or 'growth' (higher returns, medium risk). Default is 'savings'."
        }
      },
      "required": ["name", "target"]
    }
  },
  {
    "name": "addFundsToPocket",
    "description": "Add funds or deposit money into an existing savings pocket. Use this whenever the user wants to save, add, or deposit money into a specific pocket.",
    "parameters": {
      "type": "OBJECT",
      "properties": {
        "pocketName": {
          "type": "STRING",
          "description": "The name of the pocket to add funds to (e.g. Laptop Fund, Emergency Fund)"
        },
        "amount": {
          "type": "NUMBER",
          "description": "The amount in RM to deposit"
        }
      },
      "required": ["pocketName", "amount"]
    }
  },
  {
    "name": "toggleSpendGuard",
    "description": "Toggles the Spend Guard protection mode. Spend Guard limits daily spending to keep the user on track.",
    "parameters": {
      "type": "OBJECT",
      "properties": {
        "enable": {
          "type": "BOOLEAN",
          "description": "Whether to turn Spend Guard ON (true) or OFF (false)"
        }
      },
      "required": ["enable"]
    }
  }
]
```

---

## Part 2: Database Server Setup (`beu-db-server`)

This server stores user conversations and audits. We will use a standard Linux cloud instance running **Ubuntu 22.04 LTS**.

### 1. Install PostgreSQL
SSH into your database server and execute:
```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib
```

### 2. Configure Remote Connections
By default, PostgreSQL only listens locally. Enable external connections from your web server:

1. Open the main config file:
   ```bash
   sudo nano /etc/postgresql/14/main/postgresql.conf
   ```
2. Locate the line `#listen_addresses = 'localhost'` and change it to:
   ```ini
   listen_addresses = '*'
   ```
3. Save (`Ctrl + O`, `Enter`) and exit (`Ctrl + X`).

4. Open the Client Authentication config file:
   ```bash
   sudo nano /etc/postgresql/14/main/pg_hba.conf
   ```
5. Append this line at the bottom of the file to allow your Web Server to connect. Replace `103.40.204.70` with your actual Web Server's public IP address:
   ```text
   # Allow connection from Web Server VM
   host    gxdb            gxuser          103.40.204.70/32        scram-sha-256
   ```
6. Restart PostgreSQL to apply the configurations:
   ```bash
   sudo systemctl restart postgresql
   ```

### 3. Initialize the Database and Tables
Access the Postgres prompt:
```bash
sudo -i -u postgres psql
```

Run these SQL queries to create your database, user, password, and the logs table:
```sql
-- Create the database
CREATE DATABASE gxdb;

-- Create the user with a secure password
CREATE USER gxuser WITH PASSWORD 'YourSecureDBPassword123';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE gxdb TO gxuser;

-- Switch to the new database
\c gxdb

-- Create the chat logs table
CREATE TABLE chat_logs (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_name VARCHAR(100) NOT NULL,
    agent_id VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    function_called VARCHAR(100) NULL
);

-- Grant permissions to user on all tables
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO gxuser;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO gxuser;

-- Exit the psql terminal
\q
```

### 4. Open Port 5432 in the Security Group
In your NovaCloud / Cloud Provider Console:
* Create an Inbound Rule.
* Set Protocol to **TCP**.
* Set Port Range to **5432**.
* Set Source to your Web Server VM IP (`103.40.204.70/32`) to keep it private and secure.

---

## Part 3: Web Server Setup (`beu-web-server`)

This VM runs your Next.js application, queries the LLM API, and bridges the database.

### 1. Install Node.js & Git
SSH into your Web Server VM:
```bash
# Install Node Version Manager (NVM)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc

# Install Node v20 (LTS)
nvm install 20
nvm use 20

# Install Git
sudo apt update
sudo apt install -y git
```

### 2. Deploy your Web Codebase
```bash
# Clone the repository
git clone <your-git-repo-url> webapp
cd webapp

# Install package dependencies
npm install
```

### 3. Configure Environments
Create a production environment file:
```bash
nano .env.local
```

Paste your production credentials pointing to your Database Server VM and your Gemini API key:
```ini
GEMINI_API_KEY=AIzaSyCH...YourGeminiApiKey...
DATABASE_URL=postgres://gxuser:YourSecureDBPassword123@<DB_SERVER_IP>:5432/gxdb
NEXT_PUBLIC_BASE_PATH=
```
Save and exit.

### 4. Build and Run App with PM2 (Persistence)
Use **PM2** to run your web server in the background and automatically restart it if it crashes:
```bash
# Install PM2 globally
npm install -g pm2

# Build the Next.js Production bundle
npm run build

# Start the Next.js server on port 2222 using PM2
pm2 start "npm run start -- -p 2222" --name "gx-web-app"

# Ensure PM2 starts on system reboots
pm2 startup
pm2 save
```

---

## Part 4: Crucial SSL/HTTPS Setup (Enabling Microphone/Audio)

Since browsers block microphone operations (`webkitSpeechRecognition`) on insecure origins, you **MUST** serve your website over HTTPS. 

The easiest tool for auto-SSL is **Caddy Server**.

### 1. Install Caddy Server
Run this on your web server:
```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy
```

### 2. Configure HTTPS Proxy
1. Point your domain (e.g. `gxbuddy.yourdomain.com`) to your Web Server public IP via your domain registrar's DNS records.
2. Edit Caddy's configuration file:
   ```bash
   sudo nano /etc/caddy/Caddyfile
   ```
3. Remove the default configuration and paste:
   ```caddyfile
   gxbuddy.yourdomain.com {
       reverse_proxy localhost:2222
   }
   ```
4. Save and restart Caddy:
   ```bash
   sudo systemctl restart caddy
   ```

Caddy will automatically provision a Let's Encrypt certificate. You can now access your application securely at `https://gxbuddy.yourdomain.com`, and the microphone button will be fully enabled out of the box with zero client configuration!
