import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        const dbUrl = process.env.DATABASE_URL;
        const { searchParams } = new URL(req.url);
        const userName = (searchParams.get('username') || 'Aiman').trim().toLowerCase();

        if (!dbUrl) {
            return NextResponse.json({ success: false, reason: 'Database connection missing' }, { status: 500 });
        }

        // @ts-ignore
        const pg = await import('pg');
        const Client = pg.default?.Client || pg.Client;
        const client = new Client({ connectionString: dbUrl });
        await client.connect();

        const result = await client.query(
            `SELECT id, title, amount, type, category, confidence, recipient_name, recipient_bank, recipient_account, date 
             FROM transfers 
             WHERE user_name = $1 
             ORDER BY date DESC 
             LIMIT 50`,
            [userName]
        );

        await client.end();
        return NextResponse.json({ success: true, data: result.rows });
    } catch (err: any) {
        console.error('[Transfers GET] Error:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const dbUrl = process.env.DATABASE_URL;
        if (!dbUrl) {
            return NextResponse.json({ success: false, reason: 'Database connection missing' }, { status: 500 });
        }

        const body = await req.json();
        const { 
            id, 
            userName, 
            title, 
            amount, 
            type, 
            category, 
            confidence, 
            recipientName, 
            recipientBank, 
            recipientAccount 
        } = body;

        if (!id || !userName || !title || amount === undefined) {
            return NextResponse.json({ error: 'Missing required fields: id, userName, title, amount' }, { status: 400 });
        }

        // @ts-ignore
        const pg = await import('pg');
        const Client = pg.default?.Client || pg.Client;
        const client = new Client({ connectionString: dbUrl });
        await client.connect();

        // 1. Insert new transaction / transfer
        await client.query(
            `INSERT INTO transfers (
                id, user_name, title, amount, type, category, confidence, 
                recipient_name, recipient_bank, recipient_account, date
             )
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
             ON CONFLICT (id) DO NOTHING`,
            [
                id,
                userName,
                title,
                amount,
                type || 'expense',
                category || 'Transfer',
                confidence !== undefined ? confidence : 1.00,
                recipientName || null,
                recipientBank || null,
                recipientAccount || null
            ]
        );

        // 2. Perform Marketing & ML Analytics preprocessing:
        // We evaluate user's impulse level to prepare training segments for fine-tuning our LLM
        const userSpends = await client.query(
            `SELECT amount, category, confidence 
             FROM transfers 
             WHERE user_name = $1 AND type = 'expense' AND date >= NOW() - INTERVAL '30 days'`,
            [userName]
        );

        await client.end();

        // Simple Rule engine for ML pipeline simulation:
        // Target users with high-frequency food/shopping transactions for specific discount promos (marketing)
        const monthlyTotal = userSpends.rows.reduce((sum: number, r: any) => sum + parseFloat(r.amount), 0);
        const impulseCount = userSpends.rows.filter((r: any) => parseFloat(r.confidence) < 0.85).length;
        const marketingSegment = monthlyTotal > 500 ? 'Premium Spender' : impulseCount > 3 ? 'High Impulse Risk' : 'Healthy Planner';

        return NextResponse.json({ 
            success: true, 
            analytics: {
                monthlyTotal: monthlyTotal.toFixed(2),
                impulseCount,
                marketingSegment,
                readyForTraining: true
            }
        });
    } catch (err: any) {
        console.error('[Transfers POST] Error:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
