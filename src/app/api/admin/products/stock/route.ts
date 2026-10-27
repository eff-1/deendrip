import { NextResponse } from 'next/server';
import { updateVariantStock, logAdminAction } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => null);
    if (!body) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

    const { variantId, newStock } = body;

    if (!variantId || typeof newStock !== 'number' || !Number.isInteger(newStock) || newStock < 0) {
      return NextResponse.json({ error: 'Valid variant ID and non-negative integer stock quantity required' }, { status: 400 });
    }

    const success = updateVariantStock(variantId, newStock);
    if (!success) {
      return NextResponse.json({ error: 'Variant not found' }, { status: 404 });
    }

    logAdminAction(admin.id, admin.email, 'UPDATE_STOCK', 'variant', variantId, `Stock set to ${newStock}`);

    return NextResponse.json({ success: true, variantId, newStock });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to update stock';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
