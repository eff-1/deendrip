import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { deleteAdminSession, logAdminAction, validateAdminSession } from '@/lib/db';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('deendrip_admin_token')?.value;

    if (token) {
      // Validate and log before deleting
      const admin = validateAdminSession(token);
      if (admin) {
        logAdminAction(admin.id, admin.email, 'LOGOUT', 'session');
      }
      deleteAdminSession(token);
    }

    cookieStore.delete('deendrip_admin_token');
    return NextResponse.json({ success: true });
  } catch {
    // Always clear the cookie even on error
    const cookieStore = await cookies();
    cookieStore.delete('deendrip_admin_token');
    return NextResponse.json({ success: true });
  }
}
