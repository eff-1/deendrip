'use client';

import React from 'react';
import Link from 'next/link';
import type { Category } from '@/lib/types';
import CustomSortDropdown from '@/components/CustomSortDropdown';
import styles from './ShopHeaderFilter.module.css';

interface CategoryMeta {
  value: Category | 'all';
  label: string;
  shortLabel: string;
  tag: string;
  title: string;
  description: string;
}

const CATEGORIES_DATA: CategoryMeta[] = [
  {
    value: 'all',
    label: 'All Pieces',
    shortLabel: 'All',
    tag: '[ CATALOGUE / AW-26 ]',
    title: 'Shop Deen Drip',
    description: 'Faith, culture & contemporary streetwear engineered for daily modest expression.',
  },
  {
    value: 'caps',
    label: 'Caps & Headwear',
    shortLabel: 'Caps',
    tag: '[ HEADWEAR / SIGNATURE ]',
    title: 'Caps & Foam Truckers',
    description: 'Structured high-crown foam truckers, 3D puff embroidery, and honeycomb baseball caps.',
  },
  {
    value: 'tees',
    label: 'Tees & Tops',
    shortLabel: 'Tees',
    tag: '[ HEAVYWEIGHT / 280 GSM ]',
    title: 'Heavyweight Tees & Tops',
    description: 'Structured 280 GSM combed cotton tees, Palestine Kuffi editions, and contrast split-hem layers.',
  },
  {
    value: 'trousers',
    label: 'Cargos & Denim',
    shortLabel: 'Cargos',
    tag: '[ TACTICAL / DENIM ]',
    title: 'Cargo Pants & Denim',
    description: 'Multi-pocket tactical denim cargos with relaxed wide-leg drape and signature thigh embroidery.',
  },
  {
    value: 'hoodies-polos',
    label: 'Hoodie Jalabs & Polos',
    shortLabel: 'Jalabs',
    tag: '[ MODEST / LUXURY FLEECE ]',
    title: 'Hoodie Jalabs & Polos',
    description: 'Modern streetwear hooded jalabs with deep side slits, pouch pockets, and heavyweight luxury fleece.',
  },
  {
    value: 'shirts',
    label: 'Heritage Shirts',
    shortLabel: 'Shirts',
    tag: '[ HERITAGE / RESORT ]',
    title: 'Palestine Heritage Shirts',
    description: 'Statement button-down shirts featuring intricate traditional Palestine Kuffiyeh motifs.',
  }
];

function CategoryIcon({ category }: { category: Category | 'all' }) {
  switch (category) {
    case 'all':
      return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
        </svg>
      );
    case 'caps':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 14a8 8 0 0 1 15-3.5L21 14H4z" />
          <path d="M2 14c4 0 7 1.5 10 1.5s6-1.5 10-1.5" />
          <circle cx="12" cy="7" r="1.2" fill="currentColor" />
        </svg>
      );
    case 'tees':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 3 2 7l3 3 2-2v12h10V8l2 2 3-3-4-4-3 2a3 3 0 0 1-6 0L6 3z" />
        </svg>
      );
    case 'trousers':
      return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 3h14v4l-2 14h-3.5L12 9.5 10.5 21H7L5 7V3z" />
          <line x1="7" y1="12" x2="9" y2="12" />
          <line x1="15" y1="12" x2="17" y2="12" />
        </svg>
      );
    case 'hoodies-polos':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M9 3a3 3 0 0 0-3 3v2l-4 4 3 2.5 1.5-1.5V21h11V13l1.5 1.5 3-2.5-4-4V6a3 3 0 0 0-3-3H9z" />
          <path d="M9 3a3 3 0 0 1 6 0v5a3 3 0 0 1-6 0V3z" />
        </svg>
      );
    case 'shirts':
      return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
          <path d="m9 2 3 5 3-5" />
        </svg>
      );
  }
}

interface ShopHeaderFilterProps {
  currentCategory: Category | 'all';
  currentSort: string;
  productCount: number;
  categoryCounts: Record<string, number>;
}

export default function ShopHeaderFilter({
  currentCategory,
  currentSort,
  productCount,
  categoryCounts,
}: ShopHeaderFilterProps) {
  // Stable active category metadata — zero jitter or bouncing on hover
  const displayCategory = currentCategory || 'all';
  const activeMeta = CATEGORIES_DATA.find(c => c.value === displayCategory) || CATEGORIES_DATA[0];

  return (
    <div className={styles.wrapper}>
      {/* Stable Editorial Hero Banner */}
      <header className={styles.shopHero}>
        <div className="container">
          <div className={styles.heroInner}>
            <div className={styles.heroText}>
              <div className={styles.tagRow}>
                <span className={styles.sectionTag}>{activeMeta.tag}</span>
                <span className={styles.stockLiveBadge}>
                  <span className={styles.livePulse} />
                  {productCount} AUTHENTIC PIECES
                </span>
              </div>
              <h1 className={styles.shopTitle}>{activeMeta.title}</h1>
              <p className={styles.shopSubtitle}>{activeMeta.description}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Modern Capsule Filter & Sort Toolbar */}
      <div className="container">
        <div className={styles.toolbar}>
          <div className={styles.pillsTrackWrapper}>
            <nav className={styles.categoryPillsTrack} aria-label="Filter by collection">
              {CATEGORIES_DATA.map((cat) => {
                const isActive = (cat.value === 'all' && (!currentCategory || currentCategory === 'all')) ||
                  currentCategory === cat.value;
                const href = cat.value === 'all' ? '/shop' : `/shop?category=${cat.value}`;
                const count = categoryCounts[cat.value] || 0;

                return (
                  <Link
                    key={cat.value}
                    href={href}
                    className={`${styles.pillBtn} ${isActive ? styles.pillActive : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span className={styles.pillIcon}>
                      <CategoryIcon category={cat.value} />
                    </span>
                    <span className={styles.pillLabelFull}>{cat.label}</span>
                    <span className={styles.pillLabelShort}>{cat.shortLabel}</span>
                    <span className={styles.pillBadge}>{count}</span>
                  </Link>
                );
              })}
            </nav>
            {/* Visual gradient edge indicating scrollable runway on mobile */}
            <div className={styles.trackFadeRight} aria-hidden="true" />
          </div>

          <div className={styles.sortMeta}>
            <CustomSortDropdown currentSort={currentSort} />
          </div>
        </div>
      </div>
    </div>
  );
}
