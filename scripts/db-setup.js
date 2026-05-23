// scripts/db-setup.js
// Migration script to initialize the relational PostgreSQL schema
// Users -> Savings -> Transfers -> Bills

const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error('Error: DATABASE_URL is not defined in .env.local');
  process.exit(1);
}

async function run() {
  console.log('Connecting to database...');
  const client = new Client({ connectionString: dbUrl });
  await client.connect();

  try {
    console.log('Creating database tables...');

    // 1. Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        username VARCHAR(100) PRIMARY KEY,
        avatar VARCHAR(255) NULL,
        spending_personality VARCHAR(50) DEFAULT 'Balanced',
        monthly_allowance NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
        current_balance NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
        next_allowance_date DATE NULL,
        nextgen_score INTEGER NOT NULL DEFAULT 60,
        current_streak INTEGER NOT NULL DEFAULT 0,
        highest_streak INTEGER NOT NULL DEFAULT 0,
        membership_tier VARCHAR(20) NOT NULL DEFAULT 'Bronze',
        streak_shield_active BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('- Table "users" verified/created.');

    // 2. Create savings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS savings (
        id VARCHAR(50) PRIMARY KEY,
        user_name VARCHAR(100) NOT NULL REFERENCES users(username) ON DELETE CASCADE,
        name VARCHAR(150) NOT NULL,
        target_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
        current_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
        icon VARCHAR(20) NOT NULL DEFAULT '🎯',
        mode VARCHAR(30) NOT NULL DEFAULT 'savings',
        risk_level VARCHAR(20) NOT NULL DEFAULT 'low',
        is_main_goal BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_savings_user ON savings(user_name);
    `);
    console.log('- Table "savings" verified/created.');

    // 3. Create transfers table
    await client.query(`
      CREATE TABLE IF NOT EXISTS transfers (
        id VARCHAR(50) PRIMARY KEY,
        user_name VARCHAR(100) NOT NULL REFERENCES users(username) ON DELETE CASCADE,
        title VARCHAR(150) NOT NULL,
        amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
        type VARCHAR(30) NOT NULL,
        category VARCHAR(50) NOT NULL,
        confidence NUMERIC(3, 2) DEFAULT 1.00,
        recipient_name VARCHAR(100) NULL,
        recipient_bank VARCHAR(100) NULL,
        recipient_account VARCHAR(50) NULL,
        date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_transfers_user_date ON transfers(user_name, date DESC);
    `);
    console.log('- Table "transfers" verified/created.');

    // 4. Create bills table
    await client.query(`
      CREATE TABLE IF NOT EXISTS bills (
        id VARCHAR(50) PRIMARY KEY,
        user_name VARCHAR(100) NOT NULL REFERENCES users(username) ON DELETE CASCADE,
        name VARCHAR(150) NOT NULL,
        category VARCHAR(50) NOT NULL,
        amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
        due_day INTEGER NULL,
        due_date DATE NULL,
        next_due_date DATE NOT NULL,
        frequency VARCHAR(30) NOT NULL DEFAULT 'monthly',
        is_locked BOOLEAN NOT NULL DEFAULT FALSE,
        mode VARCHAR(50) NOT NULL DEFAULT 'protected_only',
        payment_rail VARCHAR(50) NOT NULL DEFAULT 'none',
        status VARCHAR(30) NOT NULL DEFAULT 'upcoming',
        source VARCHAR(30) NOT NULL DEFAULT 'manual',
        autopay_enabled BOOLEAN NOT NULL DEFAULT FALSE,
        auto_track_enabled BOOLEAN NOT NULL DEFAULT FALSE,
        autopay_safety VARCHAR(30) NOT NULL DEFAULT 'balanced',
        reminder_days_before INTEGER NOT NULL DEFAULT 3,
        metadata JSONB NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_bills_user ON bills(user_name);
    `);
    console.log('- Table "bills" verified/created.');

    // 5. Seed default user Aiman if not exists
    const checkUser = await client.query('SELECT username FROM users WHERE username = $1', ['Aiman']);
    if (checkUser.rows.length === 0) {
      await client.query(`
        INSERT INTO users (username, avatar, spending_personality, monthly_allowance, current_balance, next_allowance_date, nextgen_score, current_streak, highest_streak, membership_tier, streak_shield_active)
        VALUES ('Aiman', '/avatars/aiman.png', 'Balanced', 1200.00, 750.00, CURRENT_DATE + INTERVAL '10 days', 78, 3, 5, 'Bronze', false)
      `);
      console.log('- Default user "Aiman" seeded.');
    }

    console.log('Database schema migration completed successfully!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.end();
  }
}

run();
