'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { formatNaira } from '@/lib/formatters';
import styles from './CartDrawer.module.css';

const FREE_SHIPPING_THRESHOLD_KOBO = 8500000; // ₦85,000

export default function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, removeItem, updateQuantity, subtotalKobo, itemCount } = useCart();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCartOpen) {
        setIsCartOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen, setIsCartOpen]);

  // Lock body scroll when open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen]);

  const progressPercent = Math.min(100, Math.round((subtotalKobo / FREE_SHIPPING_THRESHOLD_KOBO) * 100));
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD_KOBO - subtotalKobo);

  return (
    <>
      <div
        className={`${styles.overlay} ${isCartOpen ? styles.overlayOpen : ''}`}
        onClick={() => setIsCartOpen(false)}
        aria-hidden="true"
      />

      <aside className={`${styles.drawer} ${isCartOpen ? styles.drawerOpen : ''}`} aria-label="Shopping Cart">
        <div className={styles.header}>
          <h2 className={styles.title}>Your Bag ({itemCount})</h2>
          <button
            onClick={() => setIsCartOpen(false)}
            className={styles.closeBtn}
            aria-label="Close cart"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Shipping progress tracker */}
        <div className={styles.shippingProgress}>
          <div className={styles.shippingText}>
            {remainingForFreeShipping > 0 ? (
              <span>Add {formatNaira(remainingForFreeShipping)} more for FREE Lagos delivery!</span>
            ) : (
              <span>🎉 You qualified for FREE Lagos delivery!</span>
            )}
          </div>
          <div className={styles.progressBarTrack}>
            <div className={styles.progressBarFill} style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        {items.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
            </div>
            <p style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Your bag is empty</p>
            <p style={{ fontSize: '0.85rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
              Explore our latest drop and bring home cultural streetwear with identity.
            </p>
            <Link
              href="/shop"
              className="btn btn-sky btn-sm"
              onClick={() => setIsCartOpen(false)}
            >
              Explore Collection
            </Link>
          </div>
        ) : (
          <>
            <div className={styles.itemsList}>
              {items.map(item => (
                <div key={item.variantId} className={styles.itemRow}>
                  <div className={styles.itemImage}>
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      sizes="72px"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>

                  <div className={styles.itemInfo}>
                    <h4 className={styles.itemName}>{item.name}</h4>
                    <div className={styles.itemVariant}>Size: {item.size}</div>
                    <div className={styles.itemPrice}>{formatNaira(item.priceKobo)}</div>

                    <div className={styles.itemActions}>
                      <div className={styles.qtyControls}>
                        <button
                          className={styles.qtyBtn}
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className={styles.qtyVal}>{item.quantity}</span>
                        <button
                          className={styles.qtyBtn}
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          disabled={item.quantity >= item.maxStock}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <button
                        className={styles.removeBtn}
                        onClick={() => removeItem(item.variantId)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.footer}>
              <div className={styles.subtotalRow}>
                <span className={styles.subtotalLabel}>Subtotal</span>
                <span className={styles.subtotalVal}>{formatNaira(subtotalKobo)}</span>
              </div>

              <Link
                href="/checkout"
                className="btn btn-primary btn-full"
                onClick={() => setIsCartOpen(false)}
              >
                Proceed to Checkout
              </Link>
              <p className={styles.checkoutNotice}>Taxes and delivery calculated at checkout</p>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
