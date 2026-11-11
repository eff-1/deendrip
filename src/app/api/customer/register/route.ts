import { NextResponse } from 'next/server';
import {
  createCustomer,
  getCustomerByEmail,
  getCustomerByUsername,
} from '@/lib/customer';

export async function POST(req: Request) {
  try {
    const body = await req.json();
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

    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (cleanUsername.length < 3) {
      return NextResponse.json(
        { error: 'Username must be at least 3 characters and contain only letters, numbers, hyphens or underscores.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    // Check uniqueness
    const existingEmail = getCustomerByEmail(cleanEmail);
    if (existingEmail) {
      return NextResponse.json(
        { error: 'An account with this email address already exists. Please sign in instead.' },
        { status: 409 }
      );
    }

    const existingUsername = getCustomerByUsername(cleanUsername);
    if (existingUsername) {
      return NextResponse.json(
        { error: 'This username is already taken. Please choose another username.' },
        { status: 409 }
      );
    }

    const customer = createCustomer({
      username: cleanUsername,
      fullName: fullName.trim(),
      email: cleanEmail,
      phone: phone.trim(),
      streetAddress: streetAddress.trim(),
      city: city.trim(),
      state: state.trim(),
      password,
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
