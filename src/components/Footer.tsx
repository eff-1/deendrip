'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from '@/context/ThemeContext';
import styles from './Footer.module.css';

export default function Footer() {
  const { theme, toggleTheme } = useTheme();

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.footerInner}>
          <div className={styles.brandCol}>
            <Image
              src="/assets/brand/deen-drip-logo-white.png"
              alt="Deen Drip"
              width={160}
              height={58}
              className={styles.brandLogo}
            />
            <p className={styles.brandDesc}>
              Faith-driven streetwear. Boldly crafted for identity, culture, and community. Designed in Nigeria for the worldwide movement.
            </p>
          </div>

          <div>
            <h4 className={styles.colTitle}>Collections</h4>
            <ul className={styles.linkList}>
              <li className={styles.linkItem}>
                <Link href="/shop">All Products</Link>
              </li>
              <li className={styles.linkItem}>
                <Link href="/shop?category=tees">Tees & Graphic Tops</Link>
              </li>
              <li className={styles.linkItem}>
                <Link href="/shop?category=caps">Caps & Headwear</Link>
              </li>
              <li className={styles.linkItem}>
                <Link href="/shop?category=tracksuits">Tracksuits & Sets</Link>
              </li>
              <li className={styles.linkItem}>
                <Link href="/shop?category=hoodies-polos">Hoodies & Polos</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className={styles.colTitle}>Customer Care</h4>
            <ul className={styles.linkList}>
              <li className={styles.linkItem}>
                <Link href="/shipping">Shipping & Delivery</Link>
              </li>
              <li className={styles.linkItem}>
                <Link href="/returns">Returns & Exchanges</Link>
              </li>
              <li className={styles.linkItem}>
                <Link href="/faq">Frequently Asked Questions</Link>
              </li>
              <li className={styles.linkItem}>
                <Link href="/contact">Contact Support</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className={styles.colTitle}>Brand & Legal</h4>
            <ul className={styles.linkList}>
              <li className={styles.linkItem}>
                <Link href="/about">About Deen Drip</Link>
              </li>
              <li className={styles.linkItem}>
                <Link href="/terms">Terms of Service</Link>
              </li>
              <li className={styles.linkItem}>
                <Link href="/privacy">Privacy Policy</Link>
              </li>
              <li className={styles.linkItem}>
                <Link href="/admin">Staff Admin Portal</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.bottomBar}>
          <div>
            &copy; 2026 Deen Drip. All rights reserved. Prices in Nigerian Naira (₦).
          </div>

          <div className={styles.themeSelectorWrapper}>
            <button
              type="button"
              onClick={toggleTheme}
              className={styles.themeTogglePill}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                  <span>Dark Mode Active</span>
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                  <span>Light Mode Active</span>
                </>
              )}
            </button>
          </div>

          <div className={styles.haftechCredit}>
            <span>Crafted & Engineered by</span>
            <Image
              src="/assets/brand/haftech-logo.png"
              alt="HafTech"
              width={80}
              height={18}
              className={styles.haftechLogo}
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
