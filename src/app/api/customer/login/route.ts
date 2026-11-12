import { NextResponse } from 'next/server';
import { verifyCustomerLogin } from '@/lib/customer';
import { checkRateLimit, createRateLimitResponse } from '@/lib/rateLimit';
import { cleanPlainText } from '@/lib/sanitize';

export async function POST(req: Request) {
  try {
    // 1. Rate Limiting: 6 login attempts per 5 minutes per IP
    const rateCheck = checkRateLimit(req, 'customer-login', 6, 300);
    if (!rateCheck.allowed) {
      return createRateLimitResponse(rateCheck, 'Too many login attempts. For your security, please wait a few minutes before trying again.');
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
    }

    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Email/Username and password are required.' },
        { status: 400 }
      );
    }

    const cleanIdentifier = cleanPlainText(identifier, 100);

    const customer = await verifyCustomerLogin(cleanIdentifier, String(password));
    if (!customer) {
      return NextResponse.json(
        { error: 'Invalid email/username or password. Please try again.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        username: customer.username,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
        streetAddress: customer.streetAddress,
        city: customer.city,
        state: customer.state,
      },
    });
  } catch (err: unknown) {
    console.error('Customer login error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Login failed' },
      { status: 500 }
    );
  }
}
