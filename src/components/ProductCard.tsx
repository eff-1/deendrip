'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/lib/types';
import { formatNaira } from '@/lib/formatters';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index }: ProductCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
  const alternateImage = product.images.find(img => img.isAlternate) || product.images[1] || primaryImage;
  const hasAlternate = alternateImage && alternateImage.imageUrl !== primaryImage.imageUrl;

  const totalStock = product.variants.reduce((sum, v) => sum + v.stockQuantity, 0);
  const isOutOfStock = totalStock <= 0;

  const indexLabel = index !== undefined ? String(index).padStart(2, '0') : null;

  return (
    <div className={`${styles.card} ${isFlipped ? styles.flipped : ''}`}>
      <div className={styles.imageWrapper}>
        <Link href={`/products/${product.slug}`} aria-label={`View ${product.name}`} className={styles.imageLink}>
          {primaryImage && (
            <Image
              src={primaryImage.imageUrl}
              alt={primaryImage.altText || product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={`${styles.productImage} ${styles.primaryImage}`}
            />
          )}

          {hasAlternate && (
            <Image
              src={alternateImage.imageUrl}
              alt={alternateImage.altText || `${product.name} alternate view`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={`${styles.productImage} ${styles.alternateImage}`}
            />
          )}
        </Link>

        {/* Badges */}
        <div className={styles.badgeContainer}>
          {product.isNewDrop && <span className="badge badge-sky">New Drop</span>}
          {isOutOfStock && <span className="badge badge-dark">Sold Out</span>}
        </div>

        {/* Mobile tap flip button */}
        {hasAlternate && (
          <button
            type="button"
            className={`${styles.flipButton} ${isFlipped ? styles.flipActive : ''}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsFlipped(!isFlipped);
            }}
            aria-label={isFlipped ? 'Show front image' : 'Show back image'}
          >
            <span>{isFlipped ? 'Front' : 'Back'}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 21h5v-5" />
            </svg>
          </button>
        )}
      </div>

      <div className={styles.details}>
        {/* Numbered label row */}
        <div className={styles.topRow}>
          {indexLabel && <span className={styles.indexNum}>{indexLabel} /</span>}
          <span className={styles.category}>{product.category.replace('-', ' ')}</span>
        </div>

        <Link href={`/products/${product.slug}`} className={styles.title}>
          {product.name}
        </Link>

        <div className={styles.bottomRow}>
          <div className={styles.price}>{formatNaira(product.priceKobo)}</div>
          {isOutOfStock
            ? <span className={`${styles.stockStatus} ${styles.outOfStock}`}>Sold Out</span>
            : <Link href={`/products/${product.slug}`} className={styles.shopNowLink}>SHOP NOW →</Link>
          }
        </div>
      </div>
    </div>
  );
}
