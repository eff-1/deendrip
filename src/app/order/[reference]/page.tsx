import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getOrderByReference } from '@/lib/db';
import { formatNaira, formatDate } from '@/lib/formatters';
import styles from './order.module.css';

export const dynamic = 'force-dynamic';

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;
  const order = getOrderByReference(reference);

  if (!order) {
    notFound();
  }

  const isPaid = order.paymentStatus === 'paid';

  return (
    <div className={styles.container}>
      <div className="container">
        <div className={styles.confirmationCard}>
          <div className={styles.successHeader}>
            <div className={styles.checkIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 className={styles.title}>
              {isPaid ? 'Order Confirmed & Paid' : 'Order Placed (Payment Pending)'}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Thank you for supporting Deen Drip. We have sent an email confirmation to <strong>{order.customerEmail}</strong>.
            </p>
            <div className={styles.orderRef}>
              Reference: {order.orderReference}
            </div>
          </div>

          <div className={styles.detailsGrid}>
            <div className={styles.detailCol}>
              <h3>Customer Information</h3>
              <p><strong>{order.customerName}</strong></p>
              <p>{order.customerEmail}</p>
              <p>{order.customerPhone}</p>
            </div>

            <div className={styles.detailCol}>
              <h3>Delivery Destination</h3>
              <p>{order.deliveryAddress}</p>
              <p>{order.deliveryCity}, {order.deliveryState}</p>
              <p style={{ marginTop: '0.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Status: <strong style={{ textTransform: 'uppercase', color: 'var(--accent-primary)' }}>{order.fulfillmentStatus}</strong>
              </p>
            </div>
          </div>

          <div className={styles.itemsSection}>
            <h3>Ordered Items ({order.items?.length || 0})</h3>
            {order.items?.map(item => (
              <div key={item.id} className={styles.itemRow}>
                <div className={styles.itemMeta}>
                  <span className={styles.itemName}>{item.productNameSnapshot}</span>
                  <span className={styles.itemVariant}>{item.variantNameSnapshot} × {item.quantity}</span>
                </div>
                <div className={styles.itemPrice}>{formatNaira(item.subtotalKobo)}</div>
              </div>
            ))}

            <div className={styles.totalsTable}>
              <div className={styles.totalLine}>
                <span>Subtotal</span>
                <span>{formatNaira(order.subtotalKobo)}</span>
              </div>
              <div className={styles.totalLine}>
                <span>Delivery Fee ({order.deliveryState})</span>
                <span>{order.deliveryFeeKobo === 0 ? 'FREE' : formatNaira(order.deliveryFeeKobo)}</span>
              </div>
              <div className={styles.finalTotal}>
                <span>Total Amount Paid</span>
                <span style={{ color: 'var(--accent-primary)' }}>{formatNaira(order.totalKobo)}</span>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: 'var(--space-4)', borderRadius: 'var(--radius-xs)', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <p>
              <strong>Order Tracking & Updates:</strong> Our fulfillment hub in Lagos prepares all orders within 24 hours. You will receive dispatch notifications via SMS and WhatsApp. For support or modifications, reach out to <strong>orders@deendrip.com</strong> with your reference #{order.orderReference}.
            </p>
          </div>

          <div className={styles.actionRow}>
            <Link href="/shop" className="btn btn-primary">
              Continue Shopping ↗
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
