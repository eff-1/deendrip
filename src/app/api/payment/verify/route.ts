import { NextResponse } from 'next/server';
import { getOrderByReference, updateOrderPayment } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { orderReference, paymentReference } = await request.json();

    if (!orderReference) {
      return NextResponse.json({ error: 'Order reference is required' }, { status: 400 });
    }

    const order = getOrderByReference(orderReference);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.paymentStatus === 'paid') {
      return NextResponse.json({ success: true, order, alreadyPaid: true });
    }

    // In production, cross-verify with Paystack API:
    // https://api.paystack.co/transaction/verify/:reference
    // If PAYSTACK_SECRET_KEY is configured, call Paystack:
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    let paymentVerified = false;

    if (paystackSecret && paymentReference && !paymentReference.startsWith('sim_')) {
      try {
        const res = await fetch(`https://api.paystack.co/transaction/verify/${paymentReference}`, {
          headers: {
            Authorization: `Bearer ${paystackSecret}`,
          },
        });
        const data = await res.json();
        if (data.status && data.data?.status === 'success' && data.data?.amount === order.totalKobo) {
          paymentVerified = true;
        }
      } catch {
        // Fallback or network error
      }
    } else {
      // Test / development simulation verification
      paymentVerified = true;
    }

    if (paymentVerified) {
      updateOrderPayment(orderReference, 'paid', paymentReference || `sim_${Date.now()}`);
      const updatedOrder = getOrderByReference(orderReference);
      return NextResponse.json({ success: true, order: updatedOrder });
    } else {
      return NextResponse.json({ error: 'Payment could not be verified by provider' }, { status: 400 });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Payment verification failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
