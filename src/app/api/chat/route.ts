import { NextRequest, NextResponse } from 'next/server';

const AGENT_PROMPTS: Record<string, string> = {
    save: `You are Savings Sentinel, a strict financial advisor specializing ONLY in budgeting, 
  expense reduction, and cash retention strategies for young Malaysians. 
  You CANNOT discuss investments, debt, or macro finance strategy.
  If asked, politely redirect to the correct agent.
  Be concise, direct, and use RM currency.`,

    debt: `You are Debt Shield, a specialist in liability management, interest rates, 
  BNPL risks, and loan/credit card payoff strategies.
  You CANNOT discuss investments or savings goals beyond clearing debt.
  Always warn about BNPL risks. Use RM currency.`,

    invest: `You are Growth Guru, a wealth-building specialist focused on investments, 
  compound interest, ASB, unit trusts, and portfolio growth for Malaysians.
  You CANNOT advise on debt repayment or daily budgeting.
  Always mention risk level (Low/Medium/High). Use RM currency.`,

    finance: `You are Finance Strategist, the general financial manager.
  You look at the big picture: net worth, emergency funds, overarching goals.
  You coordinate between all agents. You can discuss all financial topics at a high level.
  Always refer users to specialist agents for detailed advice. Use RM currency.`,
};

export async function POST(req: NextRequest) {
    try {
        const { message, agentId, context } = await req.json();

        if (!message || !agentId) {
            return NextResponse.json({ error: 'Missing message or agentId' }, { status: 400 });
        }

        const systemPrompt = AGENT_PROMPTS[agentId] ?? AGENT_PROMPTS['finance'];

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    system_instruction: { parts: [{ text: systemPrompt }] },
                    contents: [{ role: 'user', parts: [{ text: message }] }],
                    generationConfig: { maxOutputTokens: 512, temperature: 0.7 },
                }),
            }
        );

        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No response from AI.';

        return NextResponse.json({ reply: text });
    } catch (err) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
