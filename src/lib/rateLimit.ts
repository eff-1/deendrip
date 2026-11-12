/**
 * Deen Drip - Enterprise Sliding-Window Rate Limiter
 * Guards sensitive API routes against bot floods, brute-force credential attacks, and DDoS.
 */

import { NextResponse } from 'next/server';

interface RateLimitRecord {
  timestamps: number[];
}

// In-memory sliding window store
const rateLimitStore = new Map<string, RateLimitRecord>();

// Periodic garbage collection every 5 minutes to prevent memory leaks
let lastCleanup = Date.now();
const CLEANUP_INTERVAL = 5 * 60 * 1000;

function cleanupExpired(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  const expiry = now - windowMs;
  for (const [key, record] of rateLimitStore.entries()) {
    record.timestamps = record.timestamps.filter(ts => ts > expiry);
    if (record.timestamps.length === 0) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Extracts real client IP address from various reverse proxy headers
 */
export function getClientIp(request: Request): string {
  // 1. Cloudflare header
  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp.trim();

  // 2. Standard X-Real-IP
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  // 3. X-Forwarded-For (first IP in comma-separated list is the original client)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0].trim();
    if (first) return first;
  }

  // 4. Fallback
  return '127.0.0.1';
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
}

/**
 * Evaluates request against sliding-window limits
 * @param request The incoming Next.js Request
 * @param bucket Identifier for the action (e.g. 'auth-login', 'checkout', 'contact')
 * @param maxRequests Maximum requests allowed within window
 * @param windowSeconds Duration of the rate window in seconds
 */
export function checkRateLimit(
  request: Request,
  bucket: string,
  maxRequests = 10,
  windowSeconds = 60
): RateLimitResult {
  const ip = getClientIp(request);
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  cleanupExpired(windowMs);

  let record = rateLimitStore.get(key);
  if (!record) {
    record = { timestamps: [] };
    rateLimitStore.set(key, record);
  }

  // Remove timestamps outside current window
  const windowStart = now - windowMs;
  record.timestamps = record.timestamps.filter(ts => ts > windowStart);

  if (record.timestamps.length >= maxRequests) {
    const oldest = record.timestamps[0];
    const resetSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));

    return {
      allowed: false,
      limit: maxRequests,
      remaining: 0,
      resetSeconds,
    };
  }

  // Add current request timestamp
  record.timestamps.push(now);

  const resetSeconds = Math.ceil(windowSeconds);
  const remaining = Math.max(0, maxRequests - record.timestamps.length);

  return {
    allowed: true,
    limit: maxRequests,
    remaining,
    resetSeconds,
  };
}

/**
 * Helper to generate a standardized 429 Too Many Requests response
 */
export function createRateLimitResponse(
  result: RateLimitResult,
  customMessage?: string
): NextResponse {
  const message = customMessage || `Too many requests. Please slow down and try again in ${result.resetSeconds} seconds.`;

  return NextResponse.json(
    {
      error: message,
      retryAfter: result.resetSeconds,
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(result.resetSeconds),
        'X-RateLimit-Limit': String(result.limit),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(result.resetSeconds),
      },
    }
  );
}
