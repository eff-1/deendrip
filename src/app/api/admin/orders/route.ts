import { NextResponse } from 'next/server';
import { getAllOrders, getOrdersCount } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';
import type { PaymentStatus, FulfillmentStatus } from '@/lib/types';

export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const paymentStatus = (searchParams.get('payment') as PaymentStatus | 'all') || 'all';
  const fulfillmentStatus = (searchParams.get('fulfillment') as FulfillmentStatus | 'all') || 'all';
  const searchQuery = searchParams.get('q') || undefined;
  const limit = parseInt(searchParams.get('limit') || '100', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  const orders = getAllOrders({ paymentStatus, fulfillmentStatus, searchQuery, limit, offset });
  const total = getOrdersCount();

  return NextResponse.json({ orders, total });
}
