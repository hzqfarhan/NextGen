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
            `SELECT id, name, target_amount, current_amount, icon, mode, risk_level, is_main_goal 
             FROM savings 
             WHERE user_name = $1 
             ORDER BY created_at ASC`,
            [userName]
        );

        await client.end();
        return NextResponse.json({ success: true, data: result.rows });
    } catch (err: any) {
        console.error('[Savings GET] Error:', err);
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
        const { id, userName, name, targetAmount, currentAmount, icon, mode, riskLevel, isMainGoal } = body;

        if (!id || !userName || !name) {
            return NextResponse.json({ error: 'Missing required fields: id, userName, name' }, { status: 400 });
        }

        // @ts-ignore
        const pg = await import('pg');
        const Client = pg.default?.Client || pg.Client;
        const client = new Client({ connectionString: dbUrl });
        await client.connect();

        await client.query(
            `INSERT INTO savings (id, user_name, name, target_amount, current_amount, icon, mode, risk_level, is_main_goal, updated_at)
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
                updated_at = CURRENT_TIMESTAMP`,
            [
                id,
                userName,
                name,
                targetAmount || 0,
                currentAmount || 0,
                icon || '🎯',
                mode || 'savings',
                riskLevel || 'low',
                isMainGoal ?? false
            ]
        );

        await client.end();
        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error('[Savings POST] Error:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const dbUrl = process.env.DATABASE_URL;
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!dbUrl) {
            return NextResponse.json({ success: false, reason: 'Database connection missing' }, { status: 500 });
        }

        if (!id) {
            return NextResponse.json({ error: 'Missing parameter: id' }, { status: 400 });
        }

        // @ts-ignore
        const pg = await import('pg');
        const Client = pg.default?.Client || pg.Client;
        const client = new Client({ connectionString: dbUrl });
        await client.connect();

        await client.query('DELETE FROM savings WHERE id = $1', [id]);

        await client.end();
        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error('[Savings DELETE] Error:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
