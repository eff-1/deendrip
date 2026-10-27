import { NextResponse } from 'next/server';
import { updateOrderFulfillment, logAdminAction } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';
import type { FulfillmentStatus } from '@/lib/types';

const VALID_STATUSES: FulfillmentStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export async function POST(request: Request) {
  // Require authenticated admin session
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => null);
    if (!body) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

    const { orderReference, fulfillmentStatus, trackingReference } = body;

    if (!orderReference || !fulfillmentStatus) {
      return NextResponse.json({ error: 'Order reference and status required' }, { status: 400 });
    }

    if (!VALID_STATUSES.includes(fulfillmentStatus)) {
      return NextResponse.json({ error: `Invalid fulfillment status: ${fulfillmentStatus}` }, { status: 400 });
    }

    const success = updateOrderFulfillment(orderReference, fulfillmentStatus, trackingReference || undefined);
    if (!success) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    logAdminAction(admin.id, admin.email, 'UPDATE_FULFILLMENT', 'order', orderReference,
      `Status → ${fulfillmentStatus}${trackingReference ? ` | Tracking: ${trackingReference}` : ''}`);

    return NextResponse.json({ success: true, orderReference, fulfillmentStatus });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to update order status';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
