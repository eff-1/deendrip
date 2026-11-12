import { NextResponse } from 'next/server';
import { sendTestEmail, getEmailLogs } from '@/lib/email';
import { sanitizeEmail } from '@/lib/sanitize';
import { checkRateLimit, createRateLimitResponse } from '@/lib/rateLimit';

export async function POST(req: Request) {
  try {
    const rateCheck = checkRateLimit(req, 'test-email', 10, 60);
    if (!rateCheck.allowed) {
      return createRateLimitResponse(rateCheck);
    }

    const body = await req.json().catch(() => ({}));
    const targetEmail = sanitizeEmail(body.email || 'deendripclothing@gmail.com');

    if (!targetEmail) {
      return NextResponse.json({ error: 'Please enter a valid target email address' }, { status: 400 });
    }

    const result = await sendTestEmail(targetEmail);

    return NextResponse.json({
      success: result.success,
      recipient: targetEmail,
      provider: result.provider,
      error: result.error,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Test email failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET() {
  try {
    const logs = await getEmailLogs(20);
    return NextResponse.json({ success: true, count: logs.length, logs });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch logs';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
