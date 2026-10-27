import { NextResponse } from 'next/server';
import { getOrderByReference, updateOrderNotes, addOrderNote, getOrderNotes, logAdminAction } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ ref: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { ref } = await params;
  const order = getOrderByReference(ref);
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

  const notes = getOrderNotes(order.id);
  return NextResponse.json({ order, notes });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ ref: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { ref } = await params;
  const order = getOrderByReference(ref);
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

  try {
    const body = await request.json().catch(() => null);
    if (!body) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });

    const { internalNotes, addNote } = body;

    if (internalNotes !== undefined) {
      updateOrderNotes(ref, String(internalNotes));
      logAdminAction(admin.id, admin.email, 'UPDATE_ORDER_NOTES', 'order', order.id, ref);
    }

    if (addNote && typeof addNote === 'string' && addNote.trim()) {
      addOrderNote(order.id, admin.id, admin.name, addNote.trim());
      logAdminAction(admin.id, admin.email, 'ADD_ORDER_NOTE', 'order', order.id, ref);
    }

    const updated = getOrderByReference(ref);
    const notes = getOrderNotes(order.id);
    return NextResponse.json({ order: updated, notes });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to update order';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
