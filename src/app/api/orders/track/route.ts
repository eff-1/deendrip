import { NextResponse } from 'next/server';
import { getOrderByReference, getOrdersByCustomerEmail } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { query } = await req.json();
    const cleanQuery = (query || '').trim();

    if (!cleanQuery) {
      return NextResponse.json(
        { error: 'Please provide an order reference or email address' },
        { status: 400 }
      );
    }

    // 1. Try order reference first (e.g. DD-XXXXX or exact match)
    const singleOrder = getOrderByReference(cleanQuery);
    if (singleOrder) {
      return NextResponse.json({
        orders: [singleOrder],
      });
    }

    // 2. If it contains an '@', search by customer email
    if (cleanQuery.includes('@')) {
      const emailOrders = getOrdersByCustomerEmail(cleanQuery);
      return NextResponse.json({
        orders: emailOrders,
      });
    }

    return NextResponse.json({
      orders: [],
      message: 'No orders found for the provided reference or email.',
    });
  } catch (err: any) {
    console.error('Error tracking order:', err);
    return NextResponse.json(
      { error: 'Failed to look up orders' },
      { status: 500 }
    );
  }
}
