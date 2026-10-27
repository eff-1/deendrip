'use client';

import React, { useState, useEffect } from 'react';
import styles from './AccountModal.module.css';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomerChange?: (customerName: string | null) => void;
}

interface Customer {
  name: string;
  email: string;
  phone?: string;
}

export default function AccountModal({ isOpen, onClose, onCustomerChange }: AccountModalProps) {
  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin');
  const [customer, setCustomer] = useState<Customer | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('deendrip_customer');
      if (stored) {
        const parsed = JSON.parse(stored);
        setCustomer(parsed);
        if (onCustomerChange) onCustomerChange(parsed.name);
      }
    } catch {
      // ignore
    }
  }, [onCustomerChange]);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    const displayName = email.split('@')[0];
    const user: Customer = {
      name: displayName.charAt(0).toUpperCase() + displayName.slice(1),
      email: email,
    };
    setCustomer(user);
    try {
      localStorage.setItem('deendrip_customer', JSON.stringify(user));
    } catch {}
    if (onCustomerChange) onCustomerChange(user.name);
    setSuccessMsg('Signed in successfully!');
    setTimeout(() => {
      setSuccessMsg(null);
      onClose();
    }, 1200);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;
    const user: Customer = {
      name,
      email,
      phone,
    };
    setCustomer(user);
    try {
      localStorage.setItem('deendrip_customer', JSON.stringify(user));
    } catch {}
    if (onCustomerChange) onCustomerChange(user.name);
    setSuccessMsg('Account created successfully!');
    setTimeout(() => {
      setSuccessMsg(null);
      onClose();
    }, 1200);
  };

  const handleSignOut = () => {
    setCustomer(null);
    try {
      localStorage.removeItem('deendrip_customer');
    } catch {}
    if (onCustomerChange) onCustomerChange(null);
    setSuccessMsg('Signed out.');
    setTimeout(() => setSuccessMsg(null), 1000);
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

        {successMsg && (
          <div style={{ padding: '0.65rem', backgroundColor: 'var(--sky-50)', color: 'var(--accent-primary)', border: '1px solid var(--sky-200)', borderRadius: 'var(--radius-xs)', fontSize: '0.82rem', textAlign: 'center', marginBottom: '1rem', fontWeight: 700 }}>
            {successMsg}
          </div>
        )}

        {customer ? (
          <div className={styles.profileCard}>
            <div className={styles.avatar}>
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className={styles.profileName}>{customer.name}</h3>
              <p className={styles.profileEmail}>{customer.email}</p>
              {customer.phone && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{customer.phone}</p>}
            </div>

            <div className={styles.profileActions}>
              <a href="/shop" onClick={onClose} className="btn btn-sky btn-sm">
                Shop The Latest Drop
              </a>
              <button
                type="button"
                onClick={handleSignOut}
                className="btn btn-outline btn-sm"
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
                onClick={() => setActiveTab('signin')}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`${styles.tabBtn} ${activeTab === 'register' ? styles.tabBtnActive : ''}`}
                onClick={() => setActiveTab('register')}
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
                    placeholder="you@example.com"
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={styles.input}
                  />
                </div>

                <button type="submit" className={`btn btn-sky ${styles.submitBtn}`}>
                  Sign In ↗
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className={styles.form}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Tariq Al-Mansoor"
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Phone Number (WhatsApp)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+234 800 000 0000"
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Create password"
                    className={styles.input}
                  />
                </div>

                <button type="submit" className={`btn btn-sky ${styles.submitBtn}`}>
                  Create Account ↗
                </button>
              </form>
            )}

            <div className={styles.guestNotice}>
              <strong>Notice:</strong> Guest checkout is 100% free with zero registration required. Creating an account lets you save addresses and track deliveries.
            </div>
          </>
        )}
      </div>
    </div>
  );
}
