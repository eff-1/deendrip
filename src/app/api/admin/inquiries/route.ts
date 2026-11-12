import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { getContactInquiriesAsync } from '@/lib/db';

export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get('limit');
  const limit = limitParam ? Math.min(Math.max(parseInt(limitParam, 10) || 50, 1), 200) : 50;

  try {
    const inquiries = await getContactInquiriesAsync(limit);
    return NextResponse.json({ inquiries });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch inquiries';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
