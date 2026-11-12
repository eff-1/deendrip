import type { Order } from './types';
import { formatNaira } from './formatters';
import { getTursoClient } from './turso';
import { getDb } from './db';
import nodemailer from 'nodemailer';

const STORE_OWNER_EMAIL = process.env.STORE_NOTIFICATION_EMAIL || 'deendripclothing@gmail.com';
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || process.env.SMTP_FROM || 'Deen Drip <deendripclothing@gmail.com>';

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  emailType?: 'order_confirmation' | 'admin_alert' | 'contact_inquiry' | 'test';
  orderReference?: string;
}

export interface EmailLogEntry {
  id: string;
  recipient: string;
  subject: string;
  emailType: string;
  orderReference: string | null;
  status: 'delivered' | 'simulated' | 'failed';
  provider: 'resend' | 'smtp' | 'simulation';
  errorMessage: string | null;
  createdAt: string;
}

/**
 * Universal Email Dispatcher:
 * 1. If RESEND_API_KEY is configured, sends via Resend REST API
 * 2. If SMTP_PASS / EMAIL_SERVER_PASSWORD is configured, sends via Nodemailer (Gmail App Password, Brevo, AWS SES, etc.)
 * 3. If no credentials configured yet, logs simulation safely
 * 4. Logs every email to Turso Cloud & Local Database for audit trails
 */
export async function sendEmail({
  to,
  subject,
  html,
  emailType = 'test',
  orderReference,
}: SendEmailParams): Promise<{ success: boolean; provider: string; error?: string }> {
  const recipientStr = Array.isArray(to) ? to.join(', ') : to;
  const now = new Date().toISOString();
  const logId = `eml_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // 1. Try Resend API first if RESEND_API_KEY is present
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: FROM_EMAIL.includes('@resend.dev') ? FROM_EMAIL : 'Deen Drip <onboarding@resend.dev>',
          to: Array.isArray(to) ? to : [to],
          subject,
          html,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        console.log(`✓ Email delivered via Resend API to ${recipientStr} (ID: ${data.id})`);
        await recordEmailLog({
          id: logId,
          recipient: recipientStr,
          subject,
          emailType,
          orderReference: orderReference || null,
          status: 'delivered',
          provider: 'resend',
          errorMessage: null,
          createdAt: now,
        });
        return { success: true, provider: 'resend' };
      } else {
        const errorMsg = data.message || JSON.stringify(data);
        console.warn(`Resend failed, checking SMTP fallback: ${errorMsg}`);
        // If Resend failed, don't return yet; attempt SMTP if configured
      }
    } catch (err: unknown) {
      console.warn('Resend fetch failed, checking SMTP fallback:', err);
    }
  }

  // 2. Try SMTP / Nodemailer (e.g. Gmail App Password: SMTP_USER=deendripclothing@gmail.com, SMTP_PASS=xxxx)
  const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_SERVER_PASSWORD;
  const smtpUser = process.env.SMTP_USER || process.env.EMAIL_SERVER_USER || STORE_OWNER_EMAIL;
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = Number(process.env.SMTP_PORT) || 465;

  if (smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME || 'Deen Drip'}" <${smtpUser}>`,
        to: recipientStr,
        subject,
        html,
      });

      console.log(`✓ Email delivered via SMTP (${smtpHost}) to ${recipientStr}`);
      await recordEmailLog({
        id: logId,
        recipient: recipientStr,
        subject,
        emailType,
        orderReference: orderReference || null,
        status: 'delivered',
        provider: 'smtp',
        errorMessage: null,
        createdAt: now,
      });
      return { success: true, provider: 'smtp' };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error(`SMTP delivery error to ${recipientStr}:`, errorMsg);
      await recordEmailLog({
        id: logId,
        recipient: recipientStr,
        subject,
        emailType,
        orderReference: orderReference || null,
        status: 'failed',
        provider: 'smtp',
        errorMessage: errorMsg,
        createdAt: now,
      });
      return { success: false, provider: 'smtp', error: errorMsg };
    }
  }

  // 3. Fallback: Safe Simulation Mode (Credentials not set yet)
  console.log('\n📧 [EMAIL SIMULATION — No Live Email Provider Configured]');
  console.log(`To: ${recipientStr}`);
  console.log(`Subject: ${subject}`);
  console.log(`Type: ${emailType} | Order: ${orderReference || 'N/A'}`);
  console.log('✓ Email recorded to Turso database email_logs\n');

  await recordEmailLog({
    id: logId,
    recipient: recipientStr,
    subject,
    emailType,
    orderReference: orderReference || null,
    status: 'simulated',
    provider: 'simulation',
    errorMessage: null,
    createdAt: now,
  });

  return { success: true, provider: 'simulation' };
}

