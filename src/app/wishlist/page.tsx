'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { initialProducts } from '@/lib/initialProducts';
import type { Product } from '@/lib/types';
import styles from './wishlist.module.css';

export default function WishlistPage() {
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadWishlist = () => {
    try {
      const ids: string[] = JSON.parse(localStorage.getItem('deendrip_wishlist') || '[]');
      const matched = initialProducts.filter(p => ids.includes(p.id)) as unknown as Product[];
      setWishlistProducts(matched);
    } catch {
      setWishlistProducts([]);
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    loadWishlist();

    // Listen for storage changes from other tabs or ProductCard
    const handleStorage = () => loadWishlist();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleClearAll = () => {
    try {
      localStorage.setItem('deendrip_wishlist', '[]');
      setWishlistProducts([]);
    } catch {}
  };

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Header Breadcrumb & Title */}
        <div className={styles.header}>
          <div className={styles.breadcrumbs}>
            <Link href="/" className={styles.crumbLink}>Home</Link>
            <span className={styles.crumbSep}>/</span>
            <span className={styles.crumbCurrent}>Saved Wishlist</span>
          </div>

          <div className={styles.titleRow}>
            <div>
              <span className={styles.tag}>[ YOUR CURATED ARCHIVE ]</span>
              <h1 className={styles.title}>Saved Items</h1>
            </div>
            {wishlistProducts.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className={styles.clearBtn}
              >
                Clear All
              </button>
            )}
          </div>
          <p className={styles.subtitle}>
            Items saved to your personal wardrobe. Tap quick add to bag or view full product details.
          </p>
        </div>

        {/* Content */}
        {!isLoaded ? (
          <div className={styles.loadingState}>
            <span className={styles.loadingSpinner} />
            <p>Loading your saved items...</p>
          </div>
        ) : wishlistProducts.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <h2 className={styles.emptyTitle}>Your Wishlist is Empty</h2>
            <p className={styles.emptyText}>
              You haven&apos;t saved any pieces yet. Explore our latest AW-26 drops and tap the heart icon to curate your personal drop.
            </p>
            <div className={styles.emptyActions}>
              <Link href="/shop" className="btn btn-sky">
                Explore The Shop →
              </Link>
              <Link href="/collections" className="btn btn-outline">
                Browse Curated Drops
              </Link>
            </div>
          </div>
        ) : (
          <div className={styles.grid}>
            {wishlistProducts.map((product, idx) => (
              <ProductCard key={product.id} product={product} index={idx + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
