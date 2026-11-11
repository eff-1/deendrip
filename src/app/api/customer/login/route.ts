import { NextResponse } from 'next/server';
import { verifyCustomerLogin } from '@/lib/customer';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Email/Username and password are required.' },
        { status: 400 }
      );
    }

    const customer = verifyCustomerLogin(identifier, password);
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
