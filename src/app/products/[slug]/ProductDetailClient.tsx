'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/lib/types';
import { formatNaira } from '@/lib/formatters';
import { useCart } from '@/context/CartContext';
import SimilarProductsMarquee from '@/components/SimilarProductsMarquee';
import styles from './ProductDetailClient.module.css';

interface ProductDetailClientProps {
  product: Product;
  similarProducts?: Product[];
}

const COLOR_HEX_MAP: Record<string, string> = {
  'midnight black': '#0f1117',
  'black': '#0a0a0a',
  'washed black': '#1f242d',
  'light blue': '#93c5fd',
  'ocean blue': '#2563eb',
  'olive green': '#556b2f',
  'off-white': '#f5f5f0',
  'heather grey': '#94a3b8',
  'grey': '#64748b',
  'chocolate brown': '#3e2723',
  'earth brown': '#4e3321',
  'sunset orange': '#ea580c',
  'forest green': '#14532d',
  'multi-color': '#38bdf8',
  'knight edition': '#0284c7',
};

export default function ProductDetailClient({ product, similarProducts = [] }: ProductDetailClientProps) {
  const { addItem } = useCart();

  // Active gallery image
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Distinct colorways available in variants
  const distinctColors = Array.from(
    new Set(product.variants.map(v => v.color).filter(Boolean))
  ) as string[];

  // Active variant (select first variant in stock or first variant)
  const initialVariant = product.variants.find(v => v.stockQuantity > 0) || product.variants[0];
  const [selectedColor, setSelectedColor] = useState<string>(initialVariant?.color || distinctColors[0] || '');
  const [selectedVariantId, setSelectedVariantId] = useState<string>(initialVariant?.id || '');

  // Filter variants for currently selected color if product has multiple colors
  const filteredVariants = distinctColors.length > 0 && selectedColor
    ? product.variants.filter(v => v.color === selectedColor)
    : product.variants;

  const selectedVariant = product.variants.find(v => v.id === selectedVariantId) || filteredVariants[0] || initialVariant;
  const currentStock = selectedVariant ? selectedVariant.stockQuantity : 0;
  const isOutOfStock = currentStock <= 0;

  const handleColorSelect = (colorName: string) => {
    setSelectedColor(colorName);
    const matchingVariant = product.variants.find(v => v.color === colorName && v.stockQuantity > 0)
      || product.variants.find(v => v.color === colorName)
      || initialVariant;
    if (matchingVariant) {
      setSelectedVariantId(matchingVariant.id);
    }
    // Switch gallery image to selected color
    const normColor = colorName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const foundIdx = product.images.findIndex(img => {
      const u = img.imageUrl.toLowerCase().replace(/[^a-z0-9]/g, '');
      const a = (img.altText || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      return u.includes(normColor) || a.includes(normColor);
    });
    if (foundIdx !== -1) {
      setActiveImageIndex(foundIdx);
    }
  };

  // Quantity
  const [quantity, setQuantity] = useState(1);

  // UI state
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>('details');

  const totalImages = product.images.length;
  const activeImage = product.images[activeImageIndex] || product.images[0];

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % totalImages);
  };

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + totalImages) % totalImages);
  };

  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(deltaX) > 35) {
      if (deltaX < 0) {
        handleNextImage();
      } else {
        handlePrevImage();
      }
    }
    touchStartX.current = null;
  };

  const handleAddToCart = () => {
    if (!selectedVariant || isOutOfStock) return;

    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      name: product.name,
      size: selectedVariant.size,
      color: selectedVariant.color,
      priceKobo: selectedVariant.priceOverrideKobo || product.priceKobo,
      quantity,
      imageUrl: activeImage ? activeImage.imageUrl : '/assets/brand/deen-drip-logo-black.png',
      maxStock: currentStock,
    });

    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2000);
  };

  const toggleAccordion = (section: string) => {
    setOpenAccordion(openAccordion === section ? null : section);
  };

  return (
    <div className="container">
      <div className={styles.productLayout}>
        {/* Gallery Section */}
        <div className={styles.gallerySection}>
          {totalImages > 1 && (
            <div className={styles.thumbnailsList}>
              {product.images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`${styles.thumbnailBtn} ${activeImageIndex === idx ? styles.thumbnailActive : ''}`}
                  aria-label={`View image ${idx + 1}`}
                >
                  <Image
                    src={img.imageUrl}
                    alt={img.altText || `${product.name} view ${idx + 1}`}
                    fill
                    sizes="(max-width: 900px) 72px, 90px"
                    style={{ objectFit: 'contain', padding: '4px' }}
                  />
                  <span className={styles.thumbIndexBadge}>0{idx + 1}</span>
                </button>
              ))}
            </div>
          )}

          <div
            className={styles.mainImageWrapper}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {activeImage && (
              <Image
                src={activeImage.imageUrl}
                alt={activeImage.altText || product.name}
                fill
                priority
                sizes="(max-width: 900px) 100vw, 55vw"
                className={styles.mainImage}
              />
            )}

            {/* Image counter tag */}
            {totalImages > 1 && (
              <div className={styles.imageCounter}>
                <span>ANGLE {String(activeImageIndex + 1).padStart(2, '0')} / {String(totalImages).padStart(2, '0')}</span>
              </div>
            )}

            {/* Mobile swipe pagination dots */}
            {totalImages > 1 && (
              <div className={styles.mobileDotsTrack} aria-hidden="true">
                {product.images.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`${styles.mobileDot} ${activeImageIndex === idx ? styles.mobileDotActive : ''}`}
                    aria-label={`Switch to angle ${idx + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Prev / Next Chevrons on Main Image */}
            {totalImages > 1 && (
              <>
                <button
                  type="button"
                  className={`${styles.galleryNavBtn} ${styles.prevBtn}`}
                  onClick={handlePrevImage}
                  aria-label="Previous photo angle"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className={`${styles.galleryNavBtn} ${styles.nextBtn}`}
                  onClick={handleNextImage}
                  aria-label="Next photo angle"
                >
                  ›
                </button>
              </>
            )}
          </div>
        </div>

        {/* Info & Purchase Section */}
        <div className={styles.infoSection}>
          <div className={styles.breadcrumbs}>
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/shop">Shop</Link>
            <span>/</span>
            <Link href={`/shop?category=${product.category}`}>{product.category.replace('-', ' ')}</Link>
          </div>

          <div className={styles.categoryBadgeRow}>
            <span className={styles.categoryPill}>{product.category.replace('-', ' ')}</span>
            {product.isNewDrop && <span className={styles.newDropBadge}>NEW DROP</span>}
            {product.name.toLowerCase().includes('pre order') || product.description.toLowerCase().includes('pre-order') ? (
              <span className={styles.preOrderBadge}>PRE-ORDER ONLY</span>
            ) : null}
          </div>

          <h1 className={styles.title}>{product.name}</h1>

          <div className={styles.priceRow}>
            <div className={styles.price}>
              {formatNaira(selectedVariant?.priceOverrideKobo || product.priceKobo)}
            </div>
            <span className={styles.vatNotice}>Tax included. Free Lagos delivery over ₦85k.</span>
          </div>

          <p className={styles.description}>{product.description}</p>

          {/* Colorway Switcher for Sahari Line Hoodie Jalab collection */}
          {product.slug.includes('sahari-line-hoodie-jalab') && (
            <div className={styles.colorSection}>
              <div className={styles.variantHeader}>
                <span className={styles.variantLabel}>
                  Colorway Edition: <strong>
                    {product.slug.includes('black') ? 'Midnight Black' :
                     product.slug.includes('light-blue') ? 'Light Blue' :
                     product.slug.includes('olive') ? 'Olive Green' : 'Off-White'}
                  </strong>
                </span>
                <span className={styles.colorNotice}>Select color tone</span>
              </div>
              <div className={styles.colorGrid}>
                {[
                  { name: 'Midnight Black', hex: '#0f1117', slug: 'sahari-line-hoodie-jalab-black' },
                  { name: 'Light Blue', hex: '#93c5fd', slug: 'sahari-line-hoodie-jalab-light-blue' },
                  { name: 'Olive Green', hex: '#556b2f', slug: 'sahari-line-hoodie-jalab-olive-green' },
                  { name: 'Off-White', hex: '#f5f5f0', slug: 'sahari-line-hoodie-jalab-off-white' }
                ].map(c => {
                  const isSelected = product.slug === c.slug;
                  return (
                    <Link
                      key={c.slug}
                      href={`/products/${c.slug}`}
                      className={`${styles.colorChip} ${isSelected ? styles.colorChipActive : ''}`}
                    >
                      <span className={styles.colorDot} style={{ backgroundColor: c.hex }} />
                      <span>{c.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Colorway Switcher for Palestine Kuffi collection */}
          {product.slug.includes('palestine-kuffi') && (
            <div className={styles.colorSection}>
              <div className={styles.variantHeader}>
                <span className={styles.variantLabel}>
                  Colorway Edition: <strong>
                    {product.slug.includes('blue') ? 'Blue' :
                     product.slug.includes('grey') ? 'Grey' :
                     product.slug.includes('orange') ? 'Orange' : 'Brown'}
                  </strong>
                </span>
                <span className={styles.colorNotice}>Select tone to preview</span>
              </div>
              <div className={styles.colorGrid}>
                {[
                  { name: 'Brown', hex: '#4e3321', slug: 'palestine-kuffi-tshirt-brown' },
                  { name: 'Blue', hex: '#1e3a8a', slug: 'palestine-kuffi-tshirt-blue' },
                  { name: 'Grey', hex: '#64748b', slug: 'palestine-kuffi-tshirt-grey' },
                  { name: 'Orange', hex: '#ea580c', slug: 'palestine-kuffi-shirt-orange' }
                ].map(c => {
                  const isSelected = product.slug === c.slug;
                  return (
                    <Link
                      key={c.slug}
                      href={`/products/${c.slug}`}
                      className={`${styles.colorChip} ${isSelected ? styles.colorChipActive : ''}`}
                    >
                      <span className={styles.colorDot} style={{ backgroundColor: c.hex }} />
                      <span>{c.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Hoodie & Modest Streetwear Family Switcher */}
          {(product.category === 'hoodies-polos' || product.slug.includes('hoodie') || product.slug.includes('jalab')) && (
            <div className={styles.colorSection}>
              <div className={styles.variantHeader}>
                <span className={styles.variantLabel}>
                  Hoodie & Silhouette Family:
                </span>
                <span className={styles.colorNotice}>Compare styles & prices</span>
              </div>
              <div className={styles.colorGrid}>
                {[
                  { name: 'Sahari Hoodie Jalab (₦40,000)', slug: 'sahari-line-hoodie-jalab-black' },
                  { name: 'Essential Streetwear Hoodie (₦16,000)', slug: 'hoodie-essential' },
                  { name: 'Hoodie Jalab Brown (₦40,000)', slug: 'hoodie-jalab-brown' }
                ].map(item => {
                  const isCurrent = product.slug.includes('sahari-line-hoodie-jalab')
                    ? item.slug.includes('sahari-line-hoodie-jalab')
                    : product.slug === item.slug;
                  return (
                    <Link
                      key={item.slug}
                      href={`/products/${item.slug}`}
                      className={`${styles.colorChip} ${isCurrent ? styles.colorChipActive : ''}`}
                    >
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size / Variant Selector */}
          <div className={styles.variantSection}>
            <div className={styles.variantHeader}>
              <span className={styles.variantLabel}>
                Size: <strong>{selectedVariant?.size}</strong>
              </span>
              {product.category !== 'caps' && (
                <button
                  type="button"
                  onClick={() => setSizeGuideOpen(true)}
                  className={styles.sizeGuideBtn}
                >
                  Size Guide
                </button>
              )}
            </div>

            <div className={styles.sizeGrid}>
              {filteredVariants.map(v => {
                const isSelected = v.id === selectedVariantId;
                const isVariantSoldOut = v.stockQuantity <= 0;

                return (
                  <button
                    key={v.id}
                    type="button"
                    disabled={isVariantSoldOut}
                    onClick={() => {
                      setSelectedVariantId(v.id);
                      setQuantity(1);
                    }}
                    className={`${styles.sizePill} ${isSelected ? styles.sizePillActive : ''} ${isVariantSoldOut ? styles.sizePillDisabled : ''}`}
                    aria-label={`Option ${v.size}${isVariantSoldOut ? ' (Sold Out)' : ''}`}
                  >
                    {v.size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stock Count Indicator */}
          {currentStock > 0 && currentStock <= 5 && (
            <div className={styles.stockAlert}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>
                {currentStock === 1 ? 'Only 1 piece available' : `Only ${currentStock} pieces left`} in stock — limited drop
              </span>
            </div>
          )}

          {/* Purchase Actions */}
          <div className={styles.purchaseSection}>
            <div className={styles.qtyWrapper}>
              <button
                type="button"
                className={styles.qtyBtn}
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1 || isOutOfStock}
                aria-label="Decrease quantity"
              >
                -
              </button>
              <span className={styles.qtyVal}>{quantity}</span>
              <button
                type="button"
                className={styles.qtyBtn}
                onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                disabled={quantity >= currentStock || isOutOfStock}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`btn ${addedFeedback ? 'btn-sky' : 'btn-primary'} ${styles.addBtn}`}
            >
              {addedFeedback ? (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Added to Bag
                </>
              ) : isOutOfStock ? (
                'Sold Out'
              ) : (
                'Add to Bag'
              )}
            </button>
          </div>

          {/* Accordions */}
          <div className={styles.accordion}>
            <div className={styles.accordionItem}>
              <button
                type="button"
                onClick={() => toggleAccordion('details')}
                className={styles.accordionTrigger}
              >
                <span>Product Details & Construction</span>
                <span>{openAccordion === 'details' ? '−' : '+'}</span>
              </button>
              {openAccordion === 'details' && (
                <div className={styles.accordionContent}>
                  {product.details?.material && (
                    <p><strong>Fabric:</strong> {product.details.material}</p>
                  )}
                  {product.details?.fit && (
                    <p style={{ marginTop: '0.25rem' }}><strong>Fit:</strong> {product.details.fit}</p>
                  )}
                  {product.details?.features && product.details.features.length > 0 && (
                    <ul className={styles.featureList}>
                      {product.details.features.map((feat, idx) => (
                        <li key={idx}>{feat}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            <div className={styles.accordionItem}>
              <button
                type="button"
                onClick={() => toggleAccordion('care')}
                className={styles.accordionTrigger}
              >
                <span>Care & Longevity</span>
                <span>{openAccordion === 'care' ? '−' : '+'}</span>
              </button>
              {openAccordion === 'care' && (
                <div className={styles.accordionContent}>
                  {product.details?.care ? (
                    <ul className={styles.featureList}>
                      {product.details.care.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>Machine wash cold with like colors inside out. Hang dry to preserve fabric density and 3D embroidery.</p>
                  )}
                </div>
              )}
            </div>

            <div className={styles.accordionItem}>
              <button
                type="button"
                onClick={() => toggleAccordion('shipping')}
                className={styles.accordionTrigger}
              >
                <span>Delivery & Return Policy</span>
                <span>{openAccordion === 'shipping' ? '−' : '+'}</span>
              </button>
              {openAccordion === 'shipping' && (
                <div className={styles.accordionContent}>
                  <p><strong>Lagos Standard:</strong> 1–2 business days (₦3,500, or FREE over ₦85,000).</p>
                  <p style={{ marginTop: '0.25rem' }}><strong>Nationwide Delivery:</strong> 3–5 business days (₦6,500).</p>
                  <p style={{ marginTop: '0.5rem' }}>Unworn items with original tags are eligible for exchange within 7 days of delivery.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Moving Similar Products / Complete The Drip */}
      <SimilarProductsMarquee
        products={similarProducts}
        currentCategoryTitle={product.category}
      />

      {/* Size Guide Modal */}
      {sizeGuideOpen && (
        <div className={styles.modalOverlay} onClick={() => setSizeGuideOpen(false)}>
          <div className={styles.modalCard} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase' }}>
                Deen Drip Size Guide
              </h3>
              <button
                onClick={() => setSizeGuideOpen(false)}
                style={{ fontSize: '1.25rem', color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              All our streetwear pieces are cut with a relaxed, boxy drop-shoulder aesthetic. For a fitted look, consider sizing down one size.
            </p>
            <table className={styles.sizeTable}>
              <thead>
                <tr>
                  <th>Size</th>
                  <th>Chest (Inches)</th>
                  <th>Length (Inches)</th>
                  <th>Shoulder (cm)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>S</strong></td>
                  <td>40" - 42"</td>
                  <td>28.5"</td>
                  <td>52 cm</td>
                </tr>
                <tr>
                  <td><strong>M</strong></td>
                  <td>42" - 44"</td>
                  <td>29.5"</td>
                  <td>54 cm</td>
                </tr>
                <tr>
                  <td><strong>L</strong></td>
                  <td>44" - 46"</td>
                  <td>30.5"</td>
                  <td>56 cm</td>
                </tr>
                <tr>
                  <td><strong>XL</strong></td>
                  <td>46" - 48"</td>
                  <td>31.5"</td>
                  <td>58 cm</td>
                </tr>
                <tr>
                  <td><strong>XXL</strong></td>
                  <td>48" - 50"</td>
                  <td>32.5"</td>
                  <td>60 cm</td>
                </tr>
              </tbody>
            </table>
            <button
              onClick={() => setSizeGuideOpen(false)}
              className="btn btn-primary btn-full"
            >
              Close Size Guide
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
