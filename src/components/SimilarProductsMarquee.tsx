'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/lib/types';
import { formatNaira } from '@/lib/formatters';
import styles from './SimilarProductsMarquee.module.css';

interface SimilarProductsMarqueeProps {
  products: Product[];
  currentCategoryTitle?: string;
}

export default function SimilarProductsMarquee({
  products,
  currentCategoryTitle = 'Similar Drops',
}: SimilarProductsMarqueeProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [products]);

  // Gentle auto-scrolling loop when not hovered
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const step = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;

      if (!isPaused && scrollRef.current) {
        // slow smooth drift
        const speed = 0.045; // px per ms
        scrollRef.current.scrollLeft += delta * speed;

        // Reset if reached end
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        if (scrollLeft >= scrollWidth - clientWidth - 2) {
          scrollRef.current.scrollLeft = 0;
        }
        checkScroll();
      }
      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [isPaused]);

  const handleScrollBtn = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 320;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (!products || products.length === 0) return null;

  return (
    <section
      className={styles.section}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setTimeout(() => setIsPaused(false), 2000)}
    >
      <div className={styles.headerRow}>
        <div className={styles.titleGroup}>
          <div className={styles.eyebrow}>
            <span className={styles.indicatorDot} />
            [ COMPLETE THE LOOK / {currentCategoryTitle.toUpperCase()} ]
          </div>
          <h2 className={styles.heading}>You May Also Like</h2>
        </div>

        <div className={styles.controls}>
          <button
            type="button"
            className={`${styles.navBtn} ${!canScrollLeft ? styles.navBtnDisabled : ''}`}
            onClick={() => handleScrollBtn('left')}
            aria-label="Scroll left"
            disabled={!canScrollLeft}
          >
            ←
          </button>
          <button
            type="button"
            className={`${styles.navBtn} ${!canScrollRight ? styles.navBtnDisabled : ''}`}
            onClick={() => handleScrollBtn('right')}
            aria-label="Scroll right"
            disabled={!canScrollRight}
          >
            →
          </button>
        </div>
      </div>

      <div
        className={styles.track}
        ref={scrollRef}
        onScroll={checkScroll}
      >
        {products.map((p, idx) => {
          const primaryImage = p.images.find(img => img.isPrimary) || p.images[0];
          const alternateImage = p.images.find(img => img.isAlternate) || p.images[1] || primaryImage;

          return (
            <div key={p.id} className={styles.itemCard}>
              <Link href={`/products/${p.slug}`} className={styles.imageLink}>
                <div className={styles.imageBox}>
                  {primaryImage && (
                    <Image
                      src={primaryImage.imageUrl}
                      alt={primaryImage.altText || p.name}
                      fill
                      sizes="280px"
                      className={`${styles.productImg} ${styles.primaryImg}`}
                    />
                  )}
                  {alternateImage && alternateImage.imageUrl !== primaryImage?.imageUrl && (
                    <Image
                      src={alternateImage.imageUrl}
                      alt={alternateImage.altText || p.name}
                      fill
                      sizes="280px"
                      className={`${styles.productImg} ${styles.altImg}`}
                    />
                  )}
                  <span className={styles.indexTag}>#{String(idx + 1).padStart(2, '0')}</span>
                </div>
              </Link>

              <div className={styles.itemInfo}>
                <span className={styles.itemCategory}>{p.category.replace('-', ' ')}</span>
                <Link href={`/products/${p.slug}`} className={styles.itemTitle}>
                  {p.name}
                </Link>
                <div className={styles.priceRow}>
                  <span className={styles.itemPrice}>{formatNaira(p.priceKobo)}</span>
                  <Link href={`/products/${p.slug}`} className={styles.viewBtn}>
                    VIEW →
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
