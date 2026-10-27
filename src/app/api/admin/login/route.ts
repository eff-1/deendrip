import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb, createAdminSession, logAdminAction } from '@/lib/db';
import { verifyPassword, generateToken } from '@/lib/auth';

// Simple in-memory rate limiter — keyed by IP, allowing max 10 attempts per 15 min window
const loginAttempts = new Map<string, { count: number; windowStart: number }>();
const MAX_ATTEMPTS = 10;
const WINDOW_MS = 15 * 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry || now - entry.windowStart > WINDOW_MS) {
    loginAttempts.set(ip, { count: 1, windowStart: now });
    return true;
  }
  entry.count += 1;
  if (entry.count > MAX_ATTEMPTS) return false;
  return true;
}

export async function POST(request: Request) {
  try {
    // Rate limiting by IP
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Too many login attempts. Please try again in 15 minutes.' }, { status: 429 });
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    if (typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const db = getDb();
    const admin = db.prepare('SELECT * FROM admins WHERE email = ?').get(email.trim().toLowerCase()) as {
      id: string;
      email: string;
      password_hash: string;
      salt: string;
      name: string;
      role: string;
    } | undefined;

    // Constant-time failure — always run verifyPassword even if admin not found (using dummy values)
    const isValid = admin
      ? verifyPassword(password, admin.password_hash, admin.salt)
      : (verifyPassword(password, 'a'.repeat(128), 'a'.repeat(32)), false);

    if (!admin || !isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Create a real server-side session
    const token = generateToken(48);
    createAdminSession(admin.id, token);
    logAdminAction(admin.id, admin.email, 'LOGIN', 'session');

    // Set secure HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set('deendrip_admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Login failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
