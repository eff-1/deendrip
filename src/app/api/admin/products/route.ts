import { NextResponse } from 'next/server';
import { getProducts, createProduct, logAdminAction } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';
import type { Category } from '@/lib/types';

const VALID_CATEGORIES: Category[] = ['tees', 'caps', 'hoodies-polos', 'trousers', 'tracksuits', 'shirts'];

export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') as Category | 'all' | null;
  const publishedOnly = searchParams.get('published') !== 'false';
  const searchQuery = searchParams.get('q') || undefined;

  const products = getProducts({
    category: category || undefined,
    publishedOnly,
    searchQuery,
  });

  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json().catch(() => null);
    if (!body) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });

    const { name, description, category, priceKobo, salePriceKobo, isPublished, isFeatured, isNewDrop, details, images, variants } = body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ error: 'Product name must be at least 2 characters' }, { status: 400 });
    }
    if (!description || typeof description !== 'string') {
      return NextResponse.json({ error: 'Product description is required' }, { status: 400 });
    }
    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}` }, { status: 400 });
    }
    if (!Number.isInteger(priceKobo) || priceKobo <= 0) {
      return NextResponse.json({ error: 'Price must be a positive integer (in kobo)' }, { status: 400 });
    }
    if (salePriceKobo !== undefined && salePriceKobo !== null && (!Number.isInteger(salePriceKobo) || salePriceKobo <= 0)) {
      return NextResponse.json({ error: 'Sale price must be a positive integer (in kobo)' }, { status: 400 });
    }

    // Generate slug from name
    const slug = name.trim().toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 80);

    const product = createProduct({
      slug,
      name: name.trim(),
      description: description.trim(),
      category,
      priceKobo,
      salePriceKobo: salePriceKobo || null,
      isPublished: isPublished !== false,
      isFeatured: !!isFeatured,
      isNewDrop: !!isNewDrop,
      details,
      images,
      variants,
    });

    logAdminAction(admin.id, admin.email, 'CREATE_PRODUCT', 'product', product.id, product.name);

    return NextResponse.json({ product }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to create product';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
