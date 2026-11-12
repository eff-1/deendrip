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

    const cleanEmail = email.trim().toLowerCase();
    const db = getDb();
    let admin = db.prepare('SELECT * FROM admins WHERE email = ?').get(cleanEmail) as {
      id: string;
      email: string;
      password_hash: string;
      salt: string;
      name: string;
      role: string;
    } | undefined;

    if (!admin) {
      const { getTursoClient } = await import('@/lib/turso');
      const turso = getTursoClient();
      if (turso) {
        try {
          const res = await turso.execute({
            sql: 'SELECT * FROM admins WHERE email = ?',
            args: [cleanEmail]
          });
          if (res.rows.length > 0) {
            const r = res.rows[0];
            admin = {
              id: String(r.id),
              email: String(r.email),
              password_hash: String(r.password_hash),
              salt: String(r.salt),
              name: String(r.name),
              role: String(r.role),
            };
            // Warm local cache
            try {
              db.prepare('INSERT OR REPLACE INTO admins (id, email, password_hash, salt, name, role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
                .run(admin.id, admin.email, admin.password_hash, admin.salt, admin.name, admin.role, new Date().toISOString());
            } catch {}
          }
        } catch (err) {
          console.error('Turso admin lookup error:', err);
        }
      }
    }

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
