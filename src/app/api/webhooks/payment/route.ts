import { NextResponse } from 'next/server';
import { getDb, updateOrderPayment } from '@/lib/db';
import { verifyWebhookSignature } from '@/lib/payment';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-paystack-signature') || '';
    const secretKey = process.env.PAYSTACK_SECRET_KEY || '';

    // If a webhook secret is configured, enforce strict HMAC signature verification
    if (secretKey) {
      const isValid = verifyWebhookSignature(rawBody, signature, secretKey);
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
      }
    }

    const event = JSON.parse(rawBody);
    const db = getDb();
    const now = new Date().toISOString();

    // Idempotency check: log webhook event ID
    const eventId = event.data?.id ? String(event.data.id) : `evt-${Date.now()}`;
    const existing = db.prepare('SELECT id FROM webhook_logs WHERE event_id = ?').get(eventId);
    if (existing) {
      return NextResponse.json({ message: 'Event already processed' }, { status: 200 });
    }

    // Process event types
    if (event.event === 'charge.success') {
      const paymentRef = event.data?.reference;
      // In Paystack metadata, we attach orderReference
      const orderRef = event.data?.metadata?.orderReference || paymentRef;

      if (orderRef) {
        updateOrderPayment(orderRef, 'paid', paymentRef);
      }
    }

    // Record webhook log
    db.prepare(`
      INSERT INTO webhook_logs (id, event_id, event_type, payload, status, processed_at)
      VALUES (?, ?, ?, ?, 'processed', ?)
    `).run(`log-${Date.now()}`, eventId, event.event || 'unknown', rawBody, now);

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Webhook error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
