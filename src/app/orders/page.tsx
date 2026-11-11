'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { formatNaira, formatDate } from '@/lib/formatters';
import type { Order } from '@/lib/types';
import styles from './orders.module.css';

function OrdersTrackerContent() {
  const searchParams = useSearchParams();
  const initialRef = searchParams.get('ref') || '';

  const [query, setQuery] = useState(initialRef);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchOrders = async (lookupQuery: string) => {
    if (!lookupQuery.trim()) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: lookupQuery.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to lookup order');
        setOrders([]);
      } else {
        setOrders(data.orders || []);
      }
    } catch {
      setErrorMessage('Network error while looking up orders. Please try again.');
      setOrders([]);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  // Initial load: check URL params, or check local storage for customer email
  useEffect(() => {
    if (initialRef) {
      setQuery(initialRef);
      fetchOrders(initialRef);
    } else {
      try {
        const stored = localStorage.getItem('deendrip_customer');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.email) {
            setQuery(parsed.email);
            fetchOrders(parsed.email);
          }
        }
      } catch {}
    }
  }, [initialRef]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders(query);
  };

  const getFulfillmentStep = (status: string) => {
    switch (status) {
      case 'processing':
        return 2;
      case 'shipped':
        return 3;
      case 'delivered':
        return 4;
      default:
        return 1; // pending / placed
    }
  };

  const getProgressLineWidth = (step: number) => {
    switch (step) {
      case 2:
        return '33%';
      case 3:
        return '66%';
      case 4:
        return '100%';
      default:
        return '0%';
    }
  };

  return (
    <div className={styles.container}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.header}>
          <span className="section-tag">[ REAL-TIME WARDROBE TRACKING ]</span>
          <h1 className={styles.title}>Orders & Delivery Status</h1>
          <p className={styles.subtitle}>
            Track your order package, view items purchased, and inspect live fulfillment updates verified by the Deen Drip dispatch studio.
          </p>
        </div>

        {/* Lookup Card */}
        <div className={styles.lookupCard}>
          <form onSubmit={handleSearch} className={styles.lookupForm}>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Enter Order Reference (e.g. DD-84912-X) or Email"
              className={styles.lookupInput}
              required
            />
            <button type="submit" disabled={loading} className="btn btn-sky btn-md">
              {loading ? 'Searching...' : 'Track Order ↗'}
            </button>
          </form>
          <div className={styles.lookupHint}>
            Search using your order reference code from checkout or your registered email address.
          </div>
        </div>

        {errorMessage && (
          <div style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-xs)', marginBottom: '1.5rem', fontSize: '0.88rem' }}>
            {errorMessage}
          </div>
        )}

        {/* Orders Results */}
        {orders.length > 0 ? (
          <div className={styles.ordersList}>
            {orders.map(order => {
              const currentStep = getFulfillmentStep(order.fulfillmentStatus);
              const progressWidth = getProgressLineWidth(currentStep);

              return (
                <div key={order.id} className={styles.orderCard}>
                  {/* Card Header */}
                  <div className={styles.orderHeader}>
                    <div className={styles.orderRefGroup}>
                      <span className={styles.orderRef}>{order.orderReference}</span>
                      <span className={styles.orderDate}>{formatDate(order.createdAt)}</span>
                    </div>
                    <div className={styles.orderBadges}>
                      <span
                        className={
                          order.paymentStatus === 'paid'
                            ? styles.badgePaid
                            : styles.badgePending
                        }
                      >
                        Payment: {order.paymentStatus.toUpperCase()}
                      </span>
                      <span
                        className={
                          order.fulfillmentStatus === 'delivered'
                            ? styles.badgePaid
                            : styles.badgePending
                        }
                      >
                        Fulfillment: {order.fulfillmentStatus.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Visual Tracking Progress Bar */}
                  <div className={styles.trackingSection}>
                    <div className={styles.trackingLabel}>
                      Delivery Timeline: <strong style={{ color: '#0284c7' }}>{order.fulfillmentStatus.toUpperCase()}</strong>
                    </div>

                    <div className={styles.progressTrack}>
                      <div
                        className={styles.progressTrackLine}
                        style={{ width: `calc(${progressWidth} - 40px)` }}
                      />

                      {/* Step 1: Placed */}
                      <div className={styles.trackStep}>
                        <div className={`${styles.stepDot} ${currentStep >= 1 ? styles.stepDotCompleted : ''}`}>
                          {currentStep > 1 ? '✓' : '1'}
                        </div>
                        <span className={`${styles.stepTitle} ${currentStep === 1 ? styles.stepTitleActive : ''}`}>
                          Order Confirmed
                        </span>
                      </div>

                      {/* Step 2: Processing */}
                      <div className={styles.trackStep}>
                        <div
                          className={`${styles.stepDot} ${
                            currentStep > 2
                              ? styles.stepDotCompleted
                              : currentStep === 2
                              ? styles.stepDotActive
                              : ''
                          }`}
                        >
                          {currentStep > 2 ? '✓' : '2'}
                        </div>
                        <span className={`${styles.stepTitle} ${currentStep === 2 ? styles.stepTitleActive : ''}`}>
                          Processing & Packed
                        </span>
                      </div>

                      {/* Step 3: In Transit */}
                      <div className={styles.trackStep}>
                        <div
                          className={`${styles.stepDot} ${
                            currentStep > 3
                              ? styles.stepDotCompleted
                              : currentStep === 3
                              ? styles.stepDotActive
                              : ''
                          }`}
                        >
                          {currentStep > 3 ? '✓' : '3'}
                        </div>
                        <span className={`${styles.stepTitle} ${currentStep === 3 ? styles.stepTitleActive : ''}`}>
                          Dispatched / Transit
                        </span>
                      </div>

                      {/* Step 4: Delivered */}
                      <div className={styles.trackStep}>
                        <div
                          className={`${styles.stepDot} ${
                            currentStep === 4 ? styles.stepDotCompleted : ''
                          }`}
                        >
                          {currentStep === 4 ? '✓' : '4'}
                        </div>
                        <span className={`${styles.stepTitle} ${currentStep === 4 ? styles.stepTitleActive : ''}`}>
                          Delivered
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order Items Body */}
                  <div className={styles.orderBody}>
                    <div className={styles.itemsTitle}>Purchased Wardrobe Pieces ({(order.items || []).length})</div>
                    <div className={styles.itemsList}>
                      {(order.items || []).map(item => (
                        <div key={item.id} className={styles.itemRow}>
                          <div className={styles.itemInfo}>
                            <h4>{item.productNameSnapshot}</h4>
                            <div className={styles.itemMeta}>
                              Size / Specs: <strong>{item.variantNameSnapshot}</strong> • Qty: {item.quantity}
                            </div>
                          </div>
                          <div className={styles.itemPrice}>
                            {formatNaira(item.subtotalKobo)}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Destination and Totals */}
                    <div className={styles.orderFooterGrid}>
                      <div className={styles.destCol}>
                        <h5>Delivery Destination</h5>
                        <div className={styles.destText}>
                          <strong>{order.customerName}</strong><br />
                          {order.deliveryAddress}<br />
                          {order.deliveryCity}, {order.deliveryState}<br />
                          Phone: {order.customerPhone}
                        </div>
                        {order.trackingReference && (
                          <div style={{ marginTop: '0.4rem', fontSize: '0.8rem', color: '#0284c7' }}>
                            Carrier Tracking: <strong>{order.trackingReference}</strong>
                          </div>
                        )}
                      </div>

                      <div className={styles.totalCol}>
                        <h5>Summary & Total</h5>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                          Subtotal: {formatNaira(order.subtotalKobo)}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.45rem' }}>
                          Delivery Fee: {order.deliveryFeeKobo === 0 ? 'FREE' : formatNaira(order.deliveryFeeKobo)}
                        </div>
                        <div className={styles.totalAmount}>
                          {formatNaira(order.totalKobo)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className={styles.orderActions}>
                    <a
                      href={`https://wa.me/2349064147689?text=Hello%20Deen%20Drip,%20I%20am%20inquiring%20about%20my%20order%20${order.orderReference}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.whatsappTrackBtn}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
                      </svg>
                      <span>Inquire about this order on WhatsApp ↗</span>
                    </a>

                    <Link href={`/order/${order.orderReference}`} className="btn btn-outline btn-sm">
                      View Full Invoice Details →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : searched ? (
          <div className={styles.emptyCard}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: 800 }}>No Orders Found</h3>
            <p style={{ maxWidth: '440px', margin: '0 auto 1.5rem', lineHeight: '1.5' }}>
              We could not find any active orders matching &ldquo;{query}&rdquo;. Please verify your reference code or email address.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/shop" className="btn btn-sky btn-sm">
                Shop Latest Drops →
              </Link>
              <Link href="/contact" className="btn btn-outline btn-sm">
                Contact Customer Support
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Loading orders tracker...</div>}>
      <OrdersTrackerContent />
    </Suspense>
  );
}
