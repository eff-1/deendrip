'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './AccountModal.module.css';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomerChange?: (customerName: string | null) => void;
  initialTab?: 'signin' | 'register';
}

interface Customer {
  name: string;
  email: string;
  phone?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  agreeToMarketing?: boolean;
}

export default function AccountModal({
  isOpen,
  onClose,
  onCustomerChange,
  initialTab = 'signin',
}: AccountModalProps) {
  const [activeTab, setActiveTab] = useState<'signin' | 'register'>(initialTab);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [wishlistCount, setWishlistCount] = useState(0);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('Lagos');
  const [state, setState] = useState('Lagos State');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [agreeToMarketing, setAgreeToMarketing] = useState(true);

  // UI feedback states
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copiedVoucher, setCopiedVoucher] = useState<string | null>(null);

  // Sync tab with initialTab prop when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setErrorMsg(null);
    }
  }, [isOpen, initialTab]);

  // Load customer and wishlist count from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('deendrip_customer');
      if (stored) {
        const parsed = JSON.parse(stored);
        setCustomer(parsed);
        if (onCustomerChange) onCustomerChange(parsed.name);
      }
      const wishlist = JSON.parse(localStorage.getItem('deendrip_wishlist') || '[]');
      setWishlistCount(Array.isArray(wishlist) ? wishlist.length : 0);
    } catch {
      // ignore
    }
  }, [isOpen, onCustomerChange]);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email) {
      setErrorMsg('Please enter your email address');
      return;
    }

    const displayName = email.split('@')[0];
    const formattedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
    
    // Check if there is existing stored info for this email
    let user: Customer = {
      name: formattedName,
      email: email.trim().toLowerCase(),
    };

    try {
      const existing = localStorage.getItem('deendrip_customer');
      if (existing) {
        const parsed = JSON.parse(existing);
        if (parsed.email === user.email) {
          user = { ...parsed };
        }
      }
      localStorage.setItem('deendrip_customer', JSON.stringify(user));
    } catch {}

    setCustomer(user);
    if (onCustomerChange) onCustomerChange(user.name);
    setSuccessMsg('Welcome back to Deen Drip!');
    setTimeout(() => {
      setSuccessMsg(null);
      onClose();
    }, 1200);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('Please provide your full name');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please provide a valid email address');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      return;
    }
    if (!agreeToTerms) {
      setErrorMsg('Please accept the Terms & Conditions and Privacy Policy to continue');
      return;
    }

    const user: Customer = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim() || undefined,
      streetAddress: streetAddress.trim() || undefined,
      city: city.trim() || 'Lagos',
      state: state.trim() || 'Lagos State',
      agreeToMarketing,
    };

    setCustomer(user);
    try {
      localStorage.setItem('deendrip_customer', JSON.stringify(user));
    } catch {}

    if (onCustomerChange) onCustomerChange(user.name);
    setSuccessMsg('Welcome to Deen Drip family! Account created.');
    setTimeout(() => {
      setSuccessMsg(null);
      onClose();
    }, 1300);
  };

  const handleSignOut = () => {
    setCustomer(null);
    try {
      localStorage.removeItem('deendrip_customer');
    } catch {}
    if (onCustomerChange) onCustomerChange(null);
    setSuccessMsg('Signed out successfully.');
    setTimeout(() => {
      setSuccessMsg(null);
    }, 1000);
  };

  const copyCode = (code: string) => {
    try {
      navigator.clipboard.writeText(code);
      setCopiedVoucher(code);
      setTimeout(() => setCopiedVoucher(null), 2000);
    } catch {}
  };

  if (!isOpen) return null;

  return (
    <div className={`${styles.overlay} ${isOpen ? styles.overlayOpen : ''}`} onClick={onClose}>
      <div className={styles.modalCard} onClick={e => e.stopPropagation()}>
        <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
          ✕
        </button>

        <div className={styles.modalHeader}>
          <span className={styles.tag}>[ DEEN DRIP MEMBERSHIP ]</span>
          <h2 className={styles.title}>
            {customer ? 'My Account' : activeTab === 'signin' ? 'Sign In' : 'Join Deen Drip'}
          </h2>
        </div>

        {errorMsg && (
          <div className={styles.errorBanner}>
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className={styles.successBanner}>
            {successMsg}
          </div>
        )}

        {customer ? (
          <div className={styles.profileCard}>
            <div className={styles.profileHero}>
              <div className={styles.avatar}>
                {customer.name.charAt(0).toUpperCase()}
              </div>
              <div className={styles.profileMeta}>
                <h3 className={styles.profileName}>{customer.name}</h3>
                <p className={styles.profileEmail}>{customer.email}</p>
                {customer.phone && <p className={styles.profilePhone}>{customer.phone}</p>}
                <span className={styles.verifiedBadge}>✓ Verified Member</span>
              </div>
            </div>

            {/* Quick Stats: Wishlist & Delivery */}
            <div className={styles.statsRow}>
              <Link href="/wishlist" onClick={onClose} className={styles.statBox}>
                <span className={styles.statNum}>{wishlistCount}</span>
                <span className={styles.statLabel}>Saved Items</span>
              </Link>
              <Link href="/vouchers" onClick={onClose} className={styles.statBox}>
                <span className={styles.statNum}>3</span>
                <span className={styles.statLabel}>Active Vouchers</span>
              </Link>
            </div>

            {/* Saved Delivery Info */}
            <div className={styles.infoSection}>
              <div className={styles.infoSectionHeader}>
                <span className={styles.infoSectionTitle}>Default Delivery Address</span>
              </div>
              {customer.streetAddress ? (
                <div className={styles.addressBox}>
                  <p>{customer.streetAddress}</p>
                  <p>{customer.city}, {customer.state || 'Nigeria'}</p>
                </div>
              ) : (
                <p className={styles.emptyNote}>
                  No address saved yet. You can set this during checkout or edit below.
                </p>
              )}
            </div>

            {/* Member Exclusive Vouchers */}
            <div className={styles.voucherSection}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                <span className={styles.infoSectionTitle}>Your Active Member Vouchers (3)</span>
                <Link href="/vouchers" onClick={onClose} style={{ fontSize: '0.74rem', color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 700 }}>
                  View All Terms →
                </Link>
              </div>
              <div className={styles.voucherGrid}>
                <div className={styles.voucherCard} onClick={() => copyCode('FREESHIP')}>
                  <div className={styles.voucherCode}>FREESHIP</div>
                  <div className={styles.voucherDesc}>Free Lagos delivery (₦85k+)</div>
                  <button type="button" className={styles.voucherCopyBtn}>
                    {copiedVoucher === 'FREESHIP' ? 'COPIED ✓' : 'TAP TO COPY'}
                  </button>
                </div>
                <div className={styles.voucherCard} onClick={() => copyCode('DEEN10')}>
                  <div className={styles.voucherCode}>DEEN10</div>
                  <div className={styles.voucherDesc}>10% OFF on all items</div>
                  <button type="button" className={styles.voucherCopyBtn}>
                    {copiedVoucher === 'DEEN10' ? 'COPIED ✓' : 'TAP TO COPY'}
                  </button>
                </div>
                <div className={styles.voucherCard} onClick={() => copyCode('DRIPVIP')}>
                  <div className={styles.voucherCode}>DRIPVIP</div>
                  <div className={styles.voucherDesc}>₦5,000 OFF on orders ₦100k+</div>
                  <button type="button" className={styles.voucherCopyBtn}>
                    {copiedVoucher === 'DRIPVIP' ? 'COPIED ✓' : 'TAP TO COPY'}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className={styles.profileActions}>
              <Link href="/orders" onClick={onClose} className="btn btn-sky btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                Track Orders & Delivery Status ↗
              </Link>
              <Link href="/shop" onClick={onClose} className="btn btn-outline btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                Shop Latest AW-26 Drops →
              </Link>
              <Link href="/wishlist" onClick={onClose} className="btn btn-outline btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                View Saved Items ({wishlistCount})
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className={styles.signOutBtn}
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className={styles.tabs}>
              <button
                type="button"
                className={`${styles.tabBtn} ${activeTab === 'signin' ? styles.tabBtnActive : ''}`}
                onClick={() => { setActiveTab('signin'); setErrorMsg(null); }}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`${styles.tabBtn} ${activeTab === 'register' ? styles.tabBtnActive : ''}`}
                onClick={() => { setActiveTab('register'); setErrorMsg(null); }}
              >
                Create Account
              </button>
            </div>

            {activeTab === 'signin' ? (
              <form onSubmit={handleSignIn} className={styles.form}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className={styles.input}
                    autoComplete="email"
                  />
                </div>

                <div className={styles.formGroup}>
                  <div className={styles.labelRow}>
                    <label className={styles.label}>Password</label>
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={styles.input}
                    autoComplete="current-password"
                  />
                </div>

                <button type="submit" className={`btn btn-sky ${styles.submitBtn}`}>
                  Sign In ↗
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className={styles.form}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Tariq Al-Mansoor"
                    className={styles.input}
                    autoComplete="name"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className={styles.input}
                    autoComplete="email"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Phone Number (WhatsApp Delivery)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+234 800 000 0000"
                    className={styles.input}
                    autoComplete="tel"
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup} style={{ flex: 2 }}>
                    <label className={styles.label}>Delivery Address (Optional)</label>
                    <input
                      type="text"
                      value={streetAddress}
                      onChange={e => setStreetAddress(e.target.value)}
                      placeholder="Street, Estate, Apartment"
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.formGroup} style={{ flex: 1 }}>
                    <label className={styles.label}>City / State</label>
                    <input
                      type="text"
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      placeholder="Lagos"
                      className={styles.input}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Create Password *</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className={styles.input}
                    autoComplete="new-password"
                  />
                </div>

                {/* Consent & Agreements */}
                <div className={styles.checkboxGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={agreeToTerms}
                      onChange={e => setAgreeToTerms(e.target.checked)}
                      className={styles.checkbox}
                      required
                    />
                    <span>
                      I agree to the <Link href="/terms" onClick={onClose} className={styles.policyLink}>Terms</Link> and <Link href="/privacy" onClick={onClose} className={styles.policyLink}>Privacy Policy</Link> *
                    </span>
                  </label>

                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={agreeToMarketing}
                      onChange={e => setAgreeToMarketing(e.target.checked)}
                      className={styles.checkbox}
                    />
                    <span>Receive secret early access drops and seasonal discount codes via email/WhatsApp</span>
                  </label>
                </div>

                <button type="submit" className={`btn btn-sky ${styles.submitBtn}`}>
                  Create Account ↗
                </button>
              </form>
            )}

            <div className={styles.guestNotice}>
              <strong>Note:</strong> Guest checkout is always available without an account. Creating an account gives you saved delivery addresses, order history, and exclusive drop access.
            </div>
          </>
        )}
      </div>
    </div>
  );
}
