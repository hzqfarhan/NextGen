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
            `SELECT username, avatar, spending_personality, monthly_allowance, current_balance, next_allowance_date, nextgen_score, current_streak, highest_streak, membership_tier, streak_shield_active 
             FROM users 
             WHERE username = $1`,
            [userName]
        );

        await client.end();

        if (result.rows.length === 0) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: result.rows[0] });
    } catch (err: any) {
        console.error('[User GET] Error:', err);
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
            username, 
            avatar, 
            spendingPersonality, 
            monthlyAllowance, 
            currentBalance, 
            nextAllowanceDate, 
            nextGenScore, 
            currentStreak, 
            highestStreak, 
            membershipTier, 
            streakShieldActive 
        } = body;

        if (!username) {
            return NextResponse.json({ error: 'Missing required field: username' }, { status: 400 });
        }

        // @ts-ignore
        const pg = await import('pg');
        const Client = pg.default?.Client || pg.Client;
        const client = new Client({ connectionString: dbUrl });
        await client.connect();

        await client.query(
            `INSERT INTO users (
                username, avatar, spending_personality, monthly_allowance, current_balance, 
                next_allowance_date, nextgen_score, current_streak, highest_streak, 
                membership_tier, streak_shield_active, updated_at
             )
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP)
             ON CONFLICT (username) 
             DO UPDATE SET 
                avatar = COALESCE(EXCLUDED.avatar, users.avatar),
                spending_personality = COALESCE(EXCLUDED.spending_personality, users.spending_personality),
                monthly_allowance = COALESCE(EXCLUDED.monthly_allowance, users.monthly_allowance),
                current_balance = EXCLUDED.current_balance,
                next_allowance_date = COALESCE(EXCLUDED.next_allowance_date, users.next_allowance_date),
                nextgen_score = EXCLUDED.nextgen_score,
                current_streak = EXCLUDED.current_streak,
                highest_streak = EXCLUDED.highest_streak,
                membership_tier = EXCLUDED.membership_tier,
                streak_shield_active = EXCLUDED.streak_shield_active,
                updated_at = CURRENT_TIMESTAMP`,
            [
                username,
                avatar || null,
                spendingPersonality || 'Balanced',
                monthlyAllowance || 0,
                currentBalance || 0,
                nextAllowanceDate || null,
                nextGenScore || 60,
                currentStreak || 0,
                highestStreak || 0,
                membershipTier || 'Bronze',
                streakShieldActive ?? false
            ]
        );

        await client.end();
        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error('[User POST] Error:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
