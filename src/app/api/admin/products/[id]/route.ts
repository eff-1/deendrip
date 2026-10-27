import { NextResponse } from 'next/server';
import { getProductById, updateProduct, deleteProduct, logAdminAction } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';
import type { Category } from '@/lib/types';

const VALID_CATEGORIES: Category[] = ['tees', 'caps', 'hoodies-polos', 'trousers', 'tracksuits', 'shirts'];

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const product = getProductById(id);
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  try {
    const body = await request.json().catch(() => null);
    if (!body) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });

    const { name, description, category, priceKobo, salePriceKobo, isPublished, isFeatured, isNewDrop, details } = body;

    if (category !== undefined && !VALID_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: `Invalid category` }, { status: 400 });
    }
    if (priceKobo !== undefined && (!Number.isInteger(priceKobo) || priceKobo <= 0)) {
      return NextResponse.json({ error: 'Price must be a positive integer in kobo' }, { status: 400 });
    }

    const product = updateProduct(id, {
      name: name?.trim(),
      description: description?.trim(),
      category,
      priceKobo,
      salePriceKobo: 'salePriceKobo' in body ? (salePriceKobo || null) : undefined,
      isPublished,
      isFeatured,
      isNewDrop,
      details,
    });

    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    logAdminAction(admin.id, admin.email, 'UPDATE_PRODUCT', 'product', id, JSON.stringify(Object.keys(body)));

    return NextResponse.json({ product });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to update product';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Only superadmin can delete products
  if (admin.role !== 'superadmin') {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  const { id } = await params;
  const product = getProductById(id);
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

  const success = deleteProduct(id);
  if (!success) return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });

  logAdminAction(admin.id, admin.email, 'DELETE_PRODUCT', 'product', id, product.name);

  return NextResponse.json({ success: true });
}
