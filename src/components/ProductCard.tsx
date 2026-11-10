'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/lib/types';
import { formatNaira } from '@/lib/formatters';
import { useCart } from '@/context/CartContext';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index }: ProductCardProps) {
  const [viewMode, setViewMode] = useState<'auto' | 'front' | 'back'>('auto');
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const { items, addItem, updateQuantity, removeItem } = useCart();

  const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
  const alternateImage = product.images.find(img => img.isAlternate) || product.images[1] || primaryImage;
  const hasAlternate = alternateImage && alternateImage.imageUrl !== primaryImage.imageUrl;

  const isShowingBack = Boolean(hasAlternate && (viewMode === 'back' || (viewMode === 'auto' && isHovered)));

  // Cart item matching this product
  const cartItem = items.find(i => i.productId === product.id);
  const inCartQty = cartItem ? cartItem.quantity : 0;

  const toggleFlip = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!hasAlternate) return;
    setViewMode((prev) => {
      const wasShowingBack = prev === 'back' || (prev === 'auto' && isHovered);
      return wasShowingBack ? 'front' : 'back';
    });
  };

  const totalStock = product.variants.reduce((sum, v) => sum + v.stockQuantity, 0);
  const isOutOfStock = totalStock <= 0;

  const indexLabel = index !== undefined ? String(index).padStart(2, '0') : null;

  // Load wishlist state from localStorage
  useEffect(() => {
    try {
      const wishlist = JSON.parse(localStorage.getItem('deendrip_wishlist') || '[]');
      setIsWishlisted(wishlist.includes(product.id));
    } catch {}
  }, [product.id]);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const wishlist: string[] = JSON.parse(localStorage.getItem('deendrip_wishlist') || '[]');
      let updated: string[];
      if (wishlist.includes(product.id)) {
        updated = wishlist.filter(id => id !== product.id);
      } else {
        updated = [...wishlist, product.id];
      }
      localStorage.setItem('deendrip_wishlist', JSON.stringify(updated));
      setIsWishlisted(!isWishlisted);
    } catch {}
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock || !product.variants[0]) return;
    const variant = product.variants[0];
    addItem({
      productId: product.id,
      variantId: variant.id,
      slug: product.slug,
      name: product.name,
      size: variant.size,
      color: variant.color || '',
      priceKobo: product.priceKobo,
      quantity: 1,
      imageUrl: primaryImage?.imageUrl || '',
      maxStock: variant.stockQuantity,
    }, false); // Do NOT pop open drawer!

    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 900);
  };

  const handleIncrease = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!cartItem) {
      handleQuickAdd(e);
      return;
    }
    if (inCartQty < cartItem.maxStock) {
      updateQuantity(cartItem.variantId, inCartQty + 1);
    }
  };

  const handleDecrease = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!cartItem) return;
    if (inCartQty > 1) {
      updateQuantity(cartItem.variantId, inCartQty - 1);
    } else {
      removeItem(cartItem.variantId);
    }
  };

  return (
    <div
      className={`${styles.card} ${isShowingBack ? styles.showBack : styles.showFront}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setViewMode('auto');
      }}
    >
      <div className={styles.imageWrapper}>
        <Link href={`/products/${product.slug}`} aria-label={`View ${product.name}`} className={styles.imageLink}>
          {primaryImage && (
            <Image
              src={primaryImage.imageUrl}
              alt={primaryImage.altText || product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={`${styles.productImage} ${styles.primaryImage}`}
              style={{
                opacity: isShowingBack ? 0 : 1,
                zIndex: isShowingBack ? 1 : 2,
                transition: 'opacity 0.35s ease',
              }}
            />
          )}

          {hasAlternate && (
            <Image
              src={alternateImage.imageUrl}
              alt={alternateImage.altText || `${product.name} alternate view`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={`${styles.productImage} ${styles.alternateImage}`}
              style={{
                opacity: isShowingBack ? 1 : 0,
                zIndex: isShowingBack ? 2 : 1,
                transition: 'opacity 0.35s ease',
              }}
            />
          )}
        </Link>

        {/* Badges */}
        <div className={styles.badgeContainer}>
          {product.isNewDrop && <span className="badge badge-sky">New Drop</span>}
          {isOutOfStock && <span className="badge badge-dark">Sold Out</span>}
        </div>

        {/* Wishlist heart icon (top-right) */}
        <button
          type="button"
          className={`${styles.wishlistBtn} ${isWishlisted ? styles.wishlistActive : ''}`}
          onClick={toggleWishlist}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {/* Flying tag micro-animation */}
        {justAdded && (
          <div className={styles.flyingTag}>
            +1 Added to Bag
          </div>
        )}

        {/* Alternate view flip button */}
        {hasAlternate && (
          <button
            type="button"
            className={`${styles.flipButton} ${isShowingBack ? styles.flipActive : ''}`}
            onClick={toggleFlip}
            aria-label={isShowingBack ? 'Show main view' : 'Show alt view'}
          >
            <span>{isShowingBack ? 'Main View' : 'Alt View'}</span>
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

          {isOutOfStock ? (
            <span className={`${styles.stockStatus} ${styles.outOfStock}`}>Sold Out</span>
          ) : inCartQty > 0 ? (
            <div className={styles.qtyStepper} onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
              <button
                type="button"
                className={styles.stepperMinus}
                onClick={handleDecrease}
                aria-label="Decrease quantity"
                title="Reduce quantity"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
              <span className={styles.stepperCount}>{inCartQty}</span>
              <button
                type="button"
                className={styles.stepperPlus}
                disabled={cartItem ? inCartQty >= cartItem.maxStock : false}
                onClick={handleIncrease}
                aria-label="Increase quantity"
                title="Increase quantity"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              type="button"
              className={styles.shopNowAction}
              onClick={handleQuickAdd}
              aria-label={`Add ${product.name} to bag`}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              <span>ADD</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
