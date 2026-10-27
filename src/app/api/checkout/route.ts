import { NextResponse } from 'next/server';
import { validateAndCalculateOrder } from '@/lib/payment';
import { createOrderWithItems } from '@/lib/db';
import { generateOrderReference } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      deliveryAddress,
      deliveryCity,
      deliveryState,
      items,
    } = body;

    // Server-side field validation
    if (!customerName || typeof customerName !== 'string' || customerName.trim().length < 2) {
      return NextResponse.json({ error: 'Please enter a valid full name' }, { status: 400 });
    }

    if (!customerEmail || !/^\S+@\S+\.\S+$/.test(customerEmail)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }

    if (!customerPhone || customerPhone.trim().length < 7) {
      return NextResponse.json({ error: 'Please enter a valid phone number for delivery updates' }, { status: 400 });
    }

    if (!deliveryAddress || deliveryAddress.trim().length < 5) {
      return NextResponse.json({ error: 'Please enter a complete street address' }, { status: 400 });
    }

    if (!deliveryCity || !deliveryState) {
      return NextResponse.json({ error: 'Please select both city and state' }, { status: 400 });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Your cart is empty' }, { status: 400 });
    }

    // Authoritative server calculation & stock check
    const calculation = validateAndCalculateOrder(items, deliveryState);

    // Generate unique order reference
    const orderReference = generateOrderReference();

    // Persist order with ACID transaction & stock deduction
    const order = createOrderWithItems({
      orderReference,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim().toLowerCase(),
      customerPhone: customerPhone.trim(),
      deliveryAddress: deliveryAddress.trim(),
      deliveryCity: deliveryCity.trim(),
      deliveryState: deliveryState.trim(),
      deliveryFeeKobo: calculation.deliveryFeeKobo,
      subtotalKobo: calculation.subtotalKobo,
      totalKobo: calculation.totalKobo,
      items: calculation.verifiedItems,
    });

    return NextResponse.json({
      success: true,
      orderReference: order.orderReference,
      totalKobo: order.totalKobo,
      subtotalKobo: order.subtotalKobo,
      deliveryFeeKobo: order.deliveryFeeKobo,
      customerEmail: order.customerEmail,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Checkout processing failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
