import { NextResponse } from 'next/server';
import { getAllDeliveryZones, updateDeliveryZone, logAdminAction } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ zones: getAllDeliveryZones() });
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json().catch(() => null);
    if (!body || !body.id) return NextResponse.json({ error: 'Zone ID required' }, { status: 400 });

    const { id, feeKobo, freeThresholdKobo, zoneName, isActive } = body;

    if (feeKobo !== undefined && (!Number.isInteger(feeKobo) || feeKobo < 0)) {
      return NextResponse.json({ error: 'Fee must be a non-negative integer in kobo' }, { status: 400 });
    }

    const success = updateDeliveryZone(id, {
      zoneName: zoneName !== undefined ? String(zoneName) : undefined,
      feeKobo: feeKobo !== undefined ? Number(feeKobo) : undefined,
      freeThresholdKobo: 'freeThresholdKobo' in body ? (freeThresholdKobo === null ? null : Number(freeThresholdKobo)) : undefined,
      isActive: isActive !== undefined ? Boolean(isActive) : undefined,
    });

    if (!success) return NextResponse.json({ error: 'Zone not found' }, { status: 404 });

    logAdminAction(admin.id, admin.email, 'UPDATE_DELIVERY_ZONE', 'delivery_zone', id, JSON.stringify({ feeKobo, freeThresholdKobo, isActive }));

    return NextResponse.json({ success: true, zones: getAllDeliveryZones() });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to update zone';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
