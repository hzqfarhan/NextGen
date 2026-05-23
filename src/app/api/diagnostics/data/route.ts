import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const dbUrl = process.env.DATABASE_URL;
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

    // Model limit specs for monitoring
    const modelLimits: Record<string, { rpm: number; rpd: number }> = {
        'gemini-3.1-flash-lite': { rpm: 15, rpd: 500 },
        'gemini-2.5-flash': { rpm: 15, rpd: 20 },
        'gemini-2.5-flash-lite': { rpm: 10, rpd: 20 },
        'gemini-3.5-flash': { rpm: 15, rpd: 20 },
        'gemini-3-flash': { rpm: 15, rpd: 20 }
    };

    const limits = modelLimits[model] || { rpm: 15, rpd: 20 };

    if (!dbUrl) {
        return NextResponse.json({
            success: false,
            error: 'DATABASE_URL is not set.'
        });
    }

    try {
        // @ts-ignore
        const pg = await import('pg');
        const Client = pg.default?.Client || pg.Client;
        const client = new Client({ connectionString: dbUrl });

        await client.connect();

        // Query last 10 chat logs
        const chatLogsRes = await client.query(`
            SELECT id, timestamp, user_name, agent_id, message, response, function_called 
            FROM chat_logs 
            ORDER BY timestamp DESC 
            LIMIT 10;
        `);

        // Query last 10 users from the new relational table
        const userSyncRes = await client.query(`
            SELECT username AS user_name, current_balance AS balance, nextgen_score AS resilience_score, current_streak AS streak, updated_at 
            FROM users 
            ORDER BY updated_at DESC 
            LIMIT 10;
        `);

        // Query last 10 savings goals
        const savingsRes = await client.query(`
            SELECT id, user_name, name, target_amount, current_amount, icon, mode, risk_level 
            FROM savings 
            ORDER BY created_at DESC 
            LIMIT 10;
        `);

        // Query last 10 transfers
        const transfersRes = await client.query(`
            SELECT id, user_name, title, amount, type, category, confidence, date 
            FROM transfers 
            ORDER BY date DESC 
            LIMIT 10;
        `);

        // Query last 10 bills
        const billsRes = await client.query(`
            SELECT id, user_name, name, category, amount, due_day, next_due_date, is_locked, status 
            FROM bills 
            ORDER BY next_due_date ASC 
            LIMIT 10;
        `);

        // Calculate usage statistics from DB
        const rpdRes = await client.query(`
            SELECT COUNT(*)::integer as count 
            FROM chat_logs 
            WHERE timestamp >= CURRENT_DATE;
        `);

        const rpmRes = await client.query(`
            SELECT COUNT(*)::integer as count 
            FROM chat_logs 
            WHERE timestamp >= NOW() - INTERVAL '1 minute';
        `);

        await client.end();

        return NextResponse.json({
            success: true,
            chatLogs: chatLogsRes.rows,
            userSyncs: userSyncRes.rows,
            savings: savingsRes.rows,
            transfers: transfersRes.rows,
            bills: billsRes.rows,
            usage: {
                model,
                rpdUsed: rpdRes.rows[0]?.count || 0,
                rpdLimit: limits.rpd,
                rpmUsed: rpmRes.rows[0]?.count || 0,
                rpmLimit: limits.rpm
            }
        });
    } catch (err: any) {
        return NextResponse.json({
            success: false,
            error: err.message || 'Failed to query tables.'
        });
    }
}
