import React from 'react';
import Link from 'next/link';
import { getProducts } from '@/lib/db';
import type { Category, Product } from '@/lib/types';
import ProductCard from '@/components/ProductCard';
import ShopHeaderFilter from './ShopHeaderFilter';
import styles from './shop.module.css';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Catalogue AW-26 | Shop Deen Drip Streetwear',
  description: 'Explore the 100% authentic Deen Drip collection. Authentic foam truckers, heavyweight tees, tactical denim cargos, and statement resort shirts.',
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string }>;
}) {
  const resolvedParams = await searchParams;
  const currentCategory = (resolvedParams.category as Category | 'all') || 'all';
  const currentSort = resolvedParams.sort || 'featured';

  // Get all published products to compute exact category counts
  const allProducts = getProducts();

  const categoryCounts: Record<string, number> = {
    all: allProducts.length,
    caps: allProducts.filter(p => p.category === 'caps').length,
    tees: allProducts.filter(p => p.category === 'tees').length,
    trousers: allProducts.filter(p => p.category === 'trousers').length,
    'hoodies-polos': allProducts.filter(p => p.category === 'hoodies-polos').length,
    shirts: allProducts.filter(p => p.category === 'shirts').length,
  };

  // Filter products by category
  let products = currentCategory === 'all'
    ? allProducts
    : allProducts.filter(p => p.category === currentCategory);

  // Sorting logic
  if (currentSort === 'price-low') {
    products = [...products].sort((a, b) => a.priceKobo - b.priceKobo);
  } else if (currentSort === 'price-high') {
    products = [...products].sort((a, b) => b.priceKobo - a.priceKobo);
  } else if (currentSort === 'newest') {
    products = [...products].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return (
    <div className={styles.shopContainer}>
      <ShopHeaderFilter
        currentCategory={currentCategory}
        currentSort={currentSort}
        productCount={products.length}
        categoryCounts={categoryCounts}
      />

      <div className="container">
        {/* Product Grid */}
        {products.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyTitle}>No items found in this collection</p>
            <p className={styles.emptyText}>Check back soon for new drops or view our full catalogue.</p>
            <Link href="/shop" className="btn btn-sky btn-sm" style={{ marginTop: '1rem' }}>
              View All Pieces
            </Link>
          </div>
        ) : (
          <div className="grid-products" style={{ marginBottom: 'var(--space-20)' }}>
            {products.map((product: Product, index: number) => (
              <ProductCard key={product.id} product={product} index={index + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
