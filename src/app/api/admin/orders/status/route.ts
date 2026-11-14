import { NextResponse } from 'next/server';
import { updateOrderFulfillmentAsync, logAdminAction, getOrderByReferenceAsync } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';
import { sendOrderShippedEmail } from '@/lib/email';
import type { FulfillmentStatus } from '@/lib/types';

const VALID_STATUSES: string[] = ['pending', 'processing', 'packed', 'shipped', 'dispatched', 'out_for_delivery', 'delivered', 'cancelled'];

export async function POST(request: Request) {
  // Require authenticated admin session
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => null);
    if (!body) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

    const { orderReference, fulfillmentStatus, trackingReference, carrier, note, sendEmail } = body;

    if (!orderReference || !fulfillmentStatus) {
      return NextResponse.json({ error: 'Order reference and status required' }, { status: 400 });
    }

    if (!VALID_STATUSES.includes(fulfillmentStatus)) {
      return NextResponse.json({ error: `Invalid fulfillment status: ${fulfillmentStatus}` }, { status: 400 });
    }

    // Normalize status for standard DB enum
    let normalizedStatus: FulfillmentStatus = 'pending';
    if (fulfillmentStatus === 'processing' || fulfillmentStatus === 'packed') normalizedStatus = 'processing';
    else if (fulfillmentStatus === 'shipped' || fulfillmentStatus === 'dispatched') normalizedStatus = 'shipped';
    else if (fulfillmentStatus === 'out_for_delivery') normalizedStatus = 'out_for_delivery';
    else if (fulfillmentStatus === 'delivered') normalizedStatus = 'delivered';
    else if (fulfillmentStatus === 'cancelled') normalizedStatus = 'cancelled';

    const success = await updateOrderFulfillmentAsync(
      orderReference,
      normalizedStatus,
      trackingReference || undefined,
      carrier || undefined,
      note || undefined,
      admin.name
    );

    if (!success) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    logAdminAction(
      admin.id,
      admin.email,
      'UPDATE_FULFILLMENT',
      'order',
      orderReference,
      `Status → ${fulfillmentStatus} | Carrier: ${carrier || 'Direct/Courier'} | Waybill: ${trackingReference || 'N/A'}`
    );

    let emailSent = false;
    // Dispatch customer tracking notice when shipped or out for delivery if requested
    if (sendEmail !== false && (normalizedStatus === 'shipped' || normalizedStatus === 'out_for_delivery' || normalizedStatus === 'delivered')) {
      try {
        const order = await getOrderByReferenceAsync(orderReference);
        if (order && order.customerEmail) {
          const displayTracking = carrier && trackingReference ? `${carrier} (${trackingReference})` : (trackingReference || carrier || undefined);
          emailSent = await sendOrderShippedEmail(order, displayTracking);
        }
      } catch (emailErr) {
        console.error('Failed to dispatch status email:', emailErr);
      }
    }

    return NextResponse.json({
      success: true,
      orderReference,
      fulfillmentStatus: normalizedStatus,
      carrier: carrier || null,
      trackingReference: trackingReference || null,
      emailSent
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to update order status';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
