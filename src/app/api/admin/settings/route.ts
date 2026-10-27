import { NextResponse } from 'next/server';
import { getAllStoreSettings, setStoreSetting, logAdminAction } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';

// Keys that can be edited via the admin panel — prevents arbitrary key injection
const ALLOWED_KEYS = new Set([
  'store_name',
  'announcement_bar',
  'announcement_bar_enabled',
  'support_email',
  'support_phone',
  'instagram_url',
  'twitter_url',
  'hero_slides',
  'returns_policy',
  'faq_content',
]);

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ settings: getAllStoreSettings() });
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

    const updated: string[] = [];
    const rejected: string[] = [];

    for (const [key, value] of Object.entries(body)) {
      if (!ALLOWED_KEYS.has(key)) {
        rejected.push(key);
        continue;
      }
      if (typeof value !== 'string') {
        rejected.push(key);
        continue;
      }
      // Sanitise: reject values longer than 50KB or containing script injection
      if (value.length > 50000 || /<script/i.test(value)) {
        rejected.push(key);
        continue;
      }
      setStoreSetting(key, value);
      updated.push(key);
    }

    if (updated.length > 0) {
      logAdminAction(admin.id, admin.email, 'UPDATE_SETTINGS', 'store_settings', undefined, `Keys: ${updated.join(', ')}`);
    }

    return NextResponse.json({ success: true, updated, rejected });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to update settings';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
