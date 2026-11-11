'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './HeroSection.module.css';

interface SceneConfig {
  id: number;
  label: string;
  bgType: 'image' | 'video';
  bgSrc: string;
  bgAlt: string;
  hasRightColumnModel: boolean;
  modelSrc: string;
  modelAlt: string;
}

const SCENES: SceneConfig[] = [
  {
    id: 0,
    label: '01 // ARCH ATRIUM',
    bgType: 'image',
    bgSrc: '/assets/campaign/hero-arch-bg.webp',
    bgAlt: 'Deen Drip Signature Brutalist Arch Atrium',
    hasRightColumnModel: true,
    modelSrc: '/assets/campaign/hero-models-duo-clean.png',
    modelAlt: 'Deen Drip Streetwear Models Duo',
  },
  {
    id: 1,
    label: '02 // BRUTALIST',
    bgType: 'image',
    bgSrc: '/assets/campaign/hero-brutalist-concrete-bg.jpg',
    bgAlt: 'Deen Drip Brutalist Concrete Architectural Space',
    hasRightColumnModel: true,
    modelSrc: '/assets/campaign/hero-model-tracksuit-clean.png',
    modelAlt: 'Deen Drip AW26 Black & Silver Heavyweight Tracksuit Model',
  },
  {
    id: 2,
    label: '03 // ARCH FILM',
    bgType: 'video',
    bgSrc: '/assets/campaign/hero-architectural-models-composite.mp4',
    bgAlt: 'Deen Drip Campaign Architectural Film with Models',
    hasRightColumnModel: false,
    modelSrc: '',
    modelAlt: '',
  },
];

export default function HeroSection() {
  const [activeBgIndex, setActiveBgIndex] = useState(0); // 0 = Initial Arch Atrium, 1 = Brutalist Concrete, 2 = Arch Film Video

  // 2 minutes interval rotation across all 3 backgrounds with smooth auto-cycle
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBgIndex(prev => (prev + 1) % SCENES.length);
    }, 2 * 60 * 1000); // 2 minutes (120,000ms)
    return () => clearInterval(interval);
  }, []);

  const activeScene = SCENES[activeBgIndex];

  return (
    <section className={styles.hero} aria-label="AW-26 Campaign Hero">
      {/* 1. LAYER 1: Triple Rotating Background (10-minute interval + smooth crossfade) */}
      
      {/* Background Scene 0: Initial Signature Brutalist Arch Atrium */}
      <div className={`${styles.heroBgLayer} ${activeBgIndex === 0 ? styles.heroBgActive : styles.heroBgInactive}`}>
        <Image
          src="/assets/campaign/hero-arch-bg.webp"
          alt="Deen Drip Signature Brutalist Arch Atrium"
          fill
          priority
          quality={92}
          sizes="100vw"
          className={styles.heroBgImage}
        />
      </div>

      {/* Background Scene 1: Brutalist Concrete Architectural Photo */}
      <div className={`${styles.heroBgLayer} ${activeBgIndex === 1 ? styles.heroBgActive : styles.heroBgInactive}`}>
        <Image
          src="/assets/campaign/hero-brutalist-concrete-bg.jpg"
          alt="Deen Drip Brutalist Concrete Architectural Space"
          fill
          priority
          quality={92}
          sizes="100vw"
          className={styles.heroBgImage}
        />
      </div>

      {/* Background Scene 2: Full-Bleed Architectural Film Video with Models (Full 1080p cinema scale, no clipped arms) */}
      <div className={`${styles.heroBgLayer} ${activeBgIndex === 2 ? styles.heroBgActive : styles.heroBgInactive}`}>
        <video
          autoPlay
          loop
          muted
          playsInline
          className={styles.heroBgVideo}
        >
          <source src="/assets/campaign/hero-architectural-models-composite.mp4" type="video/mp4" />
        </video>
        {/* Soft left gradient vignette for high text contrast in video scene */}
        <div className={styles.videoTextContrastBackdrop} />
      </div>

      {/* Ambient luxury backlighting and arc glow */}
      <div className={styles.mobileAmbientGlow} />
      <div className={styles.mobileArcGlow} />

      {/* 2. LAYER 2 (Mobile only): Model overlay on static image scenes */}
      {activeScene.hasRightColumnModel && (
        <div className={styles.mobileModelLayer}>
          <Image
            key={`mobile-image-model-${activeScene.id}`}
            src={activeScene.modelSrc}
            alt={activeScene.modelAlt}
            fill
            priority
            quality={92}
            sizes="(max-width: 900px) 100vw, 50vw"
            className={styles.mobileModelImage}
          />
        </div>
      )}

      {/* Preload secondary model asset so transition is instantaneous */}
      <div style={{ display: 'none' }} aria-hidden="true">
        <Image
          src="/assets/campaign/hero-model-tracksuit-clean.png"
          alt=""
          width={10}
          height={10}
          priority
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

          {/* Desktop Right Column: Model Showcase (Active for image scenes) */}
          <div className={styles.modelShowcaseDesktop}>
            {activeScene.hasRightColumnModel ? (
              <>
                <div className={styles.groundShadow} />
                <div className={styles.modelContainer}>
                  <Image
                    key={`desktop-image-model-${activeScene.id}`}
                    src={activeScene.modelSrc}
                    alt={activeScene.modelAlt}
                    fill
                    priority
                    quality={92}
                    sizes="(max-width: 900px) 95vw, 600px"
                    className={styles.modelImage}
                  />
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* Discrete Luxury Scene Switcher Pill (10-minute automatic cycle + instant preview toggle) */}
      <div className={styles.sceneSwitcher} aria-label="Scene selector">
        {SCENES.map((scene, idx) => (
          <button
            key={scene.id}
            type="button"
            onClick={() => setActiveBgIndex(idx)}
            className={`${styles.sceneBtn} ${activeBgIndex === idx ? styles.sceneBtnActive : ''}`}
            title={`Switch to ${scene.label}`}
          >
            <span className={styles.sceneDot} />
            <span>{scene.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
