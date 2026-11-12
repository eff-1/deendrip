import { NextResponse } from 'next/server';
import { getOrderByReferenceAsync, updateOrderPayment } from '@/lib/db';
import { sendOrderConfirmationEmail, sendAdminOrderAlertEmail } from '@/lib/email';
import { checkRateLimit, createRateLimitResponse } from '@/lib/rateLimit';
import { sanitizeIdentifier, cleanPlainText } from '@/lib/sanitize';

export async function POST(request: Request) {
  try {
    // 1. Rate Limiting: max 15 verification calls per 5 minutes per IP
    const rateCheck = checkRateLimit(request, 'payment-verify', 15, 300);
    if (!rateCheck.allowed) {
      return createRateLimitResponse(rateCheck, 'Too many payment verification attempts. Please wait.');
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
    }

    const orderReference = sanitizeIdentifier(body.orderReference, 32);
    const paymentReference = cleanPlainText(body.paymentReference, 100);

    if (!orderReference) {
      return NextResponse.json({ error: 'Order reference is required' }, { status: 400 });
    }

    // Cloud-aware lookup
    const order = await getOrderByReferenceAsync(orderReference);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Replay attack defense: if already paid, return status without re-crediting or re-sending
    if (order.paymentStatus === 'paid') {
      return NextResponse.json({ success: true, order, alreadyPaid: true });
    }

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    let paymentVerified = false;

    // Cross-verify with Paystack live API if credentials and a real reference exist
    if (paystackSecret && paymentReference && !paymentReference.startsWith('sim_')) {
      try {
        const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(paymentReference)}`, {
          headers: {
            Authorization: `Bearer ${paystackSecret}`,
          },
        });
        const data = await res.json();
        if (data.status && data.data?.status === 'success' && data.data?.amount === order.totalKobo) {
          paymentVerified = true;
        }
      } catch (err) {
        console.warn('Paystack API call error during verification:', err);
      }
    } else {
      // Test / development simulation mode
      paymentVerified = true;
    }

    if (paymentVerified) {
      const finalPaymentRef = paymentReference || `sim_${Date.now()}`;
      updateOrderPayment(orderReference, 'paid', finalPaymentRef);
      const updatedOrder = await getOrderByReferenceAsync(orderReference);

      if (updatedOrder) {
        // Asynchronously dispatch transactional emails (customer receipt & store owner alert)
        sendOrderConfirmationEmail(updatedOrder).catch(err => console.error('Confirmation email error:', err));
        sendAdminOrderAlertEmail(updatedOrder).catch(err => console.error('Admin alert email error:', err));
      }

      return NextResponse.json({ success: true, order: updatedOrder });
    } else {
      return NextResponse.json({ error: 'Payment could not be verified by provider' }, { status: 400 });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Payment verification failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
