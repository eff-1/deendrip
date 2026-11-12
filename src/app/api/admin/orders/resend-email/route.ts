import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { getOrderByReferenceAsync, logAdminAction } from '@/lib/db';
import { sendOrderConfirmationEmail, sendOrderShippedEmail } from '@/lib/email';

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => null);
    if (!body || !body.orderReference || !body.type) {
      return NextResponse.json({ error: 'orderReference and type (confirmation | shipped) are required' }, { status: 400 });
    }

    const { orderReference, type, targetEmail } = body;
    const order = await getOrderByReferenceAsync(orderReference);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Allow override of target email if customer changed email or requested to alternate address
    const targetOrder = targetEmail ? { ...order, customerEmail: targetEmail.trim().toLowerCase() } : order;

    let success = false;
    if (type === 'confirmation') {
      success = await sendOrderConfirmationEmail(targetOrder);
    } else if (type === 'shipped') {
      success = await sendOrderShippedEmail(targetOrder, targetOrder.trackingReference || undefined);
    } else {
      return NextResponse.json({ error: 'Invalid email type. Must be confirmation or shipped' }, { status: 400 });
    }

    logAdminAction(admin.id, admin.email, 'RESEND_EMAIL', 'order', orderReference, `Type: ${type} → ${targetOrder.customerEmail}`);

    return NextResponse.json({ success, recipient: targetOrder.customerEmail, type });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to resend email';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
