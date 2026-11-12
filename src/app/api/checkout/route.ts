import { NextResponse } from 'next/server';
import { validateAndCalculateOrder } from '@/lib/payment';
import { createOrderWithItems } from '@/lib/db';
import { generateOrderReference } from '@/lib/auth';
import { checkRateLimit, createRateLimitResponse } from '@/lib/rateLimit';
import { cleanPlainText, sanitizeEmail, sanitizePhone } from '@/lib/sanitize';

export async function POST(request: Request) {
  try {
    // 1. Rate Limiting: max 12 order creations per 10 minutes per IP
    const rateCheck = checkRateLimit(request, 'checkout-order', 12, 600);
    if (!rateCheck.allowed) {
      return createRateLimitResponse(rateCheck, 'Too many order requests. Please wait a moment before trying again.');
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
    }

    const {
      customerName,
      customerEmail,
      customerPhone,
      deliveryAddress,
      deliveryCity,
      deliveryState,
      items,
    } = body;

    // Strict sanitization & validation
    const cleanName = cleanPlainText(customerName, 100);
    if (!cleanName || cleanName.length < 2) {
      return NextResponse.json({ error: 'Please enter a valid full name' }, { status: 400 });
    }

    const cleanMail = sanitizeEmail(customerEmail);
    if (!cleanMail) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }

    const cleanTel = sanitizePhone(customerPhone);
    if (!cleanTel) {
      return NextResponse.json({ error: 'Please enter a valid phone number for delivery updates' }, { status: 400 });
    }

    const cleanAddr = cleanPlainText(deliveryAddress, 300);
    if (!cleanAddr || cleanAddr.length < 5) {
      return NextResponse.json({ error: 'Please enter a complete street address' }, { status: 400 });
    }

    const cleanCity = cleanPlainText(deliveryCity, 100);
    const cleanState = cleanPlainText(deliveryState, 100);
    if (!cleanCity || !cleanState) {
      return NextResponse.json({ error: 'Please select both city and state' }, { status: 400 });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Your cart is empty' }, { status: 400 });
    }

    if (items.length > 50) {
      return NextResponse.json({ error: 'Cart item limit exceeded' }, { status: 400 });
    }

    // Authoritative server calculation & stock check using exact rate cards
    const calculation = validateAndCalculateOrder(items, cleanState, cleanCity, cleanAddr);

    // Generate unique order reference
    const orderReference = generateOrderReference();

    // Persist order with ACID transaction & stock deduction
    const order = createOrderWithItems({
      orderReference,
      customerName: cleanName,
      customerEmail: cleanMail,
      customerPhone: cleanTel,
      deliveryAddress: cleanAddr,
      deliveryCity: cleanCity,
      deliveryState: cleanState,
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
