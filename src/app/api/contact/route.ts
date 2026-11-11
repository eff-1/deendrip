import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { name, email, orderRef, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email and message are required' },
        { status: 400 }
      );
    }

    const db = getDb();

    // Ensure contact_inquiries table exists
    db.exec(`
      CREATE TABLE IF NOT EXISTS contact_inquiries (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        order_ref TEXT,
        message TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);

    const id = `inq-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO contact_inquiries (id, name, email, order_ref, message, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, name, email, orderRef || null, message, now);

    // If RESEND_API_KEY is configured in the environment, dispatch notification email to deendripclothing@gmail.com
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Deen Drip Inquiries <onboarding@resend.dev>',
            to: ['deendripclothing@gmail.com'],
            subject: `New Customer Inquiry: ${name} ${orderRef ? `(${orderRef})` : ''}`,
            html: `
              <h2>New Message on Deen Drip Contact Form</h2>
              <p><strong>Customer Name:</strong> ${name}</p>
              <p><strong>Customer Email:</strong> ${email}</p>
              <p><strong>Order Reference:</strong> ${orderRef || 'None specified'}</p>
              <p><strong>Message:</strong></p>
              <blockquote style="background:#f1f5f9;padding:12px;border-left:4px solid #0284c7;">
                ${message.replace(/\n/g, '<br/>')}
              </blockquote>
              <p><em>Received at: ${now}</em></p>
            `,
          }),
        });
      } catch (err) {
        console.error('Failed to dispatch contact email via Resend:', err);
      }
    }

    return NextResponse.json({ success: true, inquiryId: id });
  } catch (err: any) {
    console.error('Error saving contact inquiry:', err);
    return NextResponse.json(
      { error: 'Failed to process inquiry' },
      { status: 500 }
    );
  }
}
