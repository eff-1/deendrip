import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { getEmailLogs, sendTestEmail } from '@/lib/email';
import { logAdminAction } from '@/lib/db';

export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get('limit');
  const limit = limitParam ? Math.min(Math.max(parseInt(limitParam, 10) || 50, 1), 200) : 50;

  try {
    const logs = await getEmailLogs(limit);
    return NextResponse.json({ logs });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch email logs';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => null);
    if (!body || !body.toEmail) {
      return NextResponse.json({ error: 'toEmail is required' }, { status: 400 });
    }

    const { toEmail } = body;
    const cleanEmail = String(toEmail).trim().toLowerCase();

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return NextResponse.json({ error: 'Valid email address required' }, { status: 400 });
    }

    const result = await sendTestEmail(cleanEmail);
    logAdminAction(admin.id, admin.email, 'SEND_TEST_EMAIL', 'email', cleanEmail, `Provider: ${result.provider}, Success: ${result.success}`);

    return NextResponse.json(result);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to send test email';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
