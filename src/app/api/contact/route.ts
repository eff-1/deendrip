import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getTursoClient } from '@/lib/turso';
import { checkRateLimit, createRateLimitResponse } from '@/lib/rateLimit';
import { cleanPlainText, sanitizeEmail, sanitizeIdentifier } from '@/lib/sanitize';
import { sendContactInquiryEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    // 1. Rate Limiting: 5 submissions per 5 minutes per IP
    const rateCheck = checkRateLimit(req, 'contact-inquiry', 5, 300);
    if (!rateCheck.allowed) {
      return createRateLimitResponse(rateCheck, 'Too many messages sent. Please wait before contacting us again.');
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
    }

    const name = cleanPlainText(body.name, 100);
    const email = sanitizeEmail(body.email);
    const orderRef = sanitizeIdentifier(body.orderRef, 32);
    const message = cleanPlainText(body.message, 3000);

    if (!name || name.length < 2) {
      return NextResponse.json({ error: 'Please enter your name (at least 2 characters)' }, { status: 400 });
    }

    if (!email) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }

    if (!message || message.length < 5) {
      return NextResponse.json({ error: 'Please enter a message (at least 5 characters)' }, { status: 400 });
    }

    const id = `inq-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const now = new Date().toISOString();

    // 2. Persist to local database
    const db = getDb();
    db.prepare(`
      INSERT INTO contact_inquiries (id, name, email, order_ref, message, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, name, email, orderRef || null, message, now);

    // 3. Persist to Turso cloud
    const turso = getTursoClient();
    if (turso) {
      turso.execute({
        sql: `INSERT INTO contact_inquiries (id, name, email, order_ref, message, created_at)
              VALUES (?, ?, ?, ?, ?, ?)`,
        args: [id, name, email, orderRef || null, message, now],
      }).catch(err => console.error('Turso contact inquiry sync error:', err));
    }

    // 4. Dispatch alert email to store owner & auto-acknowledgement to customer
    sendContactInquiryEmail({
      name,
      email,
      orderRef: orderRef || undefined,
      message,
    }).catch(err => console.error('Contact inquiry email dispatch error:', err));

    return NextResponse.json({ success: true, inquiryId: id });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to process inquiry';
    console.error('Error saving contact inquiry:', err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
