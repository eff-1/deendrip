import { NextResponse } from 'next/server';
import {
  createCustomer,
  getCustomerByEmail,
  getCustomerByUsername,
} from '@/lib/customer';
import { checkRateLimit, createRateLimitResponse } from '@/lib/rateLimit';
import { cleanPlainText, sanitizeEmail, sanitizePhone, sanitizeIdentifier } from '@/lib/sanitize';

export async function POST(req: Request) {
  try {
    // 1. Rate Limiting: 5 registrations per 10 minutes per IP
    const rateCheck = checkRateLimit(req, 'customer-register', 5, 600);
    if (!rateCheck.allowed) {
      return createRateLimitResponse(rateCheck, 'Too many accounts registered from this connection. Please try again later.');
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
    }

    const {
      username,
      fullName,
      email,
      phone,
      streetAddress,
      city,
      state,
      password,
    } = body;

    if (!username || !fullName || !email || !phone || !streetAddress || !city || !state || !password) {
      return NextResponse.json(
        { error: 'All fields (username, full name, email, phone, street address, city, state, and password) are required.' },
        { status: 400 }
      );
    }

    const cleanUsername = sanitizeIdentifier(String(username).trim().toLowerCase(), 30);
    if (cleanUsername.length < 3) {
      return NextResponse.json(
        { error: 'Username must be at least 3 characters and contain only letters, numbers, hyphens or underscores.' },
        { status: 400 }
      );
    }

    const cleanEmail = sanitizeEmail(email);
    if (!cleanEmail) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const cleanPhone = sanitizePhone(phone);
    if (!cleanPhone) {
      return NextResponse.json({ error: 'Please enter a valid phone number.' }, { status: 400 });
    }

    const cleanName = cleanPlainText(fullName, 100);
    const cleanAddress = cleanPlainText(streetAddress, 300);
    const cleanCity = cleanPlainText(city, 100);
    const cleanState = cleanPlainText(state, 100);

    if (String(password).length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    // Check uniqueness
    const existingEmail = await getCustomerByEmail(cleanEmail);
    if (existingEmail) {
      return NextResponse.json(
        { error: 'An account with this email address already exists. Please sign in instead.' },
        { status: 409 }
      );
    }

    const existingUsername = await getCustomerByUsername(cleanUsername);
    if (existingUsername) {
      return NextResponse.json(
        { error: 'This username is already taken. Please choose another username.' },
        { status: 409 }
      );
    }

    const customer = await createCustomer({
      username: cleanUsername,
      fullName: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      streetAddress: cleanAddress,
      city: cleanCity,
      state: cleanState,
      password: String(password),
    });

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
    console.error('Customer registration error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Registration failed' },
      { status: 500 }
    );
  }
}