/**
 * Persists email dispatch records into local SQLite and Turso Cloud
 */
async function recordEmailLog(entry: EmailLogEntry) {
  try {
    const db = getDb();
    db.prepare(`
      INSERT INTO email_logs (id, recipient, subject, email_type, order_reference, status, provider, error_message, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      entry.id,
      entry.recipient,
      entry.subject,
      entry.emailType,
      entry.orderReference,
      entry.status,
      entry.provider,
      entry.errorMessage,
      entry.createdAt
    );
  } catch (err) {
    console.warn('Local email log save error:', err);
  }

  try {
    const turso = getTursoClient();
    if (turso) {
      await turso.execute({
        sql: `INSERT INTO email_logs (id, recipient, subject, email_type, order_reference, status, provider, error_message, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          entry.id,
          entry.recipient,
          entry.subject,
          entry.emailType,
          entry.orderReference,
          entry.status,
          entry.provider,
          entry.errorMessage,
          entry.createdAt,
        ],
      });
    }
  } catch (err) {
    console.warn('Turso email log sync error:', err);
  }
}

/**
 * Retrieves the latest email logs (useful for admin portal and verification testing)
 */
export async function getEmailLogs(limit = 20): Promise<EmailLogEntry[]> {
  const turso = getTursoClient();
  if (turso) {
    try {
      const res = await turso.execute({
        sql: `SELECT * FROM email_logs ORDER BY created_at DESC LIMIT ?`,
        args: [limit],
      });
      return res.rows.map(r => ({
        id: String(r.id),
        recipient: String(r.recipient),
        subject: String(r.subject),
        emailType: String(r.email_type),
        orderReference: r.order_reference ? String(r.order_reference) : null,
        status: String(r.status) as 'delivered' | 'simulated' | 'failed',
        provider: String(r.provider) as 'resend' | 'smtp' | 'simulation',
        errorMessage: r.error_message ? String(r.error_message) : null,
        createdAt: String(r.created_at),
      }));
    } catch {
      // Fall back to local SQLite
    }
  }

  try {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM email_logs ORDER BY created_at DESC LIMIT ?').all(limit) as any[];
    return rows.map(r => ({
      id: r.id,
      recipient: r.recipient,
      subject: r.subject,
      emailType: r.email_type,
      orderReference: r.order_reference,
      status: r.status,
      provider: r.provider,
      errorMessage: r.error_message,
      createdAt: r.created_at,
    }));
  } catch {
    return [];
  }
}

/**
 * 1. Customer Order Confirmation Email (Luxury Streetwear Dark Theme)
 */
