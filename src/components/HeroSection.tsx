'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './HeroSection.module.css';

export default function HeroSection() {
  return (
    <section className={styles.hero} aria-label="AW-26 Campaign Hero">
      {/* 1. LAYER 1: 2.5K Ultra Clean High-Definition Architectural Background */}
      <Image
        src="/assets/campaign/hero-arch-bg.webp"
        alt="Deen Drip Brutalist Architectural Arch Space"
        fill
        priority
        sizes="100vw"
        className={styles.heroBgImage}
      />

      {/* Ambient luxury backlighting and arc glow */}
      <div className={styles.mobileAmbientGlow} />
      <div className={styles.mobileArcGlow} />

      {/* 2. LAYER 2 (Mobile only): Background Model layer positioned in lower-mid area */}
      <div className={styles.mobileModelLayer}>
        <Image
          src="/assets/campaign/hero-models-duo-clean.png"
          alt="Deen Drip Streetwear Models"
          fill
          priority
          sizes="(max-width: 900px) 100vw, 50vw"
          className={styles.mobileModelImage}
        />
      </div>

      {/* 3. LAYER 3: Dark contrast vignette overlay for mobile readability */}
      <div className={styles.heroVignette} />

      <div className="container" style={{ width: '100%', height: '100%' }}>
        <div className={styles.heroGrid}>
          {/* 4. LAYER 4: Brand Typography & Calls-to-Action */}
          <div className={styles.heroContent}>

            {/* ── MOBILE: Exact User Reference Layout (Deen Drip Editorial) ── */}
            <div className={styles.heroContentMobile}>
              {/* Upper Header Block (Centered) */}
              <div className={styles.mobileHeaderBlock}>
                {/* Cyan Capsule Badge */}
                <div className={styles.mobileDropBadge}>
                  AW26 DROP
                </div>

                {/* Massive Condensed Headline */}
                <h1 className={styles.heroTitleMobileRef}>
                  <span>WEAR</span>
                  <span>YOUR DEEN.</span>
                </h1>

                {/* Editorial Subtitle */}
                <p className={styles.heroSubtitleMobileRef}>
                  A collision of faith, identity, and modern streetwear.
                </p>
              </div>

              {/* Bottom Action Group */}
              <div className={styles.heroActionsMobileRef}>
                <Link href="/shop" className={styles.mobilePrimaryBtnRef}>
                  <span>SHOP THE COLLECTION</span>
                  <span className={styles.mobileBtnArrow}>→</span>
                </Link>
                <Link href="/collections" className={styles.mobileSecondaryLinkRef}>
                  EXPLORE THE BRAND
                </Link>
              </div>
            </div>

            {/* ── DESKTOP: Eyebrow badge ── */}
            <div className={styles.heroBadgeDesktop}>
              <span className={styles.badgePulse} />
              <span>NEW COLLECTION · 26</span>
            </div>

            {/* ── DESKTOP: Two-line headline hierarchy ── */}
            <div className={styles.heroTitleGroupDesktop}>
              <h1 className={styles.heroTitlePrimary}>
                Made to Move.
              </h1>
              <div className={styles.heroTitleSecondary}>
                Grounded in Faith.
              </div>
            </div>

            {/* ── DESKTOP: Subtitle ── */}
            <p className={styles.heroSubtitleDesktop}>
              Everyday streetwear with purpose. Premium essentials, relaxed fits, and quality you can feel.
            </p>

            {/* ── DESKTOP: CTAs ── */}
            <div className={styles.heroCtasDesktop}>
              <Link href="/shop" className="btn btn-sky">
                Shop the Collection ↗
              </Link>
              <Link href="/collections" className={styles.exploreBtn}>
                Explore Our Style
              </Link>
            </div>

            {/* ── DESKTOP: Specs ── */}
            <div className={styles.quickSpecs}>
              <div className={styles.specItem}>
                <span className={styles.specDot} />
                <span>280–400 GSM Heavyweight · Free Lagos Delivery on Orders Above ₦85,000</span>
              </div>
            </div>

          </div>

          {/* Desktop Right Column: Model Showcase */}
          <div className={styles.modelShowcaseDesktop}>
            <div className={styles.groundShadow} />

            <div className={styles.modelContainer}>
              <Image
                src="/assets/campaign/hero-models-duo-clean.png"
                alt="Deen Drip Streetwear Models"
                fill
                priority
                sizes="(max-width: 900px) 95vw, 600px"
                className={styles.modelImage}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
