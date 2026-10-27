'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { formatNaira } from '@/lib/formatters';
import styles from './checkout.module.css';

const NIGERIAN_STATES = [
  'Lagos',
  'Abuja (FCT)',
  'Rivers',
  'Oyo',
  'Ogun',
  'Kano',
  'Kaduna',
  'Edo',
  'Delta',
  'Kwara',
  'Anambra',
  'Enugu',
  'Ondo',
  'Osun',
  'Plateau',
  'Other States',
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotalKobo, clearCart } = useCart();

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('');
  const [deliveryState, setDeliveryState] = useState('Lagos');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Dynamic delivery fee calculation
  const isLagos = deliveryState.toLowerCase() === 'lagos';
  const deliveryFeeKobo = isLagos
    ? (subtotalKobo >= 8000000 ? 0 : 350000)
    : 650000;

  const totalKobo = subtotalKobo + deliveryFeeKobo;

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: 'var(--space-20) 0', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1rem' }}>
          Your Bag is Empty
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Please add items to your shopping bag before proceeding to checkout.
        </p>
        <Link href="/shop" className="btn btn-sky">
          Explore The Collection ↗
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim() || !deliveryAddress.trim() || !deliveryCity.trim()) {
      setErrorMessage('Please fill in all required delivery fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Submit order to server for validation and creation
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

      // 2. Authorize payment (development simulation or Paystack popup)
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

      // Clear cart on success
      clearCart();

      // Redirect to confirmed order page
      router.push(`/order/${data.orderReference}`);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'An error occurred during checkout');
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className="container">
        <h1 style={{ fontSize: '2.25rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '2rem' }}>
          Secure Checkout
        </h1>

        <div className={styles.checkoutLayout}>
          {/* Checkout Form */}
          <form onSubmit={handleSubmit} className={styles.formCard}>
            {errorMessage && <div className={styles.errorAlert}>{errorMessage}</div>}

            <h2 className={styles.sectionHeading}>
              <span className={styles.stepNum}>01</span> Contact Information
            </h2>
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
                  placeholder="+234 801 234 5678"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  className={styles.input}
                />
              </div>
            </div>

            <h2 className={styles.sectionHeading}>
              <span className={styles.stepNum}>02</span> Delivery Address
            </h2>
            <div className={styles.formGrid}>
              <div className={styles.formGroupFull}>
                <label className={styles.label} htmlFor="address">Street Address *</label>
                <input
                  id="address"
                  type="text"
                  required
                  placeholder="House number, Street name, Estate / Landmark"
                  value={deliveryAddress}
                  onChange={e => setDeliveryAddress(e.target.value)}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="city">City / Area *</label>
                <input
                  id="city"
                  type="text"
                  required
                  placeholder="e.g. Lekki Phase 1, Ikeja, Surulere"
                  value={deliveryCity}
                  onChange={e => setDeliveryCity(e.target.value)}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="state">State *</label>
                <select
                  id="state"
                  value={deliveryState}
                  onChange={e => setDeliveryState(e.target.value)}
                  className={styles.select}
                >
                  {NIGERIAN_STATES.map(st => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.deliveryNotice}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="3" width="15" height="13" />
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
              <div>
                <strong>
                  {isLagos ? 'Lagos Standard Delivery' : 'Nationwide Doorstep Dispatch'}
                </strong>
                : {deliveryFeeKobo === 0 ? 'FREE (Orders over ₦80k)' : formatNaira(deliveryFeeKobo)}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`btn btn-sky ${styles.payBtn}`}
            >
              {isSubmitting ? 'Processing Authoritative Order...' : `Pay ${formatNaira(totalKobo)} Now`}
            </button>

            <div className={styles.securityNote}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>256-Bit Encrypted Direct Merchant Settlement • Paystack Certified</span>
            </div>
          </form>

          {/* Sticky Summary */}
          <div className={styles.summaryCard}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1.25rem' }}>
              Order Summary ({items.length} {items.length === 1 ? 'Item' : 'Items'})
            </h2>

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
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{formatNaira(subtotalKobo)}</span>
            </div>

            <div className={styles.calcRow}>
              <span>Delivery Fee ({deliveryState})</span>
              <span style={{ fontWeight: 700, color: deliveryFeeKobo === 0 ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                {deliveryFeeKobo === 0 ? 'FREE' : formatNaira(deliveryFeeKobo)}
              </span>
            </div>

            <div className={styles.totalRow}>
              <span>Total</span>
              <span style={{ color: 'var(--accent-primary)' }}>{formatNaira(totalKobo)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