export async function sendOrderConfirmationEmail(order: Order): Promise<boolean> {
  const items = order.items || [];
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #222634; color: #f1f5f9; font-size: 14px; font-weight: 600;">
        ${item.productNameSnapshot}
        <div style="font-size: 12px; color: #94a3b8; font-weight: normal; margin-top: 2px;">
          Size: ${item.variantNameSnapshot} · Qty: ${item.quantity}
        </div>
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #222634; color: #38bdf8; font-size: 14px; font-weight: 700; text-align: right;">
        ${formatNaira(item.subtotalKobo)}
      </td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Confirmed - Deen Drip</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #06070a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #06070a; padding: 40px 15px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #0d111a; border: 1px solid #222634; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
              
              <!-- Brand Header -->
              <tr>
                <td style="padding: 32px 36px 24px 36px; background: linear-gradient(180deg, #121826 0%, #0d111a 100%); border-bottom: 1px solid #222634; text-align: center;">
                  <div style="font-size: 24px; font-weight: 900; letter-spacing: 0.15em; color: #ffffff; text-transform: uppercase;">
                    DEEN DRIP
                  </div>
                  <div style="font-size: 11px; letter-spacing: 0.2em; color: #38bdf8; text-transform: uppercase; margin-top: 4px;">
                    FAITH · CULTURE · CONTEMPORARY STREETWEAR
                  </div>
                </td>
              </tr>

              <!-- Greeting & Order Status -->
              <tr>
                <td style="padding: 32px 36px;">
                  <div style="display: inline-block; font-size: 11px; font-weight: 800; letter-spacing: 0.12em; color: #10b981; background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.3); padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; margin-bottom: 16px;">
                    ✓ PAYMENT CONFIRMED & SETTLED
                  </div>

                  <h1 style="font-size: 22px; font-weight: 800; color: #ffffff; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: -0.02em;">
                    Salam, ${order.customerName}
                  </h1>
                  <p style="font-size: 14px; line-height: 1.6; color: #94a3b8; margin: 0 0 24px 0;">
                    Your order has been secured and confirmed. Our packaging team is preparing your authentic pieces for dispatch.
                  </p>

                  <!-- Reference Callout -->
                  <div style="background-color: #121722; border: 1px solid #222634; border-radius: 8px; padding: 16px 20px; margin-bottom: 28px;">
                    <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; font-weight: 700;">
                      Order Reference
                    </div>
                    <div style="font-size: 20px; font-weight: 900; color: #38bdf8; letter-spacing: 0.05em; margin-top: 4px; font-family: monospace;">
                      ${order.orderReference}
                    </div>
                  </div>

                  <!-- Order Summary Table -->
                  <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #ffffff; margin-bottom: 12px;">
                    Order Summary
                  </div>
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                    ${itemsHtml}
                  </table>

                  <!-- Price Breakdown -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 28px; border-top: 1px solid #222634; padding-top: 16px;">
                    <tr>
                      <td style="color: #94a3b8; font-size: 13px; padding: 4px 0;">Subtotal</td>
                      <td style="color: #f1f5f9; font-size: 13px; font-weight: 700; text-align: right; padding: 4px 0;">
                        ${formatNaira(order.subtotalKobo)}
                      </td>
                    </tr>
                    <tr>
                      <td style="color: #94a3b8; font-size: 13px; padding: 4px 0;">Delivery Fee (${order.deliveryState})</td>
                      <td style="color: #f1f5f9; font-size: 13px; font-weight: 700; text-align: right; padding: 4px 0;">
                        ${order.deliveryFeeKobo === 0 ? 'FREE (Lagos Promo)' : formatNaira(order.deliveryFeeKobo)}
                      </td>
                    </tr>
                    <tr>
                      <td style="color: #ffffff; font-size: 16px; font-weight: 900; padding: 12px 0 0 0; text-transform: uppercase;">Total Paid</td>
                      <td style="color: #38bdf8; font-size: 18px; font-weight: 900; text-align: right; padding: 12px 0 0 0;">
                        ${formatNaira(order.totalKobo)}
                      </td>
                    </tr>
                  </table>

                  <!-- Shipping Destination -->
                  <div style="background-color: #121722; border: 1px solid #222634; border-radius: 8px; padding: 16px 20px; margin-bottom: 28px;">
                    <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; font-weight: 700;">
                      Shipping Destination
                    </div>
                    <div style="font-size: 14px; font-weight: 700; color: #f1f5f9; margin-top: 4px;">
                      ${order.customerName} · ${order.customerPhone}
                    </div>
                    <div style="font-size: 13px; color: #94a3b8; margin-top: 2px; line-height: 1.4;">
                      ${order.deliveryAddress}, ${order.deliveryCity}, ${order.deliveryState}
                    </div>
                  </div>

                  <!-- CTA Button -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center">
                        <a href="https://deendrip.com/orders?ref=${order.orderReference}" style="display: inline-block; background-color: #0284c7; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; padding: 14px 28px; border-radius: 9999px; box-shadow: 0 4px 16px rgba(2, 132, 199, 0.4);">
                          Track Order in Real-Time →
                        </a>
                      </td>
                    </tr>
                  </table>

                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 24px 36px; background-color: #0a0d14; border-top: 1px solid #222634; text-align: center;">
                  <p style="font-size: 12px; color: #64748b; margin: 0 0 8px 0;">
                    Have questions regarding your order? Reply directly to this email or reach us on WhatsApp: <strong>+234 906 414 7689</strong>.
                  </p>
                  <p style="font-size: 11px; color: #475569; margin: 0;">
                    © ${new Date().getFullYear()} Deen Drip. Lagos, Nigeria. All rights reserved.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const res = await sendEmail({
    to: order.customerEmail,
    subject: `Order Confirmed: ${order.orderReference} (${formatNaira(order.totalKobo)}) - Deen Drip`,
    html,
    emailType: 'order_confirmation',
    orderReference: order.orderReference,
  });

  return res.success;
}

