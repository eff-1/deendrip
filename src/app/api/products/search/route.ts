import { NextRequest, NextResponse } from 'next/server';
import { getProducts } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q')?.trim() || '';

    if (!query || query.length < 2) {
      return NextResponse.json({ products: [] });
    }

    const products = getProducts({ searchQuery: query });
    return NextResponse.json({ products: products.slice(0, 8) });
  } catch (error: unknown) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Search failed', products: [] }, { status: 500 });
  }
}
