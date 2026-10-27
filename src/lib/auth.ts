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