/**
 * 2. Store Owner Order Alert Email (deendripclothing@gmail.com)
 */
export async function sendAdminOrderAlertEmail(order: Order): Promise<boolean> {
  const items = order.items || [];
  const itemsText = items.map(i => `• ${i.productNameSnapshot} (Size: ${i.variantNameSnapshot}, Qty: ${i.quantity})`).join('<br/>');
  const cleanPhone = order.customerPhone.replace(/[^0-9]/g, '');

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; color: #0f172a; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <div style="display: inline-block; background: #0284c7; color: white; font-size: 11px; font-weight: 800; padding: 4px 8px; border-radius: 4px; text-transform: uppercase;">
          New Paid Order
        </div>
        <h2 style="color: #0f172a; margin: 12px 0 4px 0;">Reference: ${order.orderReference}</h2>
        <p style="font-size: 18px; font-weight: bold; color: #0284c7; margin: 0 0 16px 0;">${formatNaira(order.totalKobo)}</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
        
        <h3 style="font-size: 14px; text-transform: uppercase; color: #64748b; margin-bottom: 8px;">Customer Details:</h3>
        <p style="margin: 4px 0;"><strong>Name:</strong> ${order.customerName}</p>
        <p style="margin: 4px 0;"><strong>Email:</strong> <a href="mailto:${order.customerEmail}">${order.customerEmail}</a></p>
        <p style="margin: 4px 0;"><strong>Phone / WhatsApp:</strong> <a href="https://wa.me/${cleanPhone}" style="color: #25D366; font-weight: bold;">${order.customerPhone} (Click to Chat)</a></p>
        <p style="margin: 4px 0;"><strong>Delivery Address:</strong> ${order.deliveryAddress}, ${order.deliveryCity}, ${order.deliveryState}</p>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
        <h3 style="font-size: 14px; text-transform: uppercase; color: #64748b; margin-bottom: 8px;">Items to Pack:</h3>
        <div style="background: #f1f5f9; padding: 12px 16px; border-radius: 6px; font-size: 14px; line-height: 1.8;">
          ${itemsText}
        </div>
        
        <div style="margin-top: 24px; text-align: center;">
          <a href="https://deendrip.com/admin" style="display: inline-block; background: #0f172a; color: #ffffff; padding: 14px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 14px;">
            Open Admin Portal to Fulfill Order →
          </a>
        </div>
      </div>
    </body>
    </html>
  `;

  const res = await sendEmail({
    to: STORE_OWNER_EMAIL,
    subject: `💰 NEW PAID ORDER: ${order.orderReference} - ${order.customerName} (${formatNaira(order.totalKobo)})`,
    html,
    emailType: 'admin_alert',
    orderReference: order.orderReference,
  });

  return res.success;
}

/**
 * 3. Customer Contact Inquiry Forwarder & Auto-Reply
 */
export async function sendContactInquiryEmail(inquiry: {
  name: string;
  email: string;
  orderRef?: string;
  message: string;
}): Promise<boolean> {
  const adminHtml = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: sans-serif; background: #f8fafc; color: #0f172a; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px;">
        <h2 style="color: #0284c7; margin-top: 0;">💬 New Customer Inquiry on Deen Drip</h2>
        <p><strong>Customer Name:</strong> ${inquiry.name}</p>
        <p><strong>Customer Email:</strong> <a href="mailto:${inquiry.email}">${inquiry.email}</a></p>
        <p><strong>Order Reference:</strong> ${inquiry.orderRef || 'None specified'}</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
        <p><strong>Message:</strong></p>
        <blockquote style="background: #f1f5f9; padding: 14px 18px; border-left: 4px solid #0284c7; margin: 0; border-radius: 4px;">
          ${inquiry.message.replace(/\n/g, '<br/>')}
        </blockquote>
      </div>
    </body>
    </html>
  `;

  // Send to Store Owner
  await sendEmail({
    to: STORE_OWNER_EMAIL,
    subject: `💬 Customer Inquiry: ${inquiry.name} ${inquiry.orderRef ? `(${inquiry.orderRef})` : ''}`,
    html: adminHtml,
    emailType: 'contact_inquiry',
    orderReference: inquiry.orderRef,
  });

  // Auto-acknowledgment to customer
  const customerHtml = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: sans-serif; background: #06070a; color: #f8fafc; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: #0d111a; border: 1px solid #222634; border-radius: 12px; padding: 28px;">
        <div style="font-size: 20px; font-weight: 900; letter-spacing: 0.15em; color: #ffffff; text-align: center; margin-bottom: 20px;">
          DEEN DRIP
        </div>
        <h2 style="color: #ffffff; font-size: 18px; margin-top: 0;">Salam ${inquiry.name},</h2>
        <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">
          We have received your message regarding ${inquiry.orderRef ? `Order #${inquiry.orderRef}` : 'your inquiry'}. Our team is reviewing it and will respond directly to this email shortly.
        </p>
        <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">
          Need immediate support? Reach us directly on WhatsApp at <strong>+234 906 414 7689</strong>.
        </p>
        <div style="border-top: 1px solid #222634; margin-top: 24px; padding-top: 16px; font-size: 12px; color: #64748b; text-align: center;">
          Deen Drip Lagos · Faith, Culture & Streetwear
        </div>
      </div>
    </body>
    </html>
  `;

  const res = await sendEmail({
    to: inquiry.email,
    subject: `We received your message - Deen Drip Support`,
    html: customerHtml,
    emailType: 'contact_inquiry',
    orderReference: inquiry.orderRef,
  });

  return res.success;
}

/**
 * 4. Interactive Test Email (verifies inbox delivery for store owner or test address)
 */
export async function sendTestEmail(toEmail: string): Promise<{ success: boolean; provider: string; error?: string }> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: sans-serif; background: #06070a; color: #ffffff; padding: 30px;">
      <div style="max-width: 500px; margin: 0 auto; background: #0d111a; border: 1px solid #222634; border-radius: 10px; padding: 28px; text-align: center;">
        <div style="font-size: 24px; font-weight: 900; letter-spacing: 0.15em; color: #38bdf8; margin-bottom: 12px;">
          DEEN DRIP
        </div>
        <h2 style="color: #ffffff; margin: 0 0 12px 0;">🚀 Real Email System Verification</h2>
        <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
          Alhamdulillah! Your Deen Drip automated email engine is functioning with 100% operational integrity.
        </p>
        <div style="background: #121826; border: 1px solid #222634; padding: 14px; border-radius: 8px; font-size: 13px; color: #10b981; font-weight: bold;">
          ✓ Delivery Verified at ${new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' })} WAT
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: toEmail,
    subject: `⚡ Deen Drip Email Verification Test (${new Date().toLocaleTimeString()})`,
    html,
    emailType: 'test',
  });
}
