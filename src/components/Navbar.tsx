'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useTheme } from '@/context/ThemeContext';
import SearchBar from '@/components/SearchBar';
import AccountModal from '@/components/AccountModal';
import styles from './Navbar.module.css';

export default function Navbar() {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  const { itemCount, setIsCartOpen } = useCart();
  const { theme, toggleTheme } = useTheme();

  // Navigation states
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [customerName, setCustomerName] = useState<string | null>(null);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  // Cart badge bounce animation state
  const [cartBump, setCartBump] = useState(false);
  const prevCountRef = useRef(itemCount);

  useEffect(() => {
    if (itemCount > prevCountRef.current) {
      setCartBump(true);
      const timer = setTimeout(() => setCartBump(false), 600);
      return () => clearTimeout(timer);
    }
    prevCountRef.current = itemCount;
  }, [itemCount]);

  // Announcement ad banner states (delayed flash-in + dismiss)
  const [announcementVisible, setAnnouncementVisible] = useState(false);
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);

  // Scroll detection: hide on scroll down, reveal liquid glass capsule on scroll up
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const isScrolledRef = useRef(false);
  const isVisibleRef = useRef(true);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    let ticking = false;
    let accumulatedUpScroll = 0;
    let accumulatedDownScroll = 0;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = Math.max(0, window.scrollY);
          const lastScrollY = lastScrollYRef.current;
          const diff = currentScrollY - lastScrollY;

          // 1. At the very top (within 25px)
          if (currentScrollY <= 25) {
            accumulatedUpScroll = 0;
            accumulatedDownScroll = 0;
            if (isScrolledRef.current) {
              isScrolledRef.current = false;
              setIsScrolled(false);
            }
            if (!isVisibleRef.current) {
              isVisibleRef.current = true;
              setIsVisible(true);
            }
          } else {
            // Once scrolled past 25px: liquid glass capsule state active
            if (!isScrolledRef.current) {
              isScrolledRef.current = true;
              setIsScrolled(true);
            }

            if (diff < 0) {
              // Scrolling UP
              accumulatedDownScroll = 0;
              accumulatedUpScroll += Math.abs(diff);

              // Responsive upward toggle: immediately reveal upon >= 3px upward scroll or near top
              if (accumulatedUpScroll >= 3 || currentScrollY < 140) {
                if (!isVisibleRef.current) {
                  isVisibleRef.current = true;
                  setIsVisible(true);
                }
              }
            } else if (diff > 0) {
              // Scrolling DOWN
              accumulatedUpScroll = 0;
              accumulatedDownScroll += diff;

              // Smooth hide: deliberate downward swipe >= 8px past header threshold
              if (accumulatedDownScroll >= 8 && currentScrollY > 70) {
                if (!mobileMenuOpen && !accountDropdownOpen && !mobileSearchOpen) {
                  if (isVisibleRef.current) {
                    isVisibleRef.current = false;
                    setIsVisible(false);
                  }
                }
              }
            }
          }

          lastScrollYRef.current = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mobileMenuOpen, accountDropdownOpen, mobileSearchOpen]);

  // Initial customer & announcement storage check
  useEffect(() => {
    try {
      const stored = localStorage.getItem('deendrip_customer');
      if (stored) {
        const parsed = JSON.parse(stored);
        setCustomerName(parsed.name || null);
      }

      // Check if user explicitly cancelled the announcement bar
      const isCancelled = localStorage.getItem('deendrip_announcement_cancelled') === 'true';
      if (isCancelled) {
        setAnnouncementDismissed(true);
        return;
      }

      // If not cancelled: track impressions (up to 2 per session) then 10 minute cooldown
      const now = Date.now();
      const lastShown = parseInt(localStorage.getItem('deendrip_announcement_last_shown') || '0', 10);
      const impressionCount = parseInt(sessionStorage.getItem('deendrip_announcement_impressions') || '0', 10);
      const tenMinutes = 10 * 60 * 1000;

      if (impressionCount >= 2 && (now - lastShown < tenMinutes)) {
        setAnnouncementDismissed(true);
        const remaining = Math.max(1000, tenMinutes - (now - lastShown));
        const timer = setTimeout(() => {
          sessionStorage.setItem('deendrip_announcement_impressions', '0');
          setAnnouncementDismissed(false);
          setAnnouncementVisible(true);
        }, remaining);
        return () => clearTimeout(timer);
      }

      // Flash in smoothly 1.2s after loading
      const timer = setTimeout(() => {
        setAnnouncementVisible(true);
        sessionStorage.setItem('deendrip_announcement_impressions', (impressionCount + 1).toString());
        localStorage.setItem('deendrip_announcement_last_shown', Date.now().toString());
      }, 1200);

      return () => clearTimeout(timer);
    } catch {}
  }, []);

  // Close account dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setAccountDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

  const handleDismissAnnouncement = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setAnnouncementVisible(false);
    setAnnouncementDismissed(true);
    try {
      localStorage.setItem('deendrip_announcement_cancelled', 'true');
      localStorage.setItem('deendrip_announcement_cancelled_at', Date.now().toString());
    } catch {}
  };

  const logoSrc = theme === 'light'
    ? '/assets/brand/deen-drip-logo-black.png'
    : '/assets/brand/deen-drip-logo-white.png';

  return (
    <>
      {/* Spacer for non-homepage views so page content never hides behind fixed navbar */}
      {!isHomePage && (
        <div
          className={styles.navbarSpacer}
          style={{
            height: announcementVisible && !announcementDismissed ? 'calc(4.5rem + 1.85rem)' : '4.5rem',
          }}
          aria-hidden="true"
        />
      )}

      {/* Unified Fixed Navbar Root */}
      <nav
        className={`${styles.navbarRoot} ${isScrolled ? styles.navbarScrolled : ''} ${isVisible ? styles.navbarVisible : styles.navbarHidden}`}
      >
        {/* 1. Top Announcement Bar (In DOM, cleanly hidden via CSS in .navbarScrolled state) */}
        {announcementVisible && !announcementDismissed && (
          <div className={styles.announcementBar}>
            <Link
              href="/vouchers"
              className={styles.announcementText}
              aria-label="View Active Vouchers & Promo Drops"
            >
              <span className={styles.announcementHighlight}>FREE LAGOS DELIVERY</span>
              <span>ON ORDERS OVER ₦85,000 •</span>
              <span className={styles.announcementAction}>3 ACTIVE PROMOS LIVE →</span>
            </Link>
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
        <header className={`${styles.header} ${isHomePage && !isScrolled ? styles.headerHome : ''}`}>
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

            {/* Customer Account Button with Desktop Dropdown (Jumia Reference) */}
            <div
              className={styles.accountWrapper}
              ref={accountMenuRef}
              onMouseEnter={() => {
                if (typeof window !== 'undefined' && window.innerWidth > 768) {
                  setAccountDropdownOpen(true);
                }
              }}
              onMouseLeave={() => {
                if (typeof window !== 'undefined' && window.innerWidth > 768) {
                  setAccountDropdownOpen(false);
                }
              }}
            >
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined' && window.innerWidth <= 768) {
                    setIsAccountOpen(true);
                  } else {
                    setAccountDropdownOpen(prev => !prev);
                  }
                }}
                className={`${styles.actionBtn} ${accountDropdownOpen ? styles.actionBtnActive : ''}`}
                aria-label="Account login, orders, wishlist and vouchers"
                aria-expanded={accountDropdownOpen}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span className={styles.btnText}>
                  {customerName ? `Hi, ${customerName.split(' ')[0]}` : 'Account'}
                </span>
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className={`${styles.dropdownChevron} ${accountDropdownOpen ? styles.dropdownChevronOpen : ''}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* Desktop Dropdown Popover */}
              {accountDropdownOpen && (
                <div className={styles.accountDropdown}>
                  {customerName ? (
                    <>
                      <div className={styles.dropdownUserBanner}>
                        <div className={styles.dropdownAvatarSmall}>
                          {customerName.charAt(0).toUpperCase()}
                        </div>
                        <div className={styles.dropdownUserBannerText}>
                          <span className={styles.dropdownUserName}>Hi, {customerName}</span>
                          <span className={styles.dropdownUserStatus}>✓ Verified Member</span>
                        </div>
                      </div>

                      <div className={styles.dropdownList}>
                        <button
                          type="button"
                          className={styles.dropdownItem}
                          onClick={() => {
                            setAccountDropdownOpen(false);
                            setIsAccountOpen(true);
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                          <span>My Account</span>
                        </button>

                        <Link
                          href="/orders"
                          className={styles.dropdownItem}
                          onClick={() => setAccountDropdownOpen(false)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                            <line x1="12" y1="22.08" x2="12" y2="12" />
                          </svg>
                          <span>Orders & Tracking</span>
                        </Link>

                        <Link
                          href="/wishlist"
                          className={styles.dropdownItem}
                          onClick={() => setAccountDropdownOpen(false)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                          </svg>
                          <span>Saved Items / Wishlist</span>
                        </Link>

                        <Link
                          href="/vouchers"
                          className={styles.dropdownItem}
                          onClick={() => setAccountDropdownOpen(false)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="2" y="4" width="20" height="16" rx="2" />
                            <line x1="2" y1="10" x2="22" y2="10" />
                          </svg>
                          <span>Vouchers (3 Available)</span>
                        </Link>
                      </div>

                      <div className={styles.dropdownDivider} />

                      <button
                        type="button"
                        className={styles.dropdownLogoutBtn}
                        onClick={() => {
                          try {
                            localStorage.removeItem('deendrip_customer');
                          } catch {}
                          setCustomerName(null);
                          setAccountDropdownOpen(false);
                        }}
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <div className={styles.dropdownAuthPrompt}>
                        <button
                          type="button"
                          className={`btn btn-sky btn-sm ${styles.dropdownAuthBtn}`}
                          onClick={() => {
                            setAccountDropdownOpen(false);
                            setIsAccountOpen(true);
                          }}
                        >
                          Sign In / Register ↗
                        </button>
                      </div>

                      <div className={styles.dropdownDivider} />

                      <div className={styles.dropdownList}>
                        <button
                          type="button"
                          className={styles.dropdownItem}
                          onClick={() => {
                            setAccountDropdownOpen(false);
                            setIsAccountOpen(true);
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                          <span>My Account</span>
                        </button>

                        <Link
                          href="/orders"
                          className={styles.dropdownItem}
                          onClick={() => setAccountDropdownOpen(false)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                            <line x1="12" y1="22.08" x2="12" y2="12" />
                          </svg>
                          <span>Orders & Tracking</span>
                        </Link>

                        <Link
                          href="/wishlist"
                          className={styles.dropdownItem}
                          onClick={() => setAccountDropdownOpen(false)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                          </svg>
                          <span>Saved Items / Wishlist</span>
                        </Link>

                        <Link
                          href="/vouchers"
                          className={styles.dropdownItem}
                          onClick={() => setAccountDropdownOpen(false)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="2" y="4" width="20" height="16" rx="2" />
                            <line x1="2" y1="10" x2="22" y2="10" />
                          </svg>
                          <span>Vouchers (3 Available)</span>
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

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
              className={`${styles.cartBtn} ${cartBump ? styles.cartBump : ''}`}
              aria-label={`Cart with ${itemCount} items`}
            >
              <span className={styles.cartIconWrap}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={styles.cartIconSvg}
                >
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
              </span>
              <span className={`${styles.cartBadge} ${cartBump ? styles.cartBadgeBump : ''}`}>{itemCount}</span>
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
      </nav>

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
                  href="/orders"
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
                  href="/vouchers"
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
                  href="/wishlist"
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
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="9.5" cy="5.5" r="1" fill="currentColor" />
                      <path d="M2.5 15C2.5 8.5 6 6 9.5 6c3.5 0 5.5 3 6 7" />
                      <path d="M15.5 13c2 0 5 .5 6.5 1.5-1.5 1.5-4.5 1.5-7.5 1L2.5 15z" />
                      <path d="M9.5 6.5v8.5" opacity="0.6" strokeDasharray="1.5 1.5" />
                      <path d="M2.5 12.5a2.5 2.5 0 0 1 2.5 2.5" />
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
              href="https://wa.me/2349064147689?text=Hello%20Deen%20Drip%20Concierge,%20I%20have%20an%20inquiry%20regarding%20my%20order"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.whatsappLink}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
              </svg>
              <span>WhatsApp Concierge (+234 906 414 7689)</span>
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
                href="/contact"
                style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textDecoration: 'none' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Direct Support
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
