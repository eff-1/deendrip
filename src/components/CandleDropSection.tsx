'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/lib/types';
import { formatNaira } from '@/lib/formatters';
import styles from './CandleDropSection.module.css';

interface CandleDropSectionProps {
  products: Product[];
}

export default function CandleDropSection({ products }: CandleDropSectionProps) {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const trackRef = useRef<HTMLDivElement>(null);

  // Take the first 4 products for the 4 candlestick columns
  const dropProducts = products.slice(0, 4);

  // Scroll listener for mobile track to update active pill
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const handleScroll = () => {
      const scrollLeft = track.scrollLeft;
      const cardWidth = track.clientWidth * 0.78;
      if (cardWidth > 0) {
        const index = Math.round(scrollLeft / cardWidth);
        setActiveStep(Math.max(0, Math.min(dropProducts.length - 1, index)));
      }
    };

    track.addEventListener('scroll', handleScroll, { passive: true });
    return () => track.removeEventListener('scroll', handleScroll);
  }, [dropProducts.length]);

  const scrollToCard = (index: number) => {
    setActiveStep(index);
    if (!trackRef.current) return;
    const cardEl = trackRef.current.children[index] as HTMLElement;
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  const toggleFlip = (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setFlippedCards(prev => ({ ...prev, [productId]: !prev[productId] }));
  };

  return (
    <section className={styles.section} id="drop" aria-label="AW26 Featured Candlestick Drop">
      <div className="container">

        {/* ── Header Area ── */}
        <div className={styles.headerWrapper}>
          <div className={styles.topRow}>
            <div className={styles.dropTag}>
              <span className={styles.pulseDot} />
              <span>NEW DROP · VOL.02 / AW26</span>
            </div>
            <div className={styles.dropCounter}>
              [ 04 ITEMS ACTIVE IN STAGE ]
            </div>
          </div>

          <h2 className={styles.headline}>Made For The Deen.</h2>

          <div className={styles.midRow}>
            <p className={styles.subtitle}>
              A visual dialogue between contemporary street culture and uncompromising faith. Designed in-house with custom heavyweight textures, signature paneling, and hand-drawn script.
            </p>
            <Link href="/shop" className={styles.viewAllTopBtn}>
              VIEW ALL PRODUCTS <span className={styles.arrowIcon}>→</span>
            </Link>
          </div>
        </div>

        {/* ── Bounded Candlestick Stage Frame (The Chart Viewport) ── */}
        <div className={styles.stageContainer}>
          {/* Architectural corner crosshairs */}
          <span className={styles.cornerTL}>+</span>
          <span className={styles.cornerTR}>+</span>
          <span className={styles.cornerBL}>+</span>
          <span className={styles.cornerBR}>+</span>

          {/* Technical coordinate axis markers */}
          <span className={styles.axisLabelTop}>▲ HIGH TIER</span>
          <span className={styles.axisLabelMid}>◆ PIVOT 0.50</span>
          <span className={styles.axisLabelBottom}>▼ BASE 0.04</span>

          {/* Horizontal datum guide lines */}
          <div className={styles.datumLineHigh} />
          <div className={styles.datumLineMid} />
          <div className={styles.datumLineLow} />

          {/* Watermark in negative space */}
          <div className={styles.stageWatermark}>VOL.02</div>

          {/* ── 4 Candlestick Columns ── */}
          <div className={styles.gridTrack} ref={trackRef}>
            {dropProducts.map((product, i) => {
              const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
              const alternateImage = product.images.find(img => img.isAlternate) || product.images[1] || primaryImage;
              const hasAlternate = alternateImage && alternateImage.imageUrl !== primaryImage?.imageUrl;
              const isFlipped = !!flippedCards[product.id];

              const totalStock = product.variants.reduce((sum, v) => sum + v.stockQuantity, 0);
              const isOutOfStock = totalStock <= 0;
              const indexStr = String(i + 1).padStart(2, '0');
              const specBadge = product.details?.weight || 'AW26';

              return (
                <div
                  key={product.id}
                  className={styles.column}
                  onClick={() => setActiveStep(i)}
                >
                  {/* Top Wick */}
                  <div className={styles.wickTop}>
                    <span className={styles.wickTipTop}>▲ {indexStr}</span>
                  </div>

                  {/* Candle Card Body */}
                  <Link
                    href={`/products/${product.slug}`}
                    className={styles.candleCard}
                    aria-label={`View ${product.name}`}
                  >
                    {/* Header Row: Category & Spec */}
                    <div className={styles.cardHeader}>
                      <div>
                        <span className={styles.indexTag}>{indexStr} / </span>
                        <span className={styles.categoryName}>{product.category.replace('-', ' ')}</span>
                      </div>
                      <span className={styles.specBadge}>{specBadge}</span>
                    </div>

                    {/* Image Area */}
                    <div className={styles.cardImageWrapper}>
                      {primaryImage && (
                        <Image
                          src={isFlipped && hasAlternate ? alternateImage.imageUrl : primaryImage.imageUrl}
                          alt={primaryImage.altText || product.name}
                          fill
                          sizes="(max-width: 640px) 78vw, (max-width: 1024px) 30vw, 25vw"
                          className={`${styles.productImage} ${styles.primaryImage}`}
                          priority={i < 2}
                        />
                      )}

                      {/* Alternate image pre-render for smooth hover transitions on desktop */}
                      {hasAlternate && !isFlipped && (
                        <Image
                          src={alternateImage.imageUrl}
                          alt={alternateImage.altText || `${product.name} back view`}
                          fill
                          sizes="(max-width: 640px) 78vw, (max-width: 1024px) 30vw, 25vw"
                          className={`${styles.productImage} ${styles.alternateImage}`}
                        />
                      )}

                      {/* Status Badges */}
                      <div className={styles.badgeOverlay}>
                        {product.isNewDrop && <span className={styles.tagNewDrop}>New Drop</span>}
                        {isOutOfStock && <span className={styles.tagSoldOut}>Sold Out</span>}
                      </div>

                      {/* Flip button for mobile / alternate image toggle */}
                      {hasAlternate && (
                        <button
                          type="button"
                          className={styles.flipButton}
                          onClick={(e) => toggleFlip(e, product.id)}
                          aria-label={isFlipped ? 'Show front image' : 'Show back image'}
                        >
                          <span>{isFlipped ? 'Front' : 'Back'}</span>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                            <path d="M3 3v5h5" />
                            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                            <path d="M16 21h5v-5" />
                          </svg>
                        </button>
                      )}
                    </div>

                    {/* Card Info Panel */}
                    <div className={styles.cardInfo}>
                      <h3 className={styles.productTitle}>{product.name}</h3>
                      <div className={styles.priceRow}>
                        <span className={styles.price}>{formatNaira(product.priceKobo)}</span>
                        <span className={styles.shopNowBtn}>
                          {isOutOfStock ? 'Sold Out' : 'Shop Now →'}
                        </span>
                      </div>
                    </div>
                  </Link>

                  {/* Bottom Wick */}
                  <div className={styles.wickBottom}>
                    <span className={styles.wickTipBottom}>▼ BASE {indexStr}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Editorial Plaque in Negative Space below Card 3 & 4 (Desktop) ── */}
          <div className={styles.lowerRightPlaque}>
            <div className={styles.plaqueLeft}>
              <div className={styles.plaqueTitle}>VOL.02 ARCHIVE STAGE</div>
              <div className={styles.plaqueDesc}>400GSM HEAVYWEIGHT · TRACKED LAGOS DISPATCH</div>
            </div>
            <Link href="/shop" className={styles.plaqueBtn}>
              ALL PIECES <span className={styles.arrowIcon}>→</span>
            </Link>
          </div>
        </div>

        {/* ── Mobile Controls (Step Navigator Pills) ── */}
        <div className={styles.mobileControls}>
          <div className={styles.mobilePills}>
            {dropProducts.map((p, i) => (
              <button
                key={p.id}
                type="button"
                className={`${styles.pillBtn} ${activeStep === i ? styles.pillActive : ''}`}
                onClick={() => scrollToCard(i)}
              >
                {String(i + 1).padStart(2, '0')} · {p.category.toUpperCase()}
              </button>
            ))}
          </div>
          <div className={styles.mobileSwipeHint}>
            <span>←</span>
            <span>SWIPE CANDLESTICK STAGE</span>
            <span>→</span>
          </div>
        </div>

      </div>
    </section>
  );
}
