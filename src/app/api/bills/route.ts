import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        const dbUrl = process.env.DATABASE_URL;
        const { searchParams } = new URL(req.url);
        const userName = searchParams.get('username') || 'Aiman';

        if (!dbUrl) {
            return NextResponse.json({ success: false, reason: 'Database connection missing' }, { status: 500 });
        }

        // @ts-ignore
        const pg = await import('pg');
        const Client = pg.default?.Client || pg.Client;
        const client = new Client({ connectionString: dbUrl });
        await client.connect();

        const result = await client.query(
            `SELECT id, name, category, amount, due_day, due_date, next_due_date, frequency, is_locked, mode, payment_rail, status, source, autopay_enabled, auto_track_enabled, autopay_safety, reminder_days_before, metadata 
             FROM bills 
             WHERE user_name = $1 
             ORDER BY next_due_date ASC`,
            [userName]
        );

        await client.end();
        return NextResponse.json({ success: true, data: result.rows });
    } catch (err: any) {
        console.error('[Bills GET] Error:', err);
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
            name, 
            category, 
            amount, 
            dueDay, 
            dueDate, 
            nextDueDate, 
            frequency, 
            isLocked, 
            mode, 
            paymentRail, 
            status, 
            source, 
            autopayEnabled, 
            autoTrackEnabled, 
            autopaySafety, 
            reminderDaysBefore, 
            metadata 
        } = body;

        if (!id || !userName || !name || !category || amount === undefined || !nextDueDate) {
            return NextResponse.json({ error: 'Missing required fields: id, userName, name, category, amount, nextDueDate' }, { status: 400 });
        }

        // @ts-ignore
        const pg = await import('pg');
        const Client = pg.default?.Client || pg.Client;
        const client = new Client({ connectionString: dbUrl });
        await client.connect();

        await client.query(
            `INSERT INTO bills (
                id, user_name, name, category, amount, due_day, due_date, next_due_date, 
                frequency, is_locked, mode, payment_rail, status, source, 
                autopay_enabled, auto_track_enabled, autopay_safety, reminder_days_before, metadata, updated_at
             )
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, CURRENT_TIMESTAMP)
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
                updated_at = CURRENT_TIMESTAMP`,
            [
                id,
                userName,
                name,
                category,
                amount,
                dueDay || null,
                dueDate || null,
                nextDueDate,
                frequency || 'monthly',
                isLocked ?? false,
                mode || 'protected_only',
                paymentRail || 'none',
                status || 'upcoming',
                source || 'manual',
                autopayEnabled ?? false,
                autoTrackEnabled ?? false,
                autopaySafety || 'balanced',
                reminderDaysBefore || 3,
                metadata ? JSON.stringify(metadata) : null
            ]
        );

        await client.end();
        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error('[Bills POST] Error:', err);
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

        await client.query('DELETE FROM bills WHERE id = $1', [id]);

        await client.end();
        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error('[Bills DELETE] Error:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
