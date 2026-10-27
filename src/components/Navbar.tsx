'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useTheme } from '@/context/ThemeContext';
import SearchBar from '@/components/SearchBar';
import AccountModal from '@/components/AccountModal';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { itemCount, setIsCartOpen } = useCart();
  const { theme, toggleTheme } = useTheme();

  // Navigation states
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [customerName, setCustomerName] = useState<string | null>(null);

  // Announcement ad banner states (delayed flash-in + dismiss)
  const [announcementVisible, setAnnouncementVisible] = useState(false);
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);

  // Initial customer & announcement storage check
  useEffect(() => {
    try {
      const stored = localStorage.getItem('deendrip_customer');
      if (stored) {
        const parsed = JSON.parse(stored);
        setCustomerName(parsed.name || null);
      }

      if (sessionStorage.getItem('deendrip_announcement_dismissed') === 'true') {
        setAnnouncementDismissed(true);
      } else {
        // Delayed entrance: 1.4 seconds after loading it flashes/slides up like an ad banner
        const timer = setTimeout(() => {
          setAnnouncementVisible(true);
        }, 1400);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, []);

  // Lock body scroll when mobile menu is open (only drawer scrolls)
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [mobileMenuOpen]);

  const handleDismissAnnouncement = () => {
    setAnnouncementVisible(false);
    setAnnouncementDismissed(true);
    try {
      sessionStorage.setItem('deendrip_announcement_dismissed', 'true');
    } catch {}
  };

  const logoSrc = theme === 'dark'
    ? '/assets/brand/deen-drip-logo-white.png'
    : '/assets/brand/deen-drip-logo-black.png';

  return (
    <>
      {/* 1. Top Announcement Bar (Subtle, delayed slide-in like an ad banner, dismissible) */}
      {announcementVisible && !announcementDismissed && (
        <div className={styles.announcementBar}>
          <span className={styles.announcementText}>
            FREE DELIVERY IN LAGOS ON ORDERS OVER ₦85,000 • NEW AW-26 DROP LIVE
          </span>
          <button
            type="button"
            onClick={handleDismissAnnouncement}
            className={styles.announcementDismissBtn}
            aria-label="Dismiss announcement"
            title="Dismiss announcement"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {/* 2. Main Header */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          {/* LEFT: Mobile Hamburger + Brand Logo + Desktop Nav */}
          <div className={styles.leftSection}>
            {/* Mobile Hamburger Drawer Trigger */}
            <div className={styles.mobileToggle}>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open navigation menu"
                className={styles.actionBtn}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            </div>

            {/* Brand Logo */}
            <Link href="/" aria-label="Deen Drip Home" className={styles.logoLink}>
              <Image
                src={logoSrc}
                alt="Deen Drip"
                width={140}
                height={50}
                priority
                className={styles.logoImg}
              />
            </Link>

            {/* Desktop Navigation Links */}
            <nav className={styles.navLinksDesktop}>
              <Link href="/shop" className={styles.navLink}>
                Shop
              </Link>
              <Link href="/collections" className={styles.navLink}>
                Collections
              </Link>
              <Link href="/about" className={styles.navLink}>
                About
              </Link>
            </nav>
          </div>

          {/* CENTER: Desktop Search Bar with Instant Dropdown */}
          <div className={styles.centerSection}>
            <SearchBar />
          </div>

          {/* RIGHT: Mobile Search Icon -> Account -> Theme Toggle -> Support -> Cart */}
          <div className={styles.rightSection}>
            {/* Mobile Search Icon Button (Inline in the row, placed before Login/Account) */}
            <button
              type="button"
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className={`${styles.mobileSearchBtn} ${mobileSearchOpen ? styles.mobileSearchBtnActive : ''}`}
              aria-label={mobileSearchOpen ? 'Close search' : 'Open search'}
              title="Search store"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>

            {/* Customer Account Button */}
            <button
              type="button"
              onClick={() => setIsAccountOpen(true)}
              className={styles.actionBtn}
              aria-label="Account login or register"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span className={styles.btnText}>
                {customerName ? customerName : 'Account'}
              </span>
            </button>

            {/* Compact Theme Toggle Button (Real SVG Sun / Moon, strictly no emojis) */}
            <button
              type="button"
              onClick={toggleTheme}
              className={styles.themeBtnCompact}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
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
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>

            {/* Desktop Contact / Support Link */}
            <Link
              href="/contact"
              className={`${styles.actionBtn} ${styles.contactBtnDesktop}`}
              aria-label="Contact Customer Support"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span className={styles.btnText}>Support</span>
            </Link>

            {/* Bag / Cart Button */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className={styles.cartBtn}
              aria-label={`Cart with ${itemCount} items`}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              <span className={styles.cartBadge}>{itemCount}</span>
            </button>
          </div>
        </div>

        {/* 3. Expandable Mobile Search Row (Only visible when mobileSearchOpen is true) */}
        {mobileSearchOpen && (
          <div className={styles.mobileSearchExpandable}>
            <SearchBar
              autoFocus={true}
              onClose={() => setMobileSearchOpen(false)}
              onSelect={() => setMobileSearchOpen(false)}
            />
          </div>
        )}
      </header>

      {/* 4. Full-Height Mobile Navigation Drawer (Jumia Reference) */}
      <div
        className={`${styles.drawerBackdrop} ${mobileMenuOpen ? styles.drawerBackdropVisible : ''}`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={`${styles.mobileMenuDrawer} ${mobileMenuOpen ? styles.mobileMenuDrawerOpen : ''}`}
        aria-label="Mobile Navigation Menu"
      >
        {/* Drawer Header: Close '✕' on Left + Logo */}
        <div className={styles.drawerHeader}>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className={styles.drawerCloseBtn}
            aria-label="Close navigation"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <Link href="/" onClick={() => setMobileMenuOpen(false)} className={styles.logoLink}>
            <Image
              src={logoSrc}
              alt="Deen Drip"
              width={115}
              height={40}
              className={styles.drawerLogoImg}
            />
          </Link>
        </div>

        {/* Drawer Scrollable Body */}
        <div className={styles.drawerBody}>
          {/* Section 1: Help & Customer Account */}
          <div className={styles.drawerSection}>
            <Link
              href="/contact"
              className={styles.drawerActionLink}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span>Need Help?</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>

            <button
              type="button"
              className={styles.drawerActionLink}
              onClick={() => {
                setMobileMenuOpen(false);
                setIsAccountOpen(true);
              }}
            >
              <span>{customerName ? `Account (${customerName})` : 'My Deen Drip Account'}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>

            <ul className={styles.drawerSubList}>
              <li>
                <Link
                  href="/shop"
                  className={styles.drawerSubItem}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className={styles.drawerIconWrapper}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                      <line x1="12" y1="22.08" x2="12" y2="12" />
                    </svg>
                  </span>
                  <span>Orders & Delivery Status</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className={styles.drawerSubItem}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className={styles.drawerIconWrapper}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </span>
                  <span>Pending Reviews & Feedback</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/collections"
                  className={styles.drawerSubItem}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className={styles.drawerIconWrapper}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="2" y="6" width="20" height="12" rx="2" />
                      <line x1="2" y1="11" x2="22" y2="11" />
                      <circle cx="7" cy="15" r="1" />
                      <circle cx="17" cy="15" r="1" />
                    </svg>
                  </span>
                  <span>Vouchers & Promo Drops</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/shop"
                  className={styles.drawerSubItem}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className={styles.drawerIconWrapper}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </span>
                  <span>Saved Wishlist</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Section 2: OUR CATEGORIES */}
          <div className={styles.drawerSection}>
            <div className={styles.drawerCategoryHeader}>
              <span className={styles.drawerCategoryTitle}>Our Categories</span>
              <Link
                href="/shop"
                className={styles.drawerSeeAll}
                onClick={() => setMobileMenuOpen(false)}
              >
                See All
              </Link>
            </div>

            <ul className={styles.drawerCategoryList}>
              <li>
                <Link
                  href="/shop?category=tees"
                  className={styles.drawerCategoryItem}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className={styles.drawerIconWrapper}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.5a2 2 0 0 0 1.5 1.63L6 11.2V20a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-8.8l1.64-.38a2 2 0 0 0 1.5-1.63l.58-3.5a2 2 0 0 0-1.34-2.23z" />
                    </svg>
                  </span>
                  <span>Tees & Graphic Tops</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/shop?category=caps"
                  className={styles.drawerCategoryItem}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className={styles.drawerIconWrapper}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M3 14c0-4.4 3.6-8 8-8s8 3.6 8 8v2H3v-2z" />
                      <path d="M3 16h18a3 3 0 0 1 0 6H3v-6z" />
                    </svg>
                  </span>
                  <span>Caps & Headwear</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/shop?category=hoodies-polos"
                  className={styles.drawerCategoryItem}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className={styles.drawerIconWrapper}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M12 2a7 7 0 0 0-7 7v1h14V9a7 7 0 0 0-7-7z" />
                      <path d="M5 10v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V10" />
                      <line x1="12" y1="10" x2="12" y2="15" />
                    </svg>
                  </span>
                  <span>Hoodies & Sweatshirts</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/shop?category=tracksuits"
                  className={styles.drawerCategoryItem}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className={styles.drawerIconWrapper}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M6 3h12l2 18h-5l-3-10-3 10H4L6 3z" />
                    </svg>
                  </span>
                  <span>Tracksuits & Sets</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/collections"
                  className={styles.drawerCategoryItem}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className={styles.drawerIconWrapper}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </span>
                  <span>Curated Drops & AW-26</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Section 3: REAL SVG THEME SWITCHER (strictly NO emojis) */}
          <div className={styles.drawerThemeSection}>
            <div className={styles.drawerThemeLabel}>Appearance Mode</div>
            <div className={styles.themeTogglePill}>
              <button
                type="button"
                onClick={() => {
                  if (theme !== 'light') toggleTheme();
                }}
                className={`${styles.themeOptionBtn} ${theme === 'light' ? styles.themeOptionActive : ''}`}
                aria-label="Switch to light mode"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
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
                <span>Light</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (theme !== 'dark') toggleTheme();
                }}
                className={`${styles.themeOptionBtn} ${theme === 'dark' ? styles.themeOptionActive : ''}`}
                aria-label="Switch to dark mode"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
                <span>Dark</span>
              </button>
            </div>
          </div>

          {/* Section 4: WhatsApp Concierge & Support Links */}
          <div className={styles.drawerFooter}>
            <a
              href="https://wa.me/2348000000000?text=Hello%20Deen%20Drip%20Concierge"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.whatsappLink}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
              </svg>
              <span>Lagos Concierge (+234)</span>
            </a>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.2rem 0.2rem' }}>
              <Link
                href="/about"
                style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textDecoration: 'none' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Brand Manifesto
              </Link>
              <Link
                href="/admin"
                style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textDecoration: 'none' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Staff Portal
              </Link>
            </div>
          </div>
        </div>
      </aside>

      {/* 5. Customer Account Modal */}
      <AccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        onCustomerChange={name => setCustomerName(name)}
      />
    </>
  );
}
