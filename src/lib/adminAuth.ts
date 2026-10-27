import { cookies } from 'next/headers';
import { validateAdminSession, type SessionAdmin } from './db';

/**
 * Server-side utility to verify an admin session from the request cookies.
 * Returns the authenticated admin, or null if not authenticated.
 *
 * Usage in API routes:
 *   const admin = await requireAdmin();
 *   if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 */
export async function getAdminFromRequest(): Promise<SessionAdmin | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('deendrip_admin_token')?.value;
    if (!token) return null;
    return validateAdminSession(token);
  } catch {
    return null;
  }
}

/**
 * Returns the admin or throws — use in API routes with early return.
 */
export async function requireAdmin(): Promise<SessionAdmin | null> {
  return getAdminFromRequest();
}
