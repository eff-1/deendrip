import crypto from 'node:crypto';

const ITERATIONS = 100000;
const KEY_LEN = 64;
const DIGEST = 'sha512';

/**
 * Hash password with PBKDF2 and random salt
 */
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LEN, DIGEST).toString('hex');
  return { hash, salt };
}

/**
 * Verify password against stored hash and salt
 */
export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const derived = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LEN, DIGEST).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(derived, 'hex'), Buffer.from(hash, 'hex'));
}

/**
 * Generate a cryptographically secure random token (e.g. for session IDs or order refs)
 */
export function generateToken(bytes: number = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

/**
 * Generate a customer-friendly order reference like DD-82914-X
 */
export function generateOrderReference(): string {
  const num = Math.floor(10000 + Math.random() * 90000);
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const char = chars.charAt(Math.floor(Math.random() * chars.length));
  return `DD-${num}-${char}`;
}

export interface AdminTokenPayload {
  id: string;
  email: string;
  name: string;
  role: string;
  exp: number;
}

const ADMIN_SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET ||
  process.env.PAYSTACK_SECRET_KEY ||
  'deendrip_sec_prod_admin_session_auth_2026_9831!';

/**
 * Creates a cryptographically signed (HMAC-SHA256) session token.
 * This guarantees stateless validation across multiple serverless lambda instances.
 */
export function createSignedAdminToken(
  admin: { id: string; email: string; name: string; role: string },
  expiresInDays: number = 7
): string {
  const payload: AdminTokenPayload = {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
    exp: Date.now() + expiresInDays * 24 * 60 * 60 * 1000,
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', ADMIN_SESSION_SECRET).update(payloadB64).digest('base64url');
  return `${payloadB64}.${signature}`;
}

/**
 * Validates an HMAC-SHA256 signed session token in constant time.
 * Returns the decoded admin or null if invalid or expired.
 */
export function verifySignedAdminToken(
  token: string
): { id: string; email: string; name: string; role: string } | null {
  if (!token || typeof token !== 'string' || !token.includes('.')) {
    return null;
  }
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payloadB64, sig] = parts;

  try {
    const expectedSig = crypto.createHmac('sha256', ADMIN_SESSION_SECRET).update(payloadB64).digest('base64url');
    const sigBuf = Buffer.from(sig);
    const expBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }

    const payload: AdminTokenPayload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (!payload.exp || Date.now() > payload.exp) {
      return null;
    }
    return {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

