import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getProducts } from '@/lib/db';
import CandleDropSection from '@/components/CandleDropSection';
import HeroSection from '@/components/HeroSection';
import styles from './page.module.css';

export default function HomePage() {
  const allDropProducts = getProducts({ newDropOnly: true });
  const stageSlugs = [
    'deendrip-vt-shirt-black',
    'baseball-jersey-green',
    'multi-colored-jean-cargo-pants-style-1',
    'multi-colored-foam-truckers-style-1'
  ];
  const stageProducts = stageSlugs
    .map(slug => allDropProducts.find(p => p.slug === slug || p.id === slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const featuredProducts = [
    ...stageProducts,
    ...allDropProducts.filter(p => !stageProducts.some(sp => sp.id === p.id))
  ];

  return (
    <>
      {/* AW-26 Architectural & Rotating Model Hero */}
      <HeroSection />

      {/* Assurance Bar — Precision Technical Brand Commitments */}
      <section className={styles.assuranceBar} aria-label="Customer Guarantees">
        <div className="container">
          <div className={styles.assuranceGrid}>
            {/* 1. Nationwide Dispatch */}
            <div className={styles.assuranceItem}>
              <div className={styles.assuranceIcon}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                  <path d="m3.3 7 8.7 5 8.7-5" />
                  <path d="M12 22V12" />
                </svg>
              </div>
              <div className={styles.assuranceContent}>
                <h4 className={styles.assuranceTitle}>Lagos & Nationwide</h4>
                <p className={styles.assuranceText}>Tracked Dispatch</p>
              </div>
            </div>

            {/* 2. Direct Encrypted Settlement */}
            <div className={styles.assuranceItem}>
              <div className={styles.assuranceIcon}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  <circle cx="12" cy="16" r="1.5" />
                </svg>
              </div>
              <div className={styles.assuranceContent}>
                <h4 className={styles.assuranceTitle}>Direct Settlement</h4>
                <p className={styles.assuranceText}>Encrypted Payment</p>
              </div>
            </div>

            {/* 3. 400 GSM Heavyweight Multi-Ply Density */}
            <div className={styles.assuranceItem}>
              <div className={styles.assuranceIcon}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m2 12 10-6 10 6-10 6Z" />
                  <path d="m2 17 10 5 10-5" />
                  <path d="m2 7 10-5 10 5" />
                </svg>
              </div>
              <div className={styles.assuranceContent}>
                <h4 className={styles.assuranceTitle}>400 GSM Heavyweight</h4>
                <p className={styles.assuranceText}>Custom Combed Cotton</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Candlestick Staggered Featured Drop Section */}
      <CandleDropSection products={featuredProducts} />

      {/* 02 // Curated Categories Section (Immediate Shopper Momentum) */}
      <section className={styles.categorySection} aria-label="Shop By Category">
        <div className="container">
          <div className={styles.sectionHeader}>
            <div>
              <span className="section-tag">[ 02 // CURATED CATEGORIES ]</span>
              <h2 className="section-title">Shop By Category</h2>
            </div>
          </div>

          <div className={styles.categoryGrid}>
            <Link href="/shop?category=tees" className={styles.categoryCard}>
              <Image
                src="/assets/products/Deendrip-vt-shirt-black.jpeg"
                alt="Tees & Graphic Tops"
                fill
                sizes="(max-width: 900px) 50vw, 25vw"
                className={styles.catImg}
              />
              <div className={styles.catOverlay} />
              <div className={styles.catContent}>
                <span className={styles.catNumber}>01</span>
                <h3 className={styles.catName}>Tees & Tops</h3>
              </div>
            </Link>

            <Link href="/shop?category=caps" className={styles.categoryCard}>
              <Image
                src="/assets/products/multi-colored-foam-truckers.jpg"
                alt="Caps & Headwear"
                fill
                sizes="(max-width: 900px) 50vw, 25vw"
                className={styles.catImg}
              />
              <div className={styles.catOverlay} />
              <div className={styles.catContent}>
                <span className={styles.catNumber}>02</span>
                <h3 className={styles.catName}>Caps & Headwear</h3>
              </div>
            </Link>

            <Link href="/shop?category=trousers" className={styles.categoryCard}>
              <Image
                src="/assets/products/Multi-colored-Jean-cargo-pants.jpeg"
                alt="Cargo & Pants"
                fill
                sizes="(max-width: 900px) 50vw, 25vw"
                className={styles.catImg}
              />
              <div className={styles.catOverlay} />
              <div className={styles.catContent}>
                <span className={styles.catNumber}>03</span>
                <h3 className={styles.catName}>Cargo & Pants</h3>
              </div>
            </Link>

            <Link href="/shop?category=hoodies-polos" className={styles.categoryCard}>
              <Image
                src="/assets/products/Hoodie-jalab-brown.jpeg"
                alt="Hoodies & Jalabs"
                fill
                sizes="(max-width: 900px) 50vw, 25vw"
                className={styles.catImg}
              />
              <div className={styles.catOverlay} />
              <div className={styles.catContent}>
                <span className={styles.catNumber}>04</span>
                <h3 className={styles.catName}>Hoodies & Jalabs</h3>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 03 // Brand Editorial Split (Cultural Anchor) */}
      <section className={styles.editorialSplit} aria-label="Brand Manifesto">
        <div className="container">
          <div className={styles.splitGrid}>
            <div className={styles.splitImageWrapper}>
              <Image
                src="/assets/products/let-gaza-live-campaign.webp"
                alt="Deen Drip Streetwear Campaign - Fashion That Speaks Deen"
                fill
                sizes="(max-width: 900px) 100vw, 50vw"
                style={{ objectFit: 'cover' }}
              />
            </div>

            <div className={styles.splitContent}>
              <span className={styles.splitTag}>[ 03 // IDENTITY & PHILOSOPHY ]</span>
              <h2 className={styles.splitTitle}>
                Fashion That Speaks Deen.
              </h2>
              <p className={styles.splitP}>
                DEENDRIP was born out of a gap in Nigeria’s fashion scene: the need for authentic Islamic streetwear built on the belief that <strong>your style and your faith can coexist</strong>.
              </p>
              <p className={styles.splitP}>
                Clothing alone does not define a person’s level of faith or relationship with Allah. Inspired by the lyrical reminders of <strong>DEEN Squad</strong>, we transform sacred truths into wearable statements — challenging the narrow assumptions of piety without ever compromising on modesty or street credibility.
              </p>

              <div className={styles.pillarsList}>
                <div className={styles.pillarItem}>
                  <span className={styles.pillarNum}>01</span>
                  <div>
                    <h4 className={styles.pillarTitle}>Unapologetic Faith</h4>
                    <p className={styles.pillarDesc}>Wearable reminders that keep you conscious of your purpose wherever you walk.</p>
                  </div>
                </div>

                <div className={styles.pillarItem}>
                  <span className={styles.pillarNum}>02</span>
                  <div>
                    <h4 className={styles.pillarTitle}>Modest Street Cut</h4>
                    <p className={styles.pillarDesc}>Generous drop-shoulder silhouettes and relaxed streetwear drape respecting Islamic modesty.</p>
                  </div>
                </div>

                <div className={styles.pillarItem}>
                  <span className={styles.pillarNum}>03</span>
                  <div>
                    <h4 className={styles.pillarTitle}>Nigerian Craft & Durability</h4>
                    <p className={styles.pillarDesc}>Heavyweight combed fabrics, 3D puff embroidery, and construction engineered to last.</p>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 'var(--space-6)' }}>
                <Link href="/about" className="btn btn-sky">
                  Read The Full Story ↗
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
