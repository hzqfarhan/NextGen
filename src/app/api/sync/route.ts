import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';

// ─────────────────────────────────────────────────────────────────────────────
// Sync API — Persists/Retrieves Zustand store state to/from PostgreSQL
// Stored as a JSONB payload per user name (acting as unique key for hackathon)
//
// CREATE TABLE IF NOT EXISTS user_sync (
//     user_name VARCHAR(100) PRIMARY KEY,
//     balance NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
//     nextgen_score INTEGER NOT NULL DEFAULT 60,
//     streak INTEGER NOT NULL DEFAULT 0,
//     state_data JSONB NOT NULL,
//     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );
// ─────────────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
    try {
        const dbUrl = process.env.DATABASE_URL;
        const { searchParams } = new URL(req.url);
        const userName = searchParams.get('username') || 'Aiman';

        if (!dbUrl) {
            return NextResponse.json({ 
                success: false, 
                reason: 'No DATABASE_URL configured — cloud sync is disabled.' 
            });
        }

        const pool = getDbPool();
        const client = await pool.connect();

        try {
            const result = await client.query(
                `SELECT state_data FROM user_sync WHERE user_name = $1`,
                [userName]
            );

            if (result.rows.length === 0) {
                client.release();
                return NextResponse.json({ success: true, data: null });
            }

            const stateData = result.rows[0].state_data;
            const storedPasscode = stateData?.user?.passcode;

            // Enforce passcode check if one is saved
            if (storedPasscode) {
                const clientPasscode = searchParams.get('passcode') || '';
                if (clientPasscode !== storedPasscode) {
                    client.release();
                    return NextResponse.json({ 
                        success: false, 
                        reason: 'unauthorized', 
                        message: 'Access denied: Incorrect passcode.' 
                    }, { status: 401 });
                }
            }

            return NextResponse.json({ success: true, data: stateData });
        } finally {
            client.release();
        }
    } catch (err: any) {
        console.error('[Sync GET] Error:', err?.message || err);
        return NextResponse.json(
            { success: false, error: err?.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const dbUrl = process.env.DATABASE_URL;
        if (!dbUrl) {
            return NextResponse.json({ 
                success: false, 
                reason: 'No DATABASE_URL configured — cloud sync is disabled.' 
            });
        }

        const body = await req.json();
        const { userName, balance, nextGenScore, streak, stateData } = body;

        if (!userName || stateData === undefined) {
            return NextResponse.json(
                { error: 'Missing required fields: userName, stateData' },
                { status: 400 }
            );
        }

        const pool = getDbPool();
        const client = await pool.connect();

        try {
            // Ensure the sync table exists
            await client.query(`
                CREATE TABLE IF NOT EXISTS user_sync (
                    user_name VARCHAR(100) PRIMARY KEY,
                    balance NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
                    resilience_score INTEGER NOT NULL DEFAULT 60,
                    streak INTEGER NOT NULL DEFAULT 0,
                    state_data JSONB NOT NULL,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);

            await client.query('BEGIN');

            // 1. Upsert state data to user_sync
            await client.query(
                `INSERT INTO user_sync (user_name, balance, resilience_score, streak, state_data, updated_at)
                 VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
                 ON CONFLICT (user_name) 
                 DO UPDATE SET 
                    balance = EXCLUDED.balance,
                    resilience_score = EXCLUDED.resilience_score,
                    streak = EXCLUDED.streak,
                    state_data = EXCLUDED.state_data,
                    updated_at = CURRENT_TIMESTAMP`,
                [
                    userName,
                    balance || 0,
                    nextGenScore || 60,
                    streak || 0,
                    JSON.stringify(stateData)
                ]
            );

            // 2. Extract values for the users table
            const u = stateData.user || {};
            const avatar = u.avatar || null;
            const spendingPersonality = u.spendingPersonality || 'Balanced';
            const monthlyAllowance = parseFloat(u.monthlyAllowance || 800);
            const currentBalance = parseFloat(u.currentBalance || balance || 420);
            const nextAllowanceDate = u.nextAllowanceDate ? new Date(u.nextAllowanceDate) : null;
            const streakVal = parseInt(u.currentStreak || streak || 0);
            const highestStreakVal = parseInt(u.highestStreak || 0);
            const tier = stateData.membershipTier || 'Bronze';
            const shieldActive = stateData.streakShieldActive || false;
            const nextGenScoreVal = parseInt(stateData.nextGenScore || nextGenScore || 60);

            // 3. Upsert user info to users table
            await client.query(`
                INSERT INTO users (
                    username, avatar, spending_personality, monthly_allowance, current_balance,
                    next_allowance_date, nextgen_score, current_streak, highest_streak,
                    membership_tier, streak_shield_active, updated_at
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP)
                ON CONFLICT (username)
                DO UPDATE SET
                    avatar = EXCLUDED.avatar,
                    spending_personality = EXCLUDED.spending_personality,
                    monthly_allowance = EXCLUDED.monthly_allowance,
                    current_balance = EXCLUDED.current_balance,
                    next_allowance_date = EXCLUDED.next_allowance_date,
                    nextgen_score = EXCLUDED.nextgen_score,
                    current_streak = EXCLUDED.current_streak,
                    highest_streak = EXCLUDED.highest_streak,
                    membership_tier = EXCLUDED.membership_tier,
                    streak_shield_active = EXCLUDED.streak_shield_active,
                    updated_at = CURRENT_TIMESTAMP
            `, [
                userName,
                avatar,
                spendingPersonality,
                monthlyAllowance,
                currentBalance,
                nextAllowanceDate,
                nextGenScoreVal,
                streakVal,
                highestStreakVal,
                tier,
                shieldActive
            ]);

            // 4. Deconstruct and Upsert savings pockets
            const savingsPockets = stateData.savingsPockets || [];
            if (Array.isArray(savingsPockets)) {
                for (const pocket of savingsPockets) {
                    const pId = pocket.id || `pocket_${Math.random().toString(36).substr(2, 9)}`;
                    const pName = pocket.name || 'Unnamed Pocket';
                    const pTarget = parseFloat(pocket.target || 0);
                    const pCurrent = parseFloat(pocket.current || 0);
                    const pIcon = pocket.icon || '🎯';
                    const pMode = pocket.mode || 'savings';
                    const pRisk = pocket.riskLevel || 'low';
                    const pIsMain = pocket.isMainGoal || false;

                    await client.query(`
                        INSERT INTO savings (
                            id, user_name, name, target_amount, current_amount, icon, mode, risk_level, is_main_goal, updated_at
                        )
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
                        ON CONFLICT (id)
                        DO UPDATE SET
                            name = EXCLUDED.name,
                            target_amount = EXCLUDED.target_amount,
                            current_amount = EXCLUDED.current_amount,
                            icon = EXCLUDED.icon,
                            mode = EXCLUDED.mode,
                            risk_level = EXCLUDED.risk_level,
                            is_main_goal = EXCLUDED.is_main_goal,
                            updated_at = CURRENT_TIMESTAMP
                    `, [pId, userName, pName, pTarget, pCurrent, pIcon, pMode, pRisk, pIsMain]);
                }

                // Delete removed pockets
                const pocketIds = savingsPockets.map((p: any) => p.id).filter(Boolean);
                if (pocketIds.length > 0) {
                    await client.query(`
                        DELETE FROM savings 
                        WHERE user_name = $1 AND id NOT IN (${pocketIds.map((_, idx) => `$${idx + 2}`).join(', ')})
                    `, [userName, ...pocketIds]);
                } else {
                    await client.query(`
                        DELETE FROM savings WHERE user_name = $1
                    `, [userName]);
                }
            }

            // 5. Deconstruct and Upsert transfers / transactions
            const transactions = stateData.transactions || [];
            if (Array.isArray(transactions)) {
                for (const tx of transactions) {
                    const tId = tx.id || `tx_${Math.random().toString(36).substr(2, 9)}`;
                    const tTitle = tx.title || 'Transaction';
                    const tAmount = parseFloat(tx.amount || 0);
                    const tType = tx.type || 'expense';
                    const tCategory = tx.category || 'general';
                    const tConfidence = parseFloat(tx.confidence !== undefined ? tx.confidence : 1.0);
                    const tDate = tx.date ? new Date(tx.date) : new Date();

                    const recipientName = tx.recipientName || null;
                    const recipientBank = tx.recipientBank || null;
                    const recipientAccount = tx.recipientAccount || null;

                    await client.query(`
                        INSERT INTO transfers (
                            id, user_name, title, amount, type, category, confidence, recipient_name, recipient_bank, recipient_account, date
                        )
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                        ON CONFLICT (id) DO NOTHING
                    `, [tId, userName, tTitle, tAmount, tType, tCategory, tConfidence, recipientName, recipientBank, recipientAccount, tDate]);
                }

                // Delete removed transactions if the user explicitly clears logs
                const txIds = transactions.map((t: any) => t.id).filter(Boolean);
                if (txIds.length > 0) {
                    await client.query(`
                        DELETE FROM transfers 
                        WHERE user_name = $1 AND id NOT IN (${txIds.map((_, idx) => `$${idx + 2}`).join(', ')})
                    `, [userName, ...txIds]);
                } else {
                    await client.query(`
                        DELETE FROM transfers WHERE user_name = $1
                    `, [userName]);
                }
            }

            // 6. Deconstruct and Upsert commitment bills
            const bills = stateData.bills || [];
            if (Array.isArray(bills)) {
                for (const bill of bills) {
                    const bId = bill.id || `bill_${Math.random().toString(36).substr(2, 9)}`;
                    const bName = bill.name || 'Unnamed Bill';
                    const bCategory = bill.category || 'utilities';
                    const bAmount = parseFloat(bill.amount || 0);
                    const bDueDay = bill.dueDay !== undefined && bill.dueDay !== null ? parseInt(bill.dueDay) : null;
                    const bDueDate = bill.dueDate ? new Date(bill.dueDate) : null;
                    const bNextDueDate = bill.nextDueDate ? new Date(bill.nextDueDate) : new Date();
                    const bFrequency = bill.frequency || 'monthly';
                    const bIsLocked = bill.isLocked || false;
                    const bMode = bill.mode || 'protected_only';
                    const bPaymentRail = bill.paymentRail || 'none';
                    const bStatus = bill.status || 'upcoming';
                    const bSource = bill.source || 'manual';
                    const bAutopayEnabled = bill.autopayEnabled || false;
                    const bAutoTrackEnabled = bill.autoTrackEnabled || false;
                    const bAutopaySafety = bill.autopaySafety || 'balanced';
                    const bReminderDaysBefore = bill.reminderDaysBefore !== undefined && bill.reminderDaysBefore !== null ? parseInt(bill.reminderDaysBefore) : 3;

                    const bMetadata = {
                        provider: bill.provider,
                        serviceName: bill.serviceName,
                        productType: bill.productType,
                        recipientName: bill.recipientName,
                        bankName: bill.bankName,
                        accountNumber: bill.accountNumber,
                        referenceNumber: bill.referenceNumber,
                        duitNowIdType: bill.duitNowIdType,
                        duitNowId: bill.duitNowId,
                        billerCode: bill.billerCode,
                        ref1: bill.ref1,
                        ref2: bill.ref2,
                        accountEmail: bill.accountEmail,
                        planName: bill.planName,
                        paymentSourceLabel: bill.paymentSourceLabel,
                        cardLast4: bill.cardLast4,
                        passType: bill.passType,
                        tngCardNickname: bill.tngCardNickname,
                        tngCardLast4: bill.tngCardLast4,
                        tngWalletPhone: bill.tngWalletPhone,
                        vehicleLabel: bill.vehicleLabel,
                        lastPaidAt: bill.lastPaidAt,
                        paymentHistory: bill.paymentHistory
                    };

                    await client.query(`
                        INSERT INTO bills (
                            id, user_name, name, category, amount, due_day, due_date, next_due_date,
                            frequency, is_locked, mode, payment_rail, status, source,
                            autopay_enabled, auto_track_enabled, autopay_safety, reminder_days_before,
                            metadata, updated_at
                        )
                        VALUES (
                            $1, $2, $3, $4, $5, $6, $7, $8,
                            $9, $10, $11, $12, $13, $14,
                            $15, $16, $17, $18, $19, CURRENT_TIMESTAMP
                        )
                        ON CONFLICT (id)
                        DO UPDATE SET
                            name = EXCLUDED.name,
                            category = EXCLUDED.category,
                            amount = EXCLUDED.amount,
                            due_day = EXCLUDED.due_day,
                            due_date = EXCLUDED.due_date,
                            next_due_date = EXCLUDED.next_due_date,
                            frequency = EXCLUDED.frequency,
                            is_locked = EXCLUDED.is_locked,
                            mode = EXCLUDED.mode,
                            payment_rail = EXCLUDED.payment_rail,
                            status = EXCLUDED.status,
                            source = EXCLUDED.source,
                            autopay_enabled = EXCLUDED.autopay_enabled,
                            auto_track_enabled = EXCLUDED.auto_track_enabled,
                            autopay_safety = EXCLUDED.autopay_safety,
                            reminder_days_before = EXCLUDED.reminder_days_before,
                            metadata = EXCLUDED.metadata,
                            updated_at = CURRENT_TIMESTAMP
                    `, [
                        bId, userName, bName, bCategory, bAmount, bDueDay, bDueDate, bNextDueDate,
                        bFrequency, bIsLocked, bMode, bPaymentRail, bStatus, bSource,
                        bAutopayEnabled, bAutoTrackEnabled, bAutopaySafety, bReminderDaysBefore,
                        JSON.stringify(bMetadata)
                    ]);
                }

                // Delete removed bills
                const billIds = bills.map((b: any) => b.id).filter(Boolean);
                if (billIds.length > 0) {
                    await client.query(`
                        DELETE FROM bills 
                        WHERE user_name = $1 AND id NOT IN (${billIds.map((_, idx) => `$${idx + 2}`).join(', ')})
                    `, [userName, ...billIds]);
                } else {
                    await client.query(`
                        DELETE FROM bills WHERE user_name = $1
                    `, [userName]);
                }
            }

            await client.query('COMMIT');
            return NextResponse.json({ success: true });
        } catch (txErr: any) {
            await client.query('ROLLBACK');
            throw txErr;
        } finally {
            client.release();
        }
    } catch (err: any) {
        console.error('[Sync POST] Error:', err?.message || err);
        return NextResponse.json(
            { success: false, error: err?.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
