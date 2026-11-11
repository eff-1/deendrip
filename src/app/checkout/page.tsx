'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { formatNaira } from '@/lib/formatters';
import {
  calculateOrderShipping,
  calculateCartTotalWeightKg,
  ALL_NIGERIAN_STATES,
} from '@/lib/shipping';
import AddressAutocompleteInput from '@/components/AddressAutocompleteInput';
import styles from './checkout.module.css';

interface CustomerSession {
  id?: string;
  username?: string;
  fullName: string;
  email: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotalKobo, clearCart } = useCart();

  // Customer session state
  const [customer, setCustomer] = useState<CustomerSession | null>(null);
  const [isGuestCheckout, setIsGuestCheckout] = useState(false);
  const [authTab, setAuthTab] = useState<'register' | 'signin'>('register');

  // Auth form states (for first-timers or sign in)
  const [authUsername, setAuthUsername] = useState('');
  const [authFullName, setAuthFullName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authAddress, setAuthAddress] = useState('');
  const [authCity, setAuthCity] = useState('');
  const [authState, setAuthState] = useState('Lagos');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Checkout delivery fields
  const [deliveryMode, setDeliveryMode] = useState<'saved' | 'new'>('saved');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('');
  const [deliveryState, setDeliveryState] = useState('Lagos');

  // UI states
  const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load customer on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('deendrip_customer');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.email) {
          const session: CustomerSession = {
            id: parsed.id,
            username: parsed.username || parsed.email.split('@')[0],
            fullName: parsed.fullName || parsed.name || 'Valued Customer',
            email: parsed.email,
            phone: parsed.phone || '',
            streetAddress: parsed.streetAddress || '',
            city: parsed.city || 'Lagos',
            state: parsed.state || 'Lagos',
          };
          setCustomer(session);
          setCustomerName(session.fullName);
          setCustomerEmail(session.email);
          setCustomerPhone(session.phone);
          setDeliveryAddress(session.streetAddress);
          setDeliveryCity(session.city);
          setDeliveryState(session.state);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Dynamic shipping calculation
  const totalWeightKg = calculateCartTotalWeightKg(items);
  const shippingResult = calculateOrderShipping({
    state: deliveryState,
    city: deliveryCity,
    address: deliveryAddress,
    subtotalKobo,
    totalWeightKg,
  });

  const deliveryFeeKobo = shippingResult.deliveryFeeKobo;
  const totalKobo = subtotalKobo + deliveryFeeKobo;

  // Empty Cart State
  if (items.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <div className={styles.emptyBox}>
          <h1 className={styles.emptyTitle}>Your Bag is Empty</h1>
          <p className={styles.emptyText}>Add some pieces to your cart before proceeding to checkout.</p>
          <Link href="/shop" className="btn btn-sky">
            Shop the Collection →
          </Link>
        </div>
      </div>
    );
  }

  // Handle Sign In
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsAuthLoading(true);

    try {
      const res = await fetch('/api/customer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: authEmail,
          password: authPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to sign in');
      }

      const loggedCustomer: CustomerSession = data.customer;
      setCustomer(loggedCustomer);
      localStorage.setItem('deendrip_customer', JSON.stringify(loggedCustomer));

      // Pre-fill checkout delivery fields
      setCustomerName(loggedCustomer.fullName);
      setCustomerEmail(loggedCustomer.email);
      setCustomerPhone(loggedCustomer.phone);
      setDeliveryAddress(loggedCustomer.streetAddress);
      setDeliveryCity(loggedCustomer.city);
      setDeliveryState(loggedCustomer.state || 'Lagos');
      setDeliveryMode('saved');
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Handle First-Timer Sign Up
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (authPassword !== authConfirmPassword) {
      setAuthError('Passwords do not match. Please re-enter your password.');
      return;
    }

    if (authPassword.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      return;
    }

    setIsAuthLoading(true);

    try {
      const res = await fetch('/api/customer/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: authUsername,
          fullName: authFullName,
          email: authEmail,
          phone: authPhone,
          streetAddress: authAddress,
          city: authCity,
          state: authState,
          password: authPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      const newCustomer: CustomerSession = data.customer;
      setCustomer(newCustomer);
      localStorage.setItem('deendrip_customer', JSON.stringify(newCustomer));

      // Pre-fill checkout delivery fields
      setCustomerName(newCustomer.fullName);
      setCustomerEmail(newCustomer.email);
      setCustomerPhone(newCustomer.phone);
      setDeliveryAddress(newCustomer.streetAddress);
      setDeliveryCity(newCustomer.city);
      setDeliveryState(newCustomer.state || 'Lagos');
      setDeliveryMode('saved');
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Handle Order Payment Submission
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim() || !deliveryAddress.trim() || !deliveryCity.trim()) {
      setErrorMessage('Please fill in all required delivery fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Submit order to server
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerEmail,
          customerPhone,
          deliveryAddress,
          deliveryCity,
          deliveryState,
          items: items.map(i => ({ variantId: i.variantId, quantity: i.quantity })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to initialize order');
      }

      // 2. Authorize payment (simulation / Paystack verified gateway)
      const verifyRes = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderReference: data.orderReference,
          paymentReference: `pay_${Date.now()}_sim`,
        }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        throw new Error(verifyData.error || 'Payment verification failed');
      }

      // Clear bag and route to order confirmation
      clearCart();
      router.push(`/order/${data.orderReference}`);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'An error occurred during checkout');
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.pageRoot}>
      <div className={styles.innerWrapper}>

        {/* Top Mobile Collapsible Order Summary Bar */}
        <div className={styles.mobileSummaryAccordion}>
          <button
            type="button"
            onClick={() => setIsMobileSummaryOpen(prev => !prev)}
            className={styles.mobileSummaryToggle}
            aria-expanded={isMobileSummaryOpen}
          >
            <div className={styles.mobileSummaryLeft}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <span>{isMobileSummaryOpen ? 'Hide order summary' : 'Show order summary'}</span>
              <span className={`${styles.mobileChevron} ${isMobileSummaryOpen ? styles.mobileChevronOpen : ''}`}>▾</span>
            </div>
            <span className={styles.mobileSummaryTotal}>{formatNaira(totalKobo)}</span>
          </button>

          {isMobileSummaryOpen && (
            <div className={styles.mobileSummaryDropdown}>
              <div className={styles.itemsList}>
                {items.map(item => (
                  <div key={item.variantId} className={styles.itemRow}>
                    <div className={styles.itemThumb}>
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        sizes="56px"
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    <div className={styles.itemMeta}>
                      <div className={styles.itemName}>{item.name}</div>
                      <div className={styles.itemSub}>Size: {item.size} • Qty: {item.quantity}</div>
                    </div>
                    <div className={styles.itemPrice}>{formatNaira(item.priceKobo * item.quantity)}</div>
                  </div>
                ))}
              </div>

              <div className={styles.calcRow}>
                <span>Subtotal</span>
                <span className={styles.calcVal}>{formatNaira(subtotalKobo)}</span>
              </div>
              <div className={styles.calcRow}>
                <span>Delivery Fee ({deliveryState})</span>
                <span className={`${styles.calcVal} ${deliveryFeeKobo === 0 ? styles.freeText : ''}`}>
                  {deliveryFeeKobo === 0 ? 'FREE (Lagos Promo)' : formatNaira(deliveryFeeKobo)}
                </span>
              </div>
              <div className={styles.totalRow}>
                <span>Total Due</span>
                <span className={styles.totalAmount}>{formatNaira(totalKobo)}</span>
              </div>
            </div>
          )}
        </div>

        <div className={styles.pageHeader}>
          <span className="section-tag">[ OFFICIAL CHECKOUT ]</span>
          <h1 className={styles.title}>Secure Checkout</h1>
        </div>

        {/* ── FLOW 1: Customer NOT Logged In & NOT Guest -> Sign Up / Sign In First ── */}
        {!customer && !isGuestCheckout ? (
          <div className={styles.authGateWrapper}>
            <div className={styles.authCard}>

              {/* Customer Header */}
              <div className={styles.authHeaderBlock}>
                <div className={styles.authBadgeRow}>
                  <span className={styles.authCustomerBadge}>CUSTOMER</span>
                  <span className={styles.authSecurityBadge}>[ 256-BIT SSL SECURED ]</span>
                </div>
                <h2 className={styles.authCardTitle}>
                  {authTab === 'register' ? 'Sign Up (First-Time Customer)' : 'Sign In (Returning Customer)'}
                </h2>
                <p className={styles.authCardSubtitle}>
                  {authTab === 'register'
                    ? 'Enter your contact & delivery info below to save your address and proceed directly to checkout.'
                    : 'Enter your credentials to instantly retrieve your saved address and complete checkout.'}
                </p>
              </div>
              
              {/* Tab Selector */}
              <div className={styles.authTabHeader}>
                <button
                  type="button"
                  onClick={() => { setAuthTab('register'); setAuthError(null); }}
                  className={`${styles.authTabBtn} ${authTab === 'register' ? styles.authTabActive : ''}`}
                >
                  Sign Up (First-Time)
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthTab('signin'); setAuthError(null); }}
                  className={`${styles.authTabBtn} ${authTab === 'signin' ? styles.authTabActive : ''}`}
                >
                  Sign In (Returning)
                </button>
              </div>

              {authError && <div className={styles.errorAlert}>{authError}</div>}

              {/* ── REGISTER TAB (Requested Sign Up Spec) ── */}
              {authTab === 'register' ? (
                <form onSubmit={handleRegisterSubmit} className={styles.authForm}>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="reg-username">Username *</label>
                      <input
                        id="reg-username"
                        type="text"
                        required
                        placeholder="Enter username"
                        value={authUsername}
                        onChange={e => setAuthUsername(e.target.value)}
                        className={styles.input}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="reg-name">Full Name *</label>
                      <input
                        id="reg-name"
                        type="text"
                        required
                        placeholder="Enter your full name"
                        value={authFullName}
                        onChange={e => setAuthFullName(e.target.value)}
                        className={styles.input}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="reg-email">Email Address *</label>
                      <input
                        id="reg-email"
                        type="email"
                        required
                        placeholder="Enter email address"
                        value={authEmail}
                        onChange={e => setAuthEmail(e.target.value)}
                        className={styles.input}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="reg-phone">Phone / WhatsApp Number *</label>
                      <input
                        id="reg-phone"
                        type="tel"
                        required
                        placeholder="Enter your phone number"
                        value={authPhone}
                        onChange={e => setAuthPhone(e.target.value)}
                        className={styles.input}
                      />
                    </div>

                    <div className={styles.formGroupFull}>
                      <label className={styles.label} htmlFor="reg-address">Contact Address *</label>
                      <AddressAutocompleteInput
                        id="reg-address"
                        value={authAddress}
                        onChange={val => setAuthAddress(val)}
                        onPlaceSelected={({ address, city, state }) => {
                          setAuthAddress(address);
                          if (city) setAuthCity(city);
                          if (state) {
                            const matched = ALL_NIGERIAN_STATES.find(s =>
                              s.toLowerCase().includes(state.toLowerCase()) || state.toLowerCase().includes(s.toLowerCase())
                            );
                            if (matched) setAuthState(matched);
                          }
                        }}
                        className={styles.input}
                        placeholder="Enter your contact address (Street, Estate, Landmark)"
                        required
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="reg-city">City / Area *</label>
                      <input
                        id="reg-city"
                        type="text"
                        required
                        placeholder="e.g. Lekki, Ikeja, Surulere"
                        value={authCity}
                        onChange={e => setAuthCity(e.target.value)}
                        className={styles.input}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="reg-state">State / Region *</label>
                      <select
                        id="reg-state"
                        value={authState}
                        onChange={e => setAuthState(e.target.value)}
                        className={styles.select}
                      >
                        {ALL_NIGERIAN_STATES.map(st => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="reg-pass">Password *</label>
                      <input
                        id="reg-pass"
                        type="password"
                        required
                        placeholder="Enter password"
                        value={authPassword}
                        onChange={e => setAuthPassword(e.target.value)}
                        className={styles.input}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="reg-conf">Confirm Password *</label>
                      <input
                        id="reg-conf"
                        type="password"
                        required
                        placeholder="Confirm password"
                        value={authConfirmPassword}
                        onChange={e => setAuthConfirmPassword(e.target.value)}
                        className={styles.input}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isAuthLoading}
                    className={styles.payBtn}
                  >
                    {isAuthLoading ? 'Creating Customer Account...' : 'Sign Up & Continue to Checkout →'}
                  </button>
                </form>
              ) : (
                /* ── SIGN IN TAB ── */
                <form onSubmit={handleSignInSubmit} className={styles.authForm}>
                  <div className={styles.formGridSingle}>
                    <div className={styles.formGroupFull}>
                      <label className={styles.label} htmlFor="login-id">Email or Username *</label>
                      <input
                        id="login-id"
                        type="text"
                        required
                        placeholder="Enter username or email"
                        value={authEmail}
                        onChange={e => setAuthEmail(e.target.value)}
                        className={styles.input}
                      />
                    </div>

                    <div className={styles.formGroupFull}>
                      <label className={styles.label} htmlFor="login-pass">Password *</label>
                      <input
                        id="login-pass"
                        type="password"
                        required
                        placeholder="Enter password"
                        value={authPassword}
                        onChange={e => setAuthPassword(e.target.value)}
                        className={styles.input}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isAuthLoading}
                    className={styles.payBtn}
                  >
                    {isAuthLoading ? 'Signing In...' : 'Sign In & Continue to Checkout →'}
                  </button>
                </form>
              )}

              {/* Guest option */}
              <div className={styles.guestOptionRow}>
                <span>Prefer to order without saving?</span>
                <button
                  type="button"
                  onClick={() => setIsGuestCheckout(true)}
                  className={styles.guestBtn}
                >
                  Continue as Guest ↗
                </button>
              </div>

            </div>
          </div>
        ) : (
          /* ── FLOW 2: LOGGED IN (OR GUEST) -> SEAMLESS EFFORTLESS CHECKOUT ── */
          <div className={styles.checkoutLayout}>
            {/* Left Column: Checkout Delivery & Payment Form */}
            <form onSubmit={handlePaymentSubmit} className={styles.formCard}>
              {errorMessage && <div className={styles.errorAlert}>{errorMessage}</div>}

              {/* Verified Account Status Banner */}
              {customer && (
                <div className={styles.customerWelcomeBar}>
                  <div className={styles.customerWelcomeText}>
                    <span className={styles.welcomeCheck}>✓</span>
                    <div>
                      <strong>Logged In: @{customer.username}</strong>
                      <span className={styles.welcomeSub}>{customer.fullName} · {customer.email}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.removeItem('deendrip_customer');
                      setCustomer(null);
                      setIsGuestCheckout(false);
                    }}
                    className={styles.switchAccountBtn}
                  >
                    Switch Account
                  </button>
                </div>
              )}

              {/* Step 1: Delivery Address Selection */}
              <h2 className={styles.sectionHeading}>
                <span className={styles.stepNum}>01</span> Delivery Address
              </h2>

              {customer && customer.streetAddress ? (
                <div className={styles.addressSelectionGroup}>
                  {/* Option A: Use Saved Address */}
                  <div
                    onClick={() => {
                      setDeliveryMode('saved');
                      setCustomerName(customer.fullName);
                      setCustomerEmail(customer.email);
                      setCustomerPhone(customer.phone);
                      setDeliveryAddress(customer.streetAddress);
                      setDeliveryCity(customer.city);
                      setDeliveryState(customer.state);
                    }}
                    className={`${styles.addressChoiceCard} ${deliveryMode === 'saved' ? styles.addressChoiceActive : ''}`}
                    role="button"
                    tabIndex={0}
                  >
                    <div className={styles.radioIndicator}>
                      <span className={deliveryMode === 'saved' ? styles.radioDotActive : ''} />
                    </div>
                    <div className={styles.addressChoiceContent}>
                      <div className={styles.addressChoiceTitle}>
                        Deliver to Saved Address (Default)
                      </div>
                      <div className={styles.addressDetails}>
                        <strong>{customer.fullName}</strong> • {customer.phone}
                        <br />
                        {customer.streetAddress}, {customer.city}, {customer.state}
                      </div>
                    </div>
                  </div>

                  {/* Option B: Use Different Address */}
                  <div
                    onClick={() => setDeliveryMode('new')}
                    className={`${styles.addressChoiceCard} ${deliveryMode === 'new' ? styles.addressChoiceActive : ''}`}
                    role="button"
                    tabIndex={0}
                  >
                    <div className={styles.radioIndicator}>
                      <span className={deliveryMode === 'new' ? styles.radioDotActive : ''} />
                    </div>
                    <div className={styles.addressChoiceContent}>
                      <div className={styles.addressChoiceTitle}>
                        Deliver to a Different / New Address
                      </div>
                      <div className={styles.addressSubtext}>
                        Specify an alternative recipient, work, or temporary address.
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Address Input Fields (Always visible for Guest or if "New Address" is selected) */}
              {(!customer || deliveryMode === 'new') && (
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="name">Full Name *</label>
                    <input
                      id="name"
                      type="text"
                      required
                      placeholder="e.g. Tariq Al-Hassan"
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="email">Email Address *</label>
                    <input
                      id="email"
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={customerEmail}
                      onChange={e => setCustomerEmail(e.target.value)}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroupFull}>
                    <label className={styles.label} htmlFor="phone">Phone / WhatsApp Number *</label>
                    <input
                      id="phone"
                      type="tel"
                      required
                      placeholder="+234 906 414 7689"
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroupFull}>
                    <label className={styles.label} htmlFor="address">Street Address *</label>
                    <AddressAutocompleteInput
                      id="address"
                      value={deliveryAddress}
                      onChange={val => setDeliveryAddress(val)}
                      onPlaceSelected={({ address, city, state }) => {
                        setDeliveryAddress(address);
                        if (city) setDeliveryCity(city);
                        if (state) {
                          const matched = ALL_NIGERIAN_STATES.find(s =>
                            s.toLowerCase().includes(state.toLowerCase()) || state.toLowerCase().includes(s.toLowerCase())
                          );
                          if (matched) setDeliveryState(matched);
                        }
                      }}
                      className={styles.input}
                      placeholder="House number, Street name, Estate / Landmark"
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="city">City / Area *</label>
                    <input
                      id="city"
                      type="text"
                      required
                      placeholder="e.g. Lekki, Ikeja, Surulere"
                      value={deliveryCity}
                      onChange={e => setDeliveryCity(e.target.value)}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="state">State / Region *</label>
                    <select
                      id="state"
                      value={deliveryState}
                      onChange={e => setDeliveryState(e.target.value)}
                      className={styles.select}
                    >
                      {ALL_NIGERIAN_STATES.map(st => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Step 2: Payment Method */}
              <h2 className={styles.sectionHeading} style={{ marginTop: '2rem' }}>
                <span className={styles.stepNum}>02</span> Payment Method
              </h2>

              <div className={styles.paymentMethodCard}>
                <div className={styles.paymentMethodTop}>
                  <div className={styles.paymentMethodLeft}>
                    <span className={styles.paystackRadioActive} />
                    <div>
                      <strong>Paystack Secured Gateway</strong>
                      <span className={styles.paymentSubtext}>
                        Debit / Credit Cards (Mastercard, Visa, Verve), Bank Transfer, USSD
                      </span>
                    </div>
                  </div>
                  <div className={styles.cardsRow}>
                    <span className={styles.cardPill}>VISA</span>
                    <span className={styles.cardPill}>MC</span>
                    <span className={styles.cardPill}>VERVE</span>
                  </div>
                </div>
              </div>

              {/* Primary Payment Action */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={styles.payBtn}
              >
                {isSubmitting ? 'Processing Payment...' : `Pay ${formatNaira(totalKobo)} with Card / Paystack →`}
              </button>

              <div className={styles.securityNote}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>256-Bit SSL Encrypted Settlement • Paystack Certified Merchant</span>
              </div>
            </form>

            {/* Right Column: Desktop Sticky Order Summary */}
            <div className={styles.desktopSummaryCard}>
              <h2 className={styles.summaryTitle}>
                Order Summary ({items.length} {items.length === 1 ? 'Item' : 'Items'})
              </h2>

              <div className={styles.itemsList}>
                {items.map(item => (
                  <div key={item.variantId} className={styles.itemRow}>
                    <Link
                      href={`/products/${item.slug || item.productId}`}
                      className={styles.itemThumbLink}
                      aria-label={`View ${item.name}`}
                    >
                      <div className={styles.itemThumb}>
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          sizes="56px"
                          style={{ objectFit: 'cover' }}
                        />
                      </div>
                    </Link>
                    <div className={styles.itemMeta}>
                      <Link
                        href={`/products/${item.slug || item.productId}`}
                        className={styles.itemNameLink}
                      >
                        <div className={styles.itemName}>{item.name}</div>
                      </Link>
                      <div className={styles.itemSub}>Size: {item.size} • Qty: {item.quantity}</div>
                    </div>
                    <div className={styles.itemPrice}>{formatNaira(item.priceKobo * item.quantity)}</div>
                  </div>
                ))}
              </div>

              <div className={styles.calcRow}>
                <span>Subtotal</span>
                <span className={styles.calcVal}>{formatNaira(subtotalKobo)}</span>
              </div>

              <div className={styles.calcRow}>
                <span>Delivery Fee ({deliveryState})</span>
                <span className={`${styles.calcVal} ${deliveryFeeKobo === 0 ? styles.freeText : ''}`}>
                  {deliveryFeeKobo === 0 ? 'FREE (Lagos Promo)' : formatNaira(deliveryFeeKobo)}
                </span>
              </div>

              <div className={styles.totalRow}>
                <span>Total Due</span>
                <span className={styles.totalAmount}>{formatNaira(totalKobo)}</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
